module.exports = exports = {
	name : 'Title of URL alone is NG',
	prop : 'title',
	_regexp() {
		this._reg = new RegExp('^https?://[\\w/:%#$&\?()~.=+-]+$', 'gi');
	},
}
