import moment  from '../../node_modules/moment/dist/moment.js';

export class CountDownTimer {
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
			ontimerzero: function(){}
		};
	}

	constructor(opt) {
		this.setting = Object.assign(this.DEFAULT_SETTING, opt);
		if (!document.querySelector(`#${this.setting.id}`)) return void console.error(`not found #${this.setting.id}`);
		this.init();
	}

	init() {
		this.elem = document.querySelector(`#${this.setting.id}`);
		this.starttime = moment(0).add(this.setting.start);
		this.time = this.starttime.clone();
		this.pending = !this.setting.autoStart;
		this.ontimerzero = typeof this.setting.ontimerzero === 'function' ? this.setting.ontimerzero : () => {};
		var cls = this.elem.classList;
		if (this.print() && this.setting.autoStart) {
			cls.toggle('play');
			this.play();
		}
		var self = this;
		this.elem.onclick = function() {
			cls.toggle('play') ? self.play() : self.pause();
		};
	}

	play() {
		this.pending = false;
		this._start();
	}

	pause() {
		this.pending = true;
	}

	_start() {
		this.time.add(this.setting.delta);
		var self = this;
		setTimeout(function() {
			if (self.print() && !self.pending) self._start();
		}, self.setting.interval);
	}

	print() {
		this.elem.innerHTML = `<button class="btn ${this.timerState}">${this.time.format(this.setting.format)}</button>`;
		let timer = this.time.isAfter(0);
		if (!timer) this.ontimerzero();
		return timer;
	}

	restart() {
		this.reset();
		this.play();
	}

	reset() {
		this.time = this.starttime.clone();
	}

	get timerState() {
		return this.pending ? 'pauseTimer' : 'playTimer';
	}
}
