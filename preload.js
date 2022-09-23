const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    writeFile: obj => ipcRenderer.sendSync('file-write', obj),
	readSample: () => ipcRenderer.sendSync('file-read', null),
});