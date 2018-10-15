const XRegExp = require('xregexp');
module.exports = exports = {
	name : 'NG-noise',
	filter : [
		"livestream",
		"gamestream",
		"gamelive",
		"livehere",
		"httpbitly",
		"httpsbitly"
	],
	prop : 'body',
	noNoise: true
};
