const sqlite3 = require('sqlite3').verbose();

    db.run(`

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
        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

    `,
    [
        data.invoiceNumber,
        data.customerName,
        data.phone,
        data.packageName,
        data.totalAmount,
        data.amountPaid,
        data.dueAmount,
        data.remarks,
        new Date().toLocaleString()
    ]);

    alert('Invoice Saved Successfully');
}

/* =========================================
   LOAD HISTORY
========================================= */

function loadInvoices() {

    db.all(`SELECT * FROM invoices ORDER BY id DESC`, [], (err, rows) => {

        if (err) {
            console.log(err);
            return;
        }

        let html = `

            <table class="w-full border-collapse mt-4">

                <tr class="bg-blue-600 text-white">
                    <th class="p-3">Invoice</th>
                    <th class="p-3">Customer</th>
                    <th class="p-3">Package</th>
                    <th class="p-3">Amount</th>
                    <th class="p-3">Due</th>
                    <th class="p-3">Date</th>
                </tr>
        `;

        rows.forEach(row => {

            html += `

                <tr class="border-b hover:bg-gray-100">
                    <td class="p-3">${row.invoiceNumber}</td>
                    <td class="p-3">${row.customerName}</td>
                    <td class="p-3">${row.packageName}</td>
                    <td class="p-3">Rs ${row.totalAmount}</td>
                    <td class="p-3 text-red-600">Rs ${row.dueAmount}</td>
                    <td class="p-3">${row.createdAt}</td>
                </tr>
            `;
        });

        html += `</table>`;

        document.getElementById('invoiceHistory').innerHTML = html;
    });
}