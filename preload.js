const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    savePDF: (pdfData) => ipcRenderer.invoke('save-pdf', pdfData),

    // Invoice DB APIs
    saveInvoice: (invoiceData) => ipcRenderer.invoke('save-invoice', invoiceData),

    loadInvoices: () => ipcRenderer.invoke('load-invoices'),

    // Get next invoice number and clear invoices
    getNextInvoiceNumber: () => ipcRenderer.invoke('get-next-invoice-number'),

    clearInvoices: () => ipcRenderer.invoke('clear-invoices')
});