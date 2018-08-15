const moduleAlias = require('module-alias')();
const {CustomFilter, CountDownTimer} = require('modreader');
window.$ = window.jQuery = require('jquery');
const moment = require('moment');
const fs = require('fs');

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
	autoReload();
});

function initJqEvent() {
	$('#newitem').on('click', reloadView);

	$('#testData').on('click', function() {
		updateView(JSON.parse(readFile('./resources/test/sample.json')));
	});

	$('#export').on('click', REJECT.exportData);

	$(document).on('click', '.markNG', function() {
		REJECT.add($(this).closest('article').data('post'));
	});

	$(document).on('beforeunload', checkQuit);
}

function checkQuit() {
	if (REJECT.map.size) REJECT.exportData();
}

function autoReload() {
	new CountDownTimer({
		start: {minute: 2},
		ontimerzero: function() {
			this.restart();
			reloadView();
		}
	});
}

function reloadView() {
	getItems().then(updateView);
}

function getItems() {
	param.set('per_page', $('#per_page').val());

	return fetch(`https://qiita.com/api/v2/items?${param}`).then(r => {
		if (r.ok) return r.json();
		throw 'Fail';
	}).catch(console.error);
}

function updateView(items) {
	var content = $('<div id="contentList"></div>');
	for (var item of items) {
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
	}

	$('#view').empty().append(content.children());
}

function toArticle(item) {
	return $(`
<article id="${item.id}">
	<h3 class="itemTitle">${item.title}</h3>
	<div><button class="btn markNG">mark NG</button></div>
	<div class="reason">NG reason : ${CustomFilter.reason} </div>
	<div class="user">UserID : ${item.user.id}</div>
	<div class="tags">Tag : <span>${item.tags.map((tag) => tag.name).join('</span><span>')}</span></div>
	<div class="url">URL : ${item.url}</div>
	<div class="itemBody">${escapeBody(item.body)}</div>
</article>`);
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

function readFile(path) {return fs.readFileSync(path, 'utf8');}
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
