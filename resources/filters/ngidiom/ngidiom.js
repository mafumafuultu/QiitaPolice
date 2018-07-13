module.exports = exports = {
	name : 'NG idiom',
	filter : [
		'call girl'
	],
	prop : 'body',
	_regexp() {
		this._reg = new RegExp(`${this.filter.join('|')}`,'gi');
	},

};
