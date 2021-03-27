import {CountDownTimer} from '../modules/countdown.js';
import {CustomFilter} from '../modules/custom-filter.js';
import '../../node_modules/keyboardjs/dist/keyboard.js';


var filters = {};
const popQpost = `if(location.origin === 'https://qiita.com'){document.querySelector('.fa.fa-fw.fa-flag').click();document.querySelector('input[type=radio][value=spam]').click();}`;
const param = new URLSearchParams();
const ID = id => document.getElementById(id);
const tag = (tag, id, cls, f = e => e) => {
	let e = document.createElement(tag);
	if (id) e.id = id;
	if (cls) e.className = cls;
	return f(e);
};
const txt = s => document.createTextNode(s);
const addDocEv = (ev, fn) => {
	document.addEventListener(ev, fn);
};
const addEvent = (id, ev, fn) => {
	let e = ID(id);
	e.addEventListener(ev, fn);
	return e;
};
const addElEv = (el, ev, fn) => {
	el.addEventListener(ev, fn);
	return el;
};
const getInputNum = id => parseInt(ID(id).value);
const setInputNum = (id, v) => ID(id).value = v;
const between = (val, from, to) => from <= val && val <=to;
const decoder = new TextDecoder();
const postCount = num => {
	var suf = 'th';
	switch (num) {
		case 1: suf = 'st'; break;
		case 2: suf = 'nd'; break;
		case 3: suf = 'rd';
		default:
	}
	return `${num}${suf}`;
};

const escapeBody = str => str.replace(/[&"'`<>]/g, match => {
	return {
		'&' : '&amp;',
		"'" : '&#x27;',
		'"' : '&quot;',
		'`' : '&#x60;',
		'<' : '&lt;',
		'>' : '&gt;'
	}[match];
}).replace(/\n/g, '<br>');

const getFilter = () => fetch('resources/filters/filter.json')
.then(v => v.json())
.then(json => {
	let li = [];
	for (let path in json)
		for (let file of json[path]?.files)
			li.push(import(`../../resources/filters/${path}/${file}`).then(v => v.default));

	Promise.all(li).then(v => new CustomFilter(v)).then(v => {filters = v})
});

const REJECT = {
	list: [],
	map: new Map(),
	autoExportSize: 100,
	get exportStr() {
		return JSON.stringify(Array.from(this.map.values()), null, '\t');
	},
	add (data = {}) {this.map.set(data.id, data);},
	clear() {this.map.clear();},
	f(e) {return !this.includes(e.id) ? this.push(e.id) : false},
	exportData() {
		writeFile(REJECT.exportStr);
		REJECT.clear();
	}
};

const onload = () => document.readyState !== 'complete'
	? new Promise(r => document.addEventListener('readystatechange', () => {
		switch (document.readyState) {
			case 'complete': r();break;
			default:
		}
	}))
	: Promise.resolve();

onload().then(_ => {
	getFilter();
	initEv();
	shortcuts();
	autoReload();
});

const reloadView = () => getItems().then(updateView);

const initEv = () => {
	addEvent('newitem', 'click', reloadView);
	addEvent('export', 'click', REJECT.exportData);
	addEvent('testData', 'click', _ => updateView(JSON.parse(decoder.decode(readSample()))));
	addEvent('firstPostFilter', 'click', e => {
		e.target.classList.toggle('btn_on');
		e.target.dataset.firstPostFlg = e.target.classList.contains('btn_on');
	});
	addDocEv('beforeunload', checkQuit);
};

const nextPage = () => setInputNum('page', (v => between(v + 1, 1, 100) ? v + 1 : 100)(getInputNum('page')));
const prevPage = () => setInputNum('page', (v => between(v - 1, 1, 100) ? v - 1 : 100)(getInputNum('page')));
const toStart = () => setInputNum('page', 1);
const toEnd = () => setInputNum('page', 100);
const checkQuit = () => REJECT.map.size ? REJECT.exportData() : void 0;
const autoReload = () => {
	new CountDownTimer({
		start: {minute: 2},
		ontimerzero: function() {
			this.restart();
			reloadView();
		}
	});
}

const shortcuts = () => {
	keyboardJS.on('enter', reloadView);
	keyboardJS.on('right', nextPage);
	keyboardJS.on('left', prevPage);
	keyboardJS.on('ctrl + right', toStart);
	keyboardJS.on('ctrl + left', toEnd);
};

function getItems() {
	param.set('per_page', getInputNum('per_page'));
	param.set('page', getInputNum('page'));
	var firstPostFlg = ID('firstPostFilter').dataset.firstPostFlg;

	return fetch(`https://qiita.com/api/v2/items?${param}`).then(r => {
		if (r.ok) return r.json();
		throw 'Fail';
	}).then(d => d.map(p => firstPostFlg
		? p.user.items_count < post_count_filter_lim
			? p
			: void 0
		: p
		).reduce((a, b) => {if (b) a.push(b); return a;}, [])
	).catch(console.error);
}

function updateView(items) {
	const content = tag('div', 'contentList');

	let jumpItems = items.map(item => {
		let post = {
			id: item.id,
			title: item.title,
			url: item.url,
			tags: item.tags,
			body: item.body
		};
		filters.check(item);
		if (filters.result) console.log(post);
		content.appendChild(toArticle(item));
		content.querySelector(`#_${item.id}`).dataset.post = JSON.stringify(post);

		return `<div class="jumpItem"><a href="#_${item.id}">${escapeBody(item.title)}</a></div>`;
	});
	ID('jumpList').innerHTML = jumpItems.join('');
	[...ID('view').children].forEach(v => v.remove());
	ID('view').append(content);

}

function toArticle(item) {
	let wrap = tag('article', `_${item.id}`, null, article => {
		article.append(
			tag('h3', null, 'itemTitle', v => (v.appendChild(txt(item.title)), v)),
			tag('div', null, null, el => {
				el.append(
					tag('button', null, 'btn markNG', b => (b.appendChild(txt('mark NG')), addElEv(b, 'click', e => {
						REJECT.add(JSON.parse(e.target.closest('article').dataset.post));
					}))),
					tag('button', null, 'btn reportSpam', b => (b.appendChild(txt('Report spam')), addElEv(b, 'click', e => {
						let item = JSON.parse(e.target.closest('article').dataset.post);
						REJECT.add(item);
						reportSpam(item);
					})))
				);
				return el;
			}),
			tag('div', null, 'reason', e => (e.append(`NG reason : ${filters.reason}`), e)),
			tag('div', null, 'user', e => {
				e.append(
					txt('UserID : '),
					tag('a', null, null, a => {
						a.href = `https://qiita.com/${item.user.id}`;
						a.target = '_userWin';
						a.append(item.user.id);
						return a;
					})
				);
				return e;
			}),
			tag('div', null, null, e => {
				e.append(`Post: ${postCount(item.user.items_count)}`);
				return e;
			}),
			tag('div', null, 'tags', e => {
				 e.append(
					txt('Tag : '),
					...item.tags.map(t => tag('span', null, null, sp => sp.append(t)))
				);
				 return e;
			}),
			tag('div', null, 'url', e => {
				e.append(tag('a', null, null, a => {
					a.target = '_postWin';
					a.append(item.url);
					return a;
				}));
				return e;
			}),
			tag('div', null, 'itemBody', e => {
				e.append(escapeBody(item.body));
				return e;
			})
		);
		return article;
	});
	return wrap;
}

function reportSpam(item) {
	let win = open(`${item.url}`, 'qiita');
	win.setInterval(popQpost);
}