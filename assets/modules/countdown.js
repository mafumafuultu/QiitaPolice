const jQuery = require('jquery');
const moment = require('moment');

class CountDownTimer {
	get DEFAULT_SETTING() {
		return {
			id : 'countdown',
			interval : 1000,
			delta : {
				second : -1
			},
			format : 'mm:ss',
			start : {
				minute: 1,
				second: 0,
			},
			autoStart: false,
		};
	}

	constructor(opt) {
		this.setting = jQuery.extend(this.DEFAULT_SETTING, opt);

		if (!document.querySelector(`#${this.setting.id}`)) return void console.error(`not found #${this.setting.id}`);
		this.init();
	}
	init() {
		this.elem = document.querySelector(`#${this.setting.id}`);
		this.starttime = moment(0).add(this.setting.start);
		this.time = this.starttime.clone();

		if (this.print() && this.setting.autoStart) {
			this.start();
		}
	}

	start() {
		this.time.add(this.setting.delta);
		var self = this;
		setTimeout(function() {
			if (self.print()) self.start();
		}, self.setting.interval);
	}

	print() {
		this.elem.innerText = this.time.format(this.setting.format);
		return this.time.isAfter(0);
	}

	reset() {
		this.time = this.starttime.clone();
	}
}

module.exports = exports = CountDownTimer;
