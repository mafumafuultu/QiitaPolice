const {app, BrowserWindow, ipcMain, remote, MessagePortMain} = require('electron');
const isDebug = true;
var win = null;
const fs = require('fs');
const moment = require('moment');

app.on('window-all-closed', () => {if (process.platform !== 'darwin') app.quit();});
app.on('activate', () => {if (win === null) createMainWindow();});
app.on('ready', createMainWindow);


function createMainWindow() {
	if (isDebug) {
		console.log(require.resolve('electron'));
	}

	win = new BrowserWindow ({
		titile : 'Qiita警察',
		width : 1280,
		height : 720,
		minWidth : 350,
		minHeight : 100,
		darkTheme : true,
		fullscreenable: true,
		webPreferences: {
			nodeIntegration: true,
			devTools : isDebug
		}
	}),
	win.webContents.openDevTools();
	win.loadURL(`file://${__dirname}/index.html`),
	win.on('closed', () => {win = null;});
}

/* event */
ipcMain.on('file-write', (event, arg) => {
	let path = `./resources/rejected-${moment().format('YYYYMMDD-HH')}.txt`;
	let result = true;
	try {
		fs.existsSync(path)
			? fs.appendFileSync(path, fs.readFileSync(path, 'utf8').concat(arg))
			: fs.writeFileSync(path, arg);

	} catch (e) {
		console.error(e);
		result = false;
	}
	event.returnValue = result
});

ipcMain.on('file-read', (event, arg) => {
	event.returnValue = fs.readFileSync('./resources/test/sample.json');
});