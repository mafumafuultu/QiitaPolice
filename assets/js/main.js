const moduleAlias = require('module-alias')();
const {CustomFilter, CountDownTimer} = require('modreader');
window.$ = window.jQuery = require('jquery');
const moment = require('moment');
var keyboardJS = require('keyboardjs');

const fs = require('fs');
const post_count_filter_lim = 2;
const popQpost = `if(location.origin === 'https://qiita.com'){document.querySelector('.fa.fa-fw.fa-flag').click();document.querySelector('input[type=radio][value=spam]').click();}`;
document.addEventListener('onresize', () => {
	var v;
	function mytimer() {
		clearTimeout(v);
		v = setTimeout(() => {
			$('#jumpList').css({height: `${innerHeight}px`});
		}, 500);
	}
	mytimer();
});
var param;
var REJECT = {
	// このREJECTはファイルに追記していくデータをためるために使う。
	// Exportしたデータを使用して、パターン見つけてフィルタ更新していくと良いと思う。
	list: [],
	map : new Map(),
	autoExportSize : 100,
	get exportStr() {
		return JSON.stringify(Array.from(this.map.values()), null, '\t');
	},//JSON.stringify(this.list.map((d) => d.body), null, '\t');},
	add(data = {}) {this.map.set(data.id, data);},
	clear() {this.map.clear()},
	f(e) {return !this.includes(e.id) ? this.push(e.id) : false;},
	exportData() {
		write(`./resources/reject/rejected-${moment().format('YYYYMMDD-HH')}.txt`, REJECT.exportStr);
		REJECT.clear();
	}
};

$(function() {
	param = new URLSearchParams();
	initJqEvent();
	initShortcut();
	autoReload();
});

function initJqEvent() {
	$('#newitem').on('click', reloadView);

	$('#testData').on('click', function() {
		updateView(JSON.parse(readFile('./resources/test/sample.json')));
	});

	$('#export').on('click', REJECT.exportData);

	$('#firstPostFilter').on('click', function(e, d) {
		let me = $(this);
		me.toggleClass('btn_on').data('firstPostFlg', me.hasClass('btn_on'));
	});

	$(document).on('click', '.markNG', function() {
		REJECT.add($(this).closest('article').data('post'));
	});
	$(document).on('click', '.reportSpam', function() {
		let item = $(this).closest('article').data('post');
		REJECT.add(item);
		reportSpam(item);
	});

	$(document).on('beforeunload', checkQuit);
}

function initShortcut() {
	keyboardJS.on('enter', reloadView);
	keyboardJS.on('right', nextPage);
	keyboardJS.on('left', prevPage);
	keyboardJS.on('ctrl + right', toStart);
	keyboardJS.on('ctrl + left', toEnd);
}

function nextPage() {var v = parseInt($('#page').val());$('#page').val( between(v + 1, 1, 100) ? v + 1 : 100);}
function prevPage() {var v = parseInt($('#page').val());$('#page').val( between(v - 1, 1, 100) ? v - 1 : 1);}
function toStart() {$('#page').val(1);}
function toEnd() {$('#page').val(100);}

function checkQuit() {if (REJECT.map.size) REJECT.exportData();}

function autoReload() {
	new CountDownTimer({
		start: {minute: 2},
		ontimerzero: function() {
			this.restart();
			reloadView();
		}
	});
}

const reloadView = () => getItems().then(updateView);

const reloadUser = () => getUsers().then(reMapUser);

function getUsers() {
	param.set('per_page', $('#per_page').val());
	param.set('page', $('#page').val());

	return fetch(`https://qiita.com/api/v2/users?${param}`).then(r => {
		if (r.ok) return r.json();
		throw 'Fail';
	}).catch(console.error);
}

const reMapUser = arr => arr.map(userFilter);

function userFilter(obj) {
	let {id, name, description, website_url} = obj;
	return {
		id: id,
		name: name,
		description: description,
		website_url: website_url,
		userPage : `https://qiita.com/${id}`,
		userpageLink: `<a href="https://qiita.com/${id}">@${id}</a>`
	};
}

function getItems() {
	param.set('per_page', $('#per_page').val());
	param.set('page', $('#page').val());
	firstPostFlg = $('#firstPostFilter').data('firstPostFlg');

	return fetch(`https://qiita.com/api/v2/items?${param}`).then(r => {
		if (r.ok) return r.json();
		throw 'Fail';
	}).then(d => {
		return d.map(p => {
			if (firstPostFlg) {
				if (p.user.items_count < post_count_filter_lim) return p;
			} else {
				return p;
			}
		}).reduce( (a, b) => {if (b) a.push(b); return a;}, []);
	}).catch(console.error);
}

function updateView(items) {
	var content = $('<div id="contentList"></div>');
	let jumpItems = items.map(item => {
		// リジェクトしたデータのうち、NGパターンを探すときに欲しいモノ
		var post = {
			id: item.id,
			title: item.title,
			url: item.url,
			tags: item.tags,
			body: item.body
		};
		CustomFilter.check(item);
		if (CustomFilter.result) REJECT.add(post);
		content.append(toArticle(item));
		content.find(`#${item.id}`).data('post', post);

		return `<div class="jumpItem"><a href="#${item.id}">${escapeBody(item.title)}</a></div>`;
	});
	$('#jumpList').html(jumpItems.join(''));
	$('#view').html(content.children());
}

function toArticle(item) {
	return $(`
<article id="${item.id}">
	<h3 class="itemTitle">${item.title}</h3>
	<div><button class="btn markNG">mark NG</button> <button class="btn reportSpam">Report spam</button></div>
	<div class="reason">NG reason : ${CustomFilter.reason} </div>
	<div class="user">UserID : <a href="https://qiita.com/${item.user.id}" target="_userWin">${item.user.id}</a></div>
	<div class="">Post: ${postCount(item.user.items_count)} </div>
	<div class="tags">Tag : <span>${item.tags.map((tag) => tag.name).join('</span><span>')}</span></div>
	<div class="url">URL : <a href="${item.url}" target="_postWin">${item.url}</a></div>
	<div class="itemBody">${escapeBody(item.body)}</div>
</article>`);
}

function postCount(num) {
	var suf = 'th';
	switch (num) {
		case 1:
			suf = 'st'
			break;
		case 2:
			suf = 'nd'
			break;
		case 3:
			suf = 'rd';
		default:

	}
	return `${num}${suf}`;
}

function escapeBody(str) {
	return str.replace(/[&"'`<>]/g, (match) => {
		return {
			'&' : '&amp;',
			"'" : '&#x27;',
			'"' : '&quot;',
			'`' : '&#x60;',
			'<' : '&lt;',
			'>' : '&gt;'
		}[match];
	}).replace(/\n/g, '<br>');
}

function reportSpam(item) {
	let win = open(`${item.url}`, 'qiita');
	win.eval(popQpost);
}


function write(path, appendTxt = '') {
	try {
		if (fs.existsSync(path)) {
			fs.appendFileSync(path, appendTxt);
		} else {
			fs.writeFileSync(path, appendTxt);
		}
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
}

const readFile = (path) => fs.readFileSync(path, 'utf8');
const between = (val, from, to) => from <= val && val <= to;
