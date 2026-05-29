const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {

    const win = new BrowserWindow({

        width: 1400,
        height: 900,

        icon: path.join(__dirname, 'logo.png'),

        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();
});

/* =========================================
   SAVE PDF
========================================= */

ipcMain.handle('save-pdf', async (event, pdfData) => {

    const { filePath } = await dialog.showSaveDialog({

        title: 'Save Invoice PDF',

        defaultPath: 'invoice.pdf',

        filters: [
            {
                name: 'PDF Files',
                extensions: ['pdf']
            }
        ]
    });

    if (!filePath) {
        return;
    }

    fs.writeFileSync(filePath, Buffer.from(pdfData));

    return filePath;
});