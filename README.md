# QiitaPolice

![licence](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)

Qiitaに投稿されるスパムを検出するために使用する。  
最新投稿20件に対して、チェックを行う。

## update
[version.md参照](./version.md)

## install

```
git clone https://github.com/mafumafuultu/QiitaPolice.git
cd QiitaPolice
```

## build

ビルドコマンド流す前に、作成したフィルタ、Exportしたデータのバックアップをしておいてください。

```
npm run less
npm run build
cp ./resources/* ../build/QiitaPolice-win32-x64/resources -recurse -force
```

## 機能

### new item
任意の件数（20～100）投稿を取得する。フィルタを適用し、その結果を表示する。
ページャにより更に過去の投稿を読み込み可能。

### Export
フィルタにマッチしたデータを書き出す。
`./resource/reject/rejected-YYYYMMdd-HH.txt` に追記される。

### Test
テストデータに対してフィルタを適用し、その結果を表示する。
テストデータは編集可能。

### 1st post
読み込んだ投稿のうち、各ユーザの初回投稿のみ表示する。

### AutoReload
一定時間ごとに投稿を読み込む

### AutoExport
スパムが一定量たまったら`./resource/reject/`に検出した投稿をはき出す。

### mark NG
投稿ごとに用意しているボタンで、フィルタにマッチしなかったが、問題がある投稿としてマークしExport対象とする。

### ショートカットキー

|キー |動作 |
|-|-|
|enter |記事の読み込み|
|left |ページャのカウントアップ |
|ctrl + left |ページャのカウントを最小値（1）|
|right |ページャのカウントダウン |
|ctrl + right |ページャのカウントを最大値（100） |


## Filter
記述したフィルタは `assets/modules/custom-filter.js` のConstructorに渡されるArrayの要素になる。

単純な単語フィルタの例

```js
{
	name : '単語フィルタ',
	filter : ['ngword', 'sexual'],
	prop : 'body'
}
```

```js
{
	// フィルタ名称
	// マッチした投稿にどのフィルタにマッチしたのか表示するために使用
	name : '単語フィルタ',

	// マッチさせたい単語
	filter : ['ngword', 'sexual'],

	// 投稿データでフィルタ対象にしたいプロパティ
	prop : 'body',

	/* 以下オプション */

	_regexp() {
		this._reg = new RegExp(`\\b${this.filter.join('\\b|\\b')}\\b`, 'gi');
	},

	// @param obj QiitaAPI v2 投稿1件分のデータ
	// 結果は必ず this._result に入れる
	check : function(obj) {
		this._result = this._reg.test(obj[this.prop]);
	},

}
```

フィルタを作ったら`[フィルタ名].js`として保存し`resources/filters/`の適当な場所に置く。
filter.json に置いたファイルのパスを記載する。

```json
{
	"resurces/filters/直下のdir名" : {
		"files" : [
			"[フィルタ名].js",
			"作ったフィルタ2.js"
		]
	}
}
```
