const jQuery = require('jquery');
const basePath = '@resources/filters';
var fil;
var userFilters = [];

/*
外部フィルタを元にフィルタを作成する
使うときは

```js
CustomFilter.check(obj)
if (CustomFilter.result) {
	// find
}
```
*/
class CustomFilter{
	constructor(userFilters = []) {
		this.filters = [];
		for (var filter of userFilters) this.filters.push(jQuery.extend(this.DEFAULT_SETTING, filter));
		this.init();
	}
	get DEFAULT_SETTING() {
		return {
			name : '',
			prop : '',
			filter: [],
			init() {
				this._regexp();
			},
			_regexp() {
				this._reg = new RegExp(`\\b${this.filter.join('\\b|\\b')}\\b`, 'gi');
			},
			check(obj) {
				this._reg.lastIndex = 0;
				this._result = this._reg.test(obj[this.prop]);
			},
			result() {
				return this._result;
			}
		};
	}

	init() {
		for (var filter of this.filters) filter.init();
	}
	check(obj) {
		for (var filter of this.filters) filter.check(obj);
	}
	get result() {
		return this.filters.map((fil) => fil.result()).includes(true);
	}
	get reason() {
		return this.filters.map((fil) => fil.result() ? `<span class="ngReason">${fil.name}</span>` : '').join('');
	}
}

try {
	fil = require(`${basePath}/filter.json`);
	for (var path in fil) {
		for (var file of fil[path].files ) userFilters.push(require(`${basePath}/${path}/${file}`));
	}
} catch (e) {
	console.warn(e);
}
module.exports = exports =  new CustomFilter(userFilters);
