document.addEventListener("DOMContentLoaded", () => {
  const tbody        = document.querySelector("#itemsTable tbody");
  const addRowBtn    = document.getElementById("addRow");
  const subtotalEl   = document.getElementById("subtotal");
  const discountEl   = document.getElementById("discount");
  const vatEl        = document.getElementById("vat");
  const vatAmountEl  = document.getElementById("vatAmount");
  const grandTotalEl = document.getElementById("grandTotal");
  const generateBtn  = document.getElementById("generatePDF");

  function createRow() {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="idx"></td>
      <td><input type="text" class="item-no" placeholder="A-00001"></td>
      <td><input type="text" class="desc" placeholder="Beschreibung"></td>
      <td><input type="number" class="qty" value="1" min="1"></td>
      <td><input type="number" class="price" value="0.00" step="0.01"></td>
      <td class="line-total">0.00</td>
    `;
    tr.querySelectorAll(".qty, .price").forEach(input => {
      input.addEventListener("input", updateTotals);
    });
    return tr;
  }

  function refreshRowIndices() {
    tbody.querySelectorAll("tr").forEach((tr,i) => {
      tr.querySelector(".idx").textContent = i+1;
    });
  }

  function updateTotals() {
    let sum = 0;
    tbody.querySelectorAll("tr").forEach(tr => {
      const qty   = parseFloat(tr.querySelector(".qty").value) || 0;
      const price = parseFloat(tr.querySelector(".price").value) || 0;
      const line  = qty * price;
      tr.querySelector(".line-total").textContent = line.toFixed(2);
      sum += line;
    });
    subtotalEl.textContent = sum.toFixed(2);
    const discount = parseFloat(discountEl.value) || 0;
    const vatPerc   = parseFloat(vatEl.value) || 0;
    const vatAmt    = ((sum - discount) * vatPerc) / 100;
    vatAmountEl.textContent  = vatAmt.toFixed(2);
    const grand = sum - discount + vatAmt;
    grandTotalEl.textContent = grand.toFixed(2);
  }

  addRowBtn.addEventListener("click", () => {
    tbody.appendChild(createRow());
    refreshRowIndices();
    updateTotals();
  });

  tbody.appendChild(createRow());
  refreshRowIndices();
  updateTotals();
  discountEl.addEventListener("input", updateTotals);
  vatEl.addEventListener("change", updateTotals);

  generateBtn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const leftX = 40, rightX = 350;
    let y = 40;

    doc.addImage("logo.png", "PNG", leftX, y, 100, 40);
    doc.setFontSize(10);
    doc.text(
      doc.splitTextToSize(
        document.getElementById("customerAddress").value, 180
      ),
      leftX, y + 60
    );
    const infos = [
      `Kunden-Nr.: ${document.getElementById("customerNr").value}`,
      `Datum: ${document.getElementById("invoiceDate").value}`,
      `Fällig: ${document.getElementById("dueDate").value}`,
      `Rechnung: ${document.getElementById("invoiceNr").value}`
    ];
    doc.text(infos, rightX, y + 20);
    y += 120;
    doc.setFontSize(11).setFont("helvetica", "bold");
    ["#", "Art.-Nr.", "Beschreibung", "Anzahl", "Preis", "Total"].forEach((h, i) => {
      doc.text(h, leftX + i*80, y);
    });
    doc.setLineWidth(0.5);
    doc.line(leftX, y+2, leftX+480, y+2);
    doc.setFont("helvetica","normal");
    tbody.querySelectorAll("tr").forEach(tr => {
      y += 20;
      const cells = [
        tr.querySelector(".idx").textContent,
        tr.querySelector(".item-no").value,
        tr.querySelector(".desc").value,
        tr.querySelector(".qty").value,
        tr.querySelector(".price").value,
        tr.querySelector(".line-total").textContent
      ];
      cells.forEach((txt, i) => {
        doc.text(String(txt), leftX + i*80, y);
      });
    });
    y += 30;
    const sumsX = leftX + 350;
    doc.text(`Zwischensumme:`, sumsX, y);
    doc.text(subtotalEl.textContent, sumsX + 100, y, { align: 'right' });
    y += 15; doc.text(`Rabatt:`, sumsX, y);
    doc.text(discountEl.value, sumsX + 100, y, { align: 'right' });
    y += 15; doc.text(`MWST (${vatEl.value}%):`, sumsX, y);
    doc.text(vatAmountEl.textContent, sumsX + 100, y, { align: 'right' });
    y += 15; doc.setFont("", "bold");
    doc.text(`Total:`, sumsX, y);
    doc.text(grandTotalEl.textContent, sumsX + 100, y, { align: 'right' });
    y += 40; doc.addImage("qr.png","PNG", leftX, y, 100, 100);
    y += 120; doc.setFont("helvetica","normal").setFontSize(11);
    doc.text("Freundliche Grüsse", leftX, y);
    doc.text("Noël Guyaz", leftX, y + 15);
    doc.save(`Rechnung_${document.getElementById("invoiceNr").value}.pdf`);
  });
});
