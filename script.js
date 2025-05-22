document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('#itemsTable tbody');
  const addRow = document.getElementById('addRow');
  const subtotalEl = document.getElementById('subtotal');
  const discountEl = document.getElementById('discount');
  const vatEl = document.getElementById('vat');
  const vatAmountEl = document.getElementById('vatAmount');
  const grandEl = document.getElementById('grandTotal');
  const genBtn = document.getElementById('generatePDF');

  function createRow() {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="idx"></td>
      <td><input class="item-no" placeholder="A-00001"></td>
      <td><input class="desc" placeholder="Beschreibung"></td>
      <td><input type="number" class="qty" value="1" min="1"></td>
      <td><input type="number" class="price" value="0.00" step="0.01"></td>
      <td class="line">0.00</td>`;
    tr.querySelectorAll('.qty, .price').forEach(i => i.addEventListener('input', updateTotals));
    return tr;
  }

  function refreshIdx() {
    tbody.querySelectorAll('tr').forEach((tr, i) => tr.querySelector('.idx').textContent = i+1);
  }

  function updateTotals() {
    let sum = 0;
    tbody.querySelectorAll('tr').forEach(tr => {
      const q = parseFloat(tr.querySelector('.qty').value) || 0;
      const p = parseFloat(tr.querySelector('.price').value) || 0;
      const line = q * p;
      tr.querySelector('.line').textContent = line.toFixed(2);
      sum += line;
    });
    subtotalEl.textContent = sum.toFixed(2);
    const discount = parseFloat(discountEl.value) || 0;
    const vatPerc = parseFloat(vatEl.value) || 0;
    const vatAmt = ((sum - discount) * vatPerc) / 100;
    vatAmountEl.textContent = vatAmt.toFixed(2);
    grandEl.textContent = (sum - discount + vatAmt).toFixed(2);
  }

  addRow.addEventListener('click', () => {
    tbody.appendChild(createRow());
    refreshIdx();
    updateTotals();
  });

  tbody.appendChild(createRow());
  refreshIdx();
  updateTotals();
  discountEl.addEventListener('input', updateTotals);
  vatEl.addEventListener('change', updateTotals);

  genBtn.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    let y = margin;

    doc.setFontSize(10);
    const addr = document.getElementById('customerAddress').value.split('\n');
    doc.text(addr, margin, y);
    const meta = [
      'Kunden-Nr.: ' + document.getElementById('customerNr').value,
      'Datum: ' + document.getElementById('invoiceDate').value,
      'Fällig: ' + document.getElementById('dueDate').value,
      'Rechnung: ' + document.getElementById('invoiceNr').value
    ];
    doc.text(meta, 300, y);

    y += 80;
    doc.setFont('helvetica', 'bold').setFontSize(11);
    ['#','Artikel-Nr.','Beschreibung','Anzahl','Preis','Total'].forEach((h, i) => {
      doc.text(h, margin + i*80, y);
    });
    doc.setLineWidth(0.5);
    doc.line(margin, y+2, margin+480, y+2);

    doc.setFont('helvetica','normal');
    tbody.querySelectorAll('tr').forEach(tr => {
      y += 20;
      const vals = [
        tr.querySelector('.idx').textContent,
        tr.querySelector('.item-no').value,
        tr.querySelector('.desc').value,
        tr.querySelector('.qty').value,
        tr.querySelector('.price').value,
        tr.querySelector('.line').textContent
      ];
      vals.forEach((v, i) => doc.text(v, margin + i*80, y));
    });

    y += 30;
    doc.text('Zwischensumme:', 320, y);
    doc.text(subtotalEl.textContent, 400, y, { align:'right' });
    y += 15;
    doc.text('Rabatt:', 320, y);
    doc.text(discountEl.value, 400, y, { align:'right' });
    y += 15;
    doc.text('MWST (' + vatEl.value + '%):', 320, y);
    doc.text(vatAmountEl.textContent, 400, y, { align:'right' });
    y += 15;
    doc.setFont('helvetica','bold');
    doc.text('Total:', 320, y);
    doc.text(grandEl.textContent, 400, y, { align:'right' });

    y += 40;
    doc.text('Bitte begleichen Sie den Betrag innerhalb der angegebenen Frist. Besten Dank.', margin, y);

    y += 30;
    doc.text('Freundliche Grüsse', margin, y);
    doc.text('Noël Guyaz', margin, y+15);

    y += 40;
    doc.addImage('qr.png','PNG', margin, y, 80, 80);
    doc.text('IBAN: CH31 0631 3429 3319 6450 0', 300, y);
    doc.text('Abs. Noël Guyaz, Bellacherstrasse 4a, 2545 Selzach', 300, y+15);

    doc.save('Rechnung_' + document.getElementById('invoiceNr').value + '.pdf');
  });
});
