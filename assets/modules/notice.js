class Notice {

	get DEFAULT_SETTIG() {
		return {

		};
	}

	constructor(option) {
		this.setting = {};
		Object.assign(this.setting, this.DEFAULT_SETTING, option);
	}

	static info(txt) {this.open('INFO', txt);}
	static warn(txt) {this.open('WARN', txt);}
	static error(txt) {this.open('ERR', txt);}

	open(level, text) {
		`<div class='notice ${level}'>
			<div class="notice-title</div>>
			<div class="notice-body"></div>
			<div class="notice-">aaa</div>
		</div>

		`
		setTimeout(function() {
			document.getElementById('removeNotice').click();
		}, 5000);
	}

	close() {

	}
}

export default new Notice();
