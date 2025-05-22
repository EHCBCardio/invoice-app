const products = {
  "Recovery Shake (900g) - Vanilla": 22.00,
  "Recovery Shake (900g) - Chocolate": 22.00,
  "Whey Isolate 94 (425g) - Vanilla": 21.00,
  "Crunchy Protein Bar 1 Box - Peanut-Caramel": 24.00,
  "High Energy Bar 1 Box - Banana": 46.50
};

document.addEventListener("DOMContentLoaded", () => {
  const itemsContainer  = document.getElementById("itemsContainer");
  const addItemBtn      = document.getElementById("addItem");
  const generateBtn     = document.getElementById("generatePDF");
  const customerInput   = document.getElementById("customerInput");
  const customerSelect  = document.getElementById("customerSelect");
  const exportCustBtn   = document.getElementById("exportCustomers");
  const rabattInput     = document.getElementById("rabattInput");
  const mwstSelect      = document.getElementById("mwstSelect");
  const archivList      = document.getElementById("archivList");

  let customers       = JSON.parse(localStorage.getItem("customers")  || "[]");
  let archive         = JSON.parse(localStorage.getItem("archive")    || "[]");
  let invoiceCounter  = parseInt(localStorage.getItem("invoiceCount") || "1");

  function refreshCustomerDropdown() {
    customerSelect.innerHTML = `<option value="">– Kunde wählen –</option>` +
      customers.map(c => `<option>${c}</option>`).join("");
  }

  function refreshArchive() {
    archivList.innerHTML = "";
    archive.forEach(rec => {
      const div = document.createElement("div");
      div.innerHTML = `Rg-${rec.nr}: ${rec.kunde} – CHF ${rec.total.toFixed(2)} (${rec.datum})
        <button data-nr="${rec.nr}">PDF</button>`;
      div.querySelector("button").onclick = () => createPDF(rec);
      archivList.append(div);
    });
  }

  function addItemRow() {
    const row = document.createElement("div");
    row.className = "item-row";
    const sel    = document.createElement("select");
    sel.innerHTML = `<option></option>` +
      Object.keys(products).map(k => `<option>${k}</option>`).join("");
    const name   = document.createElement("input"); name.placeholder="Name";
    const qty    = document.createElement("input"); qty.type="number"; qty.value=1; qty.min=1;
    const price  = document.createElement("input"); price.type="number"; price.step="0.05"; price.placeholder="Preis";
    sel.onchange = () => price.value = products[sel.value]?.toFixed(2) || "";
    row.append(sel, name, qty, price);
    itemsContainer.append(row);
  }

  function createPDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(12);
    let y = 20;
    doc.addImage("logo.png","PNG",10,10,30,30);
    doc.text(`Rechnung Rg-${data.nr}`, 50, 20);
    doc.text(`Für: ${data.kunde}`, 50, 30);
    y = 50;
    data.artikel.forEach((it, i) => {
      doc.text(`${i+1}. ${it.name} – CHF ${it.summe.toFixed(2)}`, 10, y);
      y += 8;
    });
    y += 8;
    doc.text(`Zwischensumme: CHF ${data.zwischensumme.toFixed(2)}`, 10, y);
    y += 8;
    doc.text(`Rabatt: CHF -${data.rabatt.toFixed(2)}`, 10, y);
    y += 8;
    doc.text(`MWST (${data.mwst}%): CHF ${data.mwstbetrag.toFixed(2)}`, 10, y);
    y += 8;
    doc.text(`Total: CHF ${data.total.toFixed(2)}`, 10, y);
    doc.addImage("qr.png","PNG",150, y-40, 50, 50);
    doc.save(`rechnung_rg_${data.nr}.pdf`);
  }

  function collectAndSave() {
    const rows = document.querySelectorAll(".item-row");
    let artikel = [], sum = 0;
    rows.forEach(r => {
      const p = r.children[0].value;
      const n = r.children[1].value;
      const q = parseFloat(r.children[2].value) || 0;
      const pr= parseFloat(r.children[3].value) || 0;
      const name = n||p||"Unbenannt";
      const line = q*pr;
      artikel.push({ name, summe: line });
      sum += line;
    });
    const rab = parseFloat(rabattInput.value)||0;
    const mw  = parseFloat(mwstSelect.value)||0;
    const mwb = ((sum-rab)*mw)/100;
    const total = sum - rab + mwb;
    const kunde = customerInput.value.trim()||"–";
    if(kunde && !customers.includes(kunde)) {
      customers.push(kunde);
      localStorage.setItem("customers", JSON.stringify(customers));
      refreshCustomerDropdown();
    }
    const dt = new Date().toLocaleDateString("de-CH");
    const rec = {
      nr: invoiceCounter++,
      kunde,
      artikel,
      zwischensumme: sum,
      rabatt: rab,
      mwst: mw,
      mwstbetrag: mwb,
      total,
      datum: dt
    };
    archive.push(rec);
    localStorage.setItem("archive", JSON.stringify(archive));
    localStorage.setItem("invoiceCount", invoiceCounter);
    refreshArchive();
    createPDF(rec);
  }

  document.getElementById("addItem").onclick = addItemRow;
  document.getElementById("generatePDF").onclick = collectAndSave;
  document.getElementById("exportCustomers").onclick = () => {
    const blob = new Blob([JSON.stringify(customers, null,2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "kunden.json"; a.click();
  };
  document.getElementById("customerSelect").onchange = () => {
    document.getElementById("customerInput").value = document.getElementById("customerSelect").value;
  };

  refreshCustomerDropdown();
  refreshArchive();
});
