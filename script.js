document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('#itemsTable tbody');
  const addRowBtn = document.getElementById('addRow');
  const subtotalEl = document.getElementById('subtotal');
  const discountEl = document.getElementById('discount');
  const grandEl = document.getElementById('grandTotal');
  const genBtn = document.getElementById('generatePDF');

  function createRow() {
    const tr = document.createElement('tr');
    tr.innerHTML = \`
      <td class="idx"></td>
      <td><input class="item-no" placeholder="A-00001"></td>
      <td><input class="desc" placeholder="Beschreibung"></td>
      <td><input type="number" class="qty" value="1" min="1"></td>
      <td><input type="number" class="price" value="0.00" step="0.01" style="text-align:right;"></td>
      <td class="line" style="text-align:right;">0.00</td>\`;
    tr.querySelectorAll('.qty, .price').forEach(i => i.addEventListener('input', updateTotals));
    return tr;
  }

  function refreshIdx() {
    tbody.querySelectorAll('tr').forEach((tr, i) => {
      tr.querySelector('.idx').textContent = i + 1;
    });
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
    const total = sum - discount;
    grandEl.textContent = total.toFixed(2);
  }

  addRowBtn.addEventListener('click', () => {
    tbody.appendChild(createRow());
    refreshIdx();
    updateTotals();
  });

  tbody.appendChild(createRow());
  refreshIdx();
  updateTotals();
  discountEl.addEventListener('input', updateTotals);

  genBtn.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    const tableWidth = 520;
    // Logo
    doc.addImage('logo.png','PNG', margin, margin, 100, 40);
    // Invoice meta left of logo
    const metaX = margin + 120;
    const metaY = margin;
    const meta = [
      'Kunden-Nr.: ' + document.getElementById('customerNr').value,
      'Datum: ' + document.getElementById('invoiceDate').value,
      'Fällig: ' + document.getElementById('dueDate').value,
      'Rechnung: ' + document.getElementById('invoiceNr').value
    ];
    doc.setFontSize(10);
    doc.text(meta, metaX, metaY);
    // Recipient-address right
    const recX = margin + tableWidth - 0; 
    const recY = margin;
    doc.setFontSize(8);
    doc.text('Abs. Noël Guyaz', recX, recY);
    doc.setLineWidth(0.5);
    const w = doc.getTextWidth('Abs. Noël Guyaz');
    doc.line(recX, recY+2, recX + w, recY+2);
    doc.setFontSize(10);
    const addr = document.getElementById('customerAddress').value.split('\n');
    doc.text(addr, recX, recY + 12);
    // Table header
    let y = margin + 100;
    doc.setFont('helvetica','bold').setFontSize(11);
    const headers = ['#','Art.-Nr.','Beschreibung','Anzahl','Preis','Total'];
    const colPos = [0, 0.05, 0.13, 0.73, 0.81, 0.91];
    headers.forEach((h,i) => {
      doc.text(h, margin + colPos[i]*tableWidth, y);
    });
    doc.setLineWidth(0.5);
    doc.line(margin, y+2, margin + tableWidth, y+2);
    // Table rows
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
      vals.forEach((v,i) => doc.text(String(v), margin + colPos[i]*tableWidth, y));
    });
    // Totals
    y += 30;
    const totX = margin + colPos[3]*tableWidth;
    doc.setFont('helvetica','normal').setFontSize(10);
    doc.text('Zwischensumme:', totX, y);
    doc.text(subtotalEl.textContent, margin + colPos[5]*tableWidth, y, {align:'right'});
    y += 15;
    doc.text('Rabatt:', totX, y);
    doc.text(discountEl.value, margin + colPos[5]*tableWidth, y, {align:'right'});
    y += 15;
    doc.setFont('helvetica','bold');
    doc.text('Total:', totX, y);
    doc.text(grandEl.textContent, margin + colPos[5]*tableWidth, y, {align:'right'});
    // Message
    y += 40;
    doc.setFont('helvetica','normal').setFontSize(10);
    doc.text('Bitte begleichen Sie den Betrag innerhalb der angegebenen Frist. Besten Dank.', margin, y);
    // Signature and IBAN left under message
    y += 40;
    doc.text('Freundliche Grüsse', margin, y);
    doc.text('Noël Guyaz', margin, y+15);
    doc.setFontSize(8);
    doc.text('IBAN: CH31 0631 3429 3319 6450 0', margin, y+35);
    // QR Code
    doc.addImage('qr.png','PNG', recX, recY + 100, 80, 80);
    // Save
    doc.save('Rechnung_' + document.getElementById('invoiceNr').value + '.pdf');
  });
});
