const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {

    savePDF: (pdfData) => ipcRenderer.invoke('save-pdf', pdfData)
});