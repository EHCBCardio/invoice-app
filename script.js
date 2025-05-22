document.getElementById('generatePDF').addEventListener('click', () => {
  const element = document.getElementById('invoice');
  const opt = {
    margin:       [10,10,10,10],
    filename:     'Rechnung_' + document.getElementById('invoiceNr').value + '.pdf',
    image:        { type: 'png', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
});