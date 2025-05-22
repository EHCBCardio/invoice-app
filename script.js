// Dynamic items & totals
document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('#itemsTable tbody');
  const addRowBtns = [document.getElementById('addRow'), document.getElementById('addRowBottom')];
  const subtotalEl = document.getElementById('subtotal');
  const discountEl = document.getElementById('discount');
  const grandEl = document.getElementById('grandTotal');

  function createRow() {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="idx"></td>
      <td><input class="item-no" placeholder="A-00001" style="text-align:left;"></td>
      <td><input class="desc" placeholder="Beschreibung" style="text-align:left;"></td>
      <td><input type="number" class="qty" value="1" min="1"></td>
      <td><input type="number" class="price" value="0.00" step="0.01"></td>
      <td class="line"></td>`;
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
    grandEl.textContent = (sum - discount).toFixed(2);
  }

  addRowBtns.forEach(btn => btn.addEventListener('click', () => {
    tbody.appendChild(createRow());
    refreshIdx(); updateTotals();
  }));

  // initial row
  tbody.appendChild(createRow());
  refreshIdx(); updateTotals();
  discountEl.addEventListener('input', updateTotals);
});

// PDF export with html2pdf
document.getElementById('generatePDF').addEventListener('click', () => {
  const element = document.getElementById('invoice');
  const filename = 'Rechnung_' + document.getElementById('invoiceNr').value + '.pdf';
  html2pdf().set({
    margin: [10,10,10,10],
    filename: filename,
    image: { type: 'png', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
  }).from(element).save();
});