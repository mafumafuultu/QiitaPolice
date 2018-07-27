const {app, BrowserWindow, ipcMain} = require('electron');
const isDebug = true;
var win = null;

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
		nodeIntegration: true,
		webPreferences: {
			devTools : isDebug
		}
	}),
	win.webContents.openDevTools();
	win.loadURL(`file://${__dirname}/index.html`),
	win.on('closed', () => {win = null;});
}


/* event */
//ipcMain.on()
