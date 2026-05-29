const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Database will be stored in the user data folder to persist between runs
let db;
const dbPath = path.join(app.getPath ? app.getPath('userData') : __dirname, 'invoices.db');

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

function initDatabase() {

    db = new sqlite3.Database(dbPath);

    db.serialize(() => {

        db.run(`
            CREATE TABLE IF NOT EXISTS invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoiceNumber TEXT,
                customerName TEXT,
                phone TEXT,
                packageName TEXT,
                totalAmount REAL,
                amountPaid REAL,
                dueAmount REAL,
                remarks TEXT,
                createdAt TEXT
            )
        `);
    });
}

app.whenReady().then(() => {
    initDatabase();
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

/* =========================================
   INVOICE DB IPC
========================================= */

ipcMain.handle('save-invoice', async (event, data) => {

    return new Promise((resolve, reject) => {

        const stmt = db.prepare(`
            INSERT INTO invoices (
                invoiceNumber,
                customerName,
                phone,
                packageName,
                totalAmount,
                amountPaid,
                dueAmount,
                remarks,
                createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            data.invoiceNumber,
            data.customerName,
            data.phone,
            data.packageName,
            data.totalAmount,
            data.amountPaid,
            data.dueAmount,
            data.remarks,
            new Date().toLocaleString(),
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            }
        );

        stmt.finalize();
    });
});

ipcMain.handle('load-invoices', async () => {

    return new Promise((resolve, reject) => {

        db.all('SELECT * FROM invoices ORDER BY id DESC', [], (err, rows) => {

            if (err) return reject(err);

            resolve(rows);
        });
    });
});

// Return the next invoice numeric suffix based on existing invoice numbers in DB
ipcMain.handle('get-next-invoice-number', async () => {

    return new Promise((resolve, reject) => {

        db.all("SELECT invoiceNumber FROM invoices", [], (err, rows) => {

            if (err) return reject(err);

            try {
                let maxNum = 0;

                rows.forEach(r => {
                    if (!r.invoiceNumber) return;
                    const m = r.invoiceNumber.match(/(\d{3,})$/);
                    if (m) {
                        const n = parseInt(m[1], 10);
                        if (n > maxNum) maxNum = n;
                    }
                });

                // If no invoices found, try to seed from localStorage file fallback (not available here), default 407
                const next = maxNum > 0 ? (maxNum + 1) : 407;

                resolve(next);
            }
            catch (e) { reject(e); }
        });
    });
});

// Clear all invoices from DB
ipcMain.handle('clear-invoices', async () => {

    return new Promise((resolve, reject) => {

        db.run('DELETE FROM invoices', function(err) {
            if (err) return reject(err);
            resolve({ cleared: true, changes: this.changes });
        });
    });
});