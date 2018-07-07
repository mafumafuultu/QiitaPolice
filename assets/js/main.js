window.$ = window.jQuery = require('jquery');
const moment = require('moment');
const fs = require('fs');

var FILTER = {
	INIT : {
		list: [],
		reason:'',
		_path: './resources/filters/ngword.json',
		newReg: function() {
			this._reg = new RegExp(`\\b${this.list.join('\\b|\\b')}\\b`,'gi');
		},
		init: function() {
			var data = JSON.parse(readFile(this._path));
			this.list = data.filter;
			console.log(data);
			this.newReg();
		},
		check: function(txt) {
			this._reg.lastIndex = 0;
			this._result = this._reg.test(txt);
		},
		get result() {return this._result;},
		get elem() {return this._result ? this.reason : '';}
	},
	REJECT: {
		// このREJECTはファイルに追記していくデータをためるために使う。
		// Exportしたデータを使用して、パターン見つけてフィルタ更新していくと良いと思う。
		list: [],
		get exportStr() {return JSON.stringify(this.list, null, '\t');},
		add: function(data) {this.list.push(data);},
		clear: function() {this.list = [];},
		distinctTitle: function() {this.list = this.list.filter(this.f, []);},
		f: function(e) {
			if (!this.includes(e.title)) {
				this.push(e.title);
				return true;
			}
		}

	}
};
FILTER.NG_WORD = $.extend(false, FILTER.INIT, {
	reason:'<span class="ngword">ng word</span>',
	_path: './resources/filters/ngword.json',
	newReg: function() {
		/* TODO : 2018/07/07 mafumafuultu :
			正規表現をもう少し検討する
			英単語には強いけども…
		*/
		this._reg = new RegExp(`\\b${this.list.join('\\b|\\b')}\\b`,'gi');
	},
});
FILTER.NG_IDIOM = $.extend(false, FILTER.INIT, {
	reason: '<span class="ngidiom">ng idiom</span>',
	_path: './resources/filters/ngidiom.json',
	newReg: function() {
		this._reg = new RegExp(`${this.list.join('|')}`,'gi');
	},
});

$(function() {
	FILTER.NG_WORD.init();
	FILTER.NG_IDIOM.init();
	console.clear();
	console.log('complete');
	initJqEvent();
});

function initJqEvent() {
	$('#newitem').on('click', reloadView);
	$('#testData').on('click', function() {
		var testData = [{
			title: 'これはサンプルのデータ check ng word',
			body: 'サンプルテキストを入れて実験してる。 testdata が入っているみたい',
			tags: [{name: 'test'}, {name:  'data'}, {name: 'sample'}],
			url: 'https://example.com',
			user: {
				id: 'testname124',
			}
		}, {
			title: 'これはサンプルのデータ2 chaeck ng idiom',
			body: 'サンプルテキストを入れて実験してる。 gentleman call girl ngwordが入っているみたい。 test data ',
			tags: [{name: 'test'}, {name:  'data'}, {name: 'sample'}],
			url: 'https://example.com',
			user: {
				id: 'testname124',
			}
		}];
		updateView(testData);}
	);
	$('#export').on('click', function() {
		write(`./resources/reject/rejected-${moment(Date.now()).format('YYYY-MM-DD')}.txt`, FILTER.REJECT.exportStr);
		FILTER.REJECT.clear();
	});

	$(document).on('click', '.markNG', function() {
		var postData = $(this).closest('article').data('post');
		FILTER.REJECT.add(postData);
		FILTER.REJECT.distinctTitle();
	})
}

function reloadView() {
	getItems()
	.then(updateView, failedLog);
}

function getItems() {
	return $.get('https://qiita.com/api/v2/items');
}

function updateView(items) {
	var content = $('<div id="contentList"></div>');
	for (var item of items) {
		// 正直言えば、　/^\d+$/ にマッチするユーザはフィルタしたい……。
		FILTER.NG_WORD.check(item.body);
		FILTER.NG_IDIOM.check(item.body);
		if (FILTER.NG_WORD.result || FILTER.NG_IDIOM.result) FILTER.REJECT.add(item);
		content.append(toArticle(item));
		content.find(`#${item.id}`).data('post', item);
	}
	$('#view').empty().append(content.children());
	FILTER.REJECT.distinctTitle();
}

function toArticle(item) {
	return $(`
<article id="${item.id}">
<h3>${item.title}</h3>
<div><button class="btn markNG">mark NG</button></div>
<div>Filter : ${FILTER.NG_WORD.elem}${FILTER.NG_IDIOM.elem} </div>
<div>UserID : ${item.user.id}</div>
<div class="tags">Tag : <span>${item.tags.map((tag) => {return tag.name}).join('</span><span>')}</span></div>
<div>URL : ${item.url}</div>
<div class="itemBody">${item.body.replace(/</g, '&lt;')}</div>
</article>`);
}

function failedLog(error) {console.error(error);}
function readFile(path) {return fs.readFileSync(path, 'utf8');}
function write(path, appendTxt) {

	try {
		if (fs.existsSync(path)) {
			fs.appendFileSync(path, appendTxt);
		} else {
			fs.writeFileSync(path, appendTxt);
		}
		return true;
	} catch (e) {
		failedLog(e);
		return false;
	}

}
