module.exports = exports = {
	name : 'NG idiom',
	filter : [
		'call girl',
		'Click Here to Live',
		'male enhancement',
		'Watch Live Now',
		'WATCH LINK'
	],
	prop : 'body',
	_regexp() {
		this._reg = new RegExp(`${this.filter.join('|')}`,'gi');
	},

};
