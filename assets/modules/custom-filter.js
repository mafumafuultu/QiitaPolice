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
export class CustomFilter{
	get DEFAULT_SETTING() {
		return {
			name : '',
			prop : '',
			filter: [],
			noNoise: false,
			init() {
				this._regexp();
			},
			_regexp() {
				this._reg = this.noNoise ? new RegExp(`${this.filter.join('|')}`, 'gi') : new RegExp(`\\b${this.filter.join('\\b|\\b')}\\b`, 'gi');
				this._noseReplace = this.noNoise ? /\P{L}/uimg : '';
			},
			check(obj) {
				this._reg.lastIndex = 0;
				this._result = this._reg.test(obj[this.prop].replace(this._noseReplace, ''));
			},
			result() {
				return this._result;
			}
		};
	}

	constructor(userFilters = []) {
		this.filters = [];
		for (var filter of userFilters) this.filters.push(Object.assign(this.DEFAULT_SETTING, filter));
		this.init();
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