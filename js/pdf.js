/* ============================================
   pdf.js – PDF Generation (Final Fix)
   
   Approach: Build clean invoice HTML, render it
   in a full-screen overlay that completely covers
   the page, capture ONLY that, then remove it.
   ============================================ */

async function downloadPDF() {

  const btns = document.querySelectorAll('[onclick="downloadPDF()"]');
  const originals = [];
  btns.forEach((btn, i) => {
    originals[i] = btn.innerHTML;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:pdfSpin .8s linear infinite;display:inline-block;vertical-align:middle"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Generating…`;
    btn.disabled = true;
  });

  let overlay = null;

  try {
    await loadLibraries();

    // ── Read all invoice data from live DOM ──
    const d = readInvoiceData();

    // ── Build the clean HTML string ──
    const cleanHtml = buildCleanHtml(d);

    // ── Create a white full-screen overlay that hides everything behind it ──
    overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#fff;z-index:999999;overflow:auto;';

    // Inner wrapper at exact A4 pixel width so canvas knows the layout width
    const inner = document.createElement('div');
    inner.id = 'pdf-clean-root';
    inner.style.cssText = 'width:794px;min-height:100vh;background:#fff;margin:0 auto;';
    inner.innerHTML = cleanHtml;
    overlay.appendChild(inner);
    document.body.appendChild(overlay);

    // Wait for fonts and layout to settle
    await sleep(900);

    // ── Capture ONLY the inner invoice div ──
    const canvas = await html2canvas(inner, {
      scale:           2,
      useCORS:         true,
      allowTaint:      true,
      backgroundColor: '#ffffff',
      logging:         false,
      width:           794,
      windowWidth:     794,
    });

    // ── Remove overlay ──
    overlay.remove();
    overlay = null;

    // ── Build PDF from canvas ──
    const { jsPDF } = window.jspdf;
    const pdf     = new jsPDF({ unit:'mm', format:'a4', orientation:'portrait' });
    const margin  = 10;
    const usableW = 210 - margin * 2;   // 190 mm
    const usableH = 297 - margin * 2;   // 277 mm

    // Convert canvas to mm (canvas is at 2x scale)
    const imgW_px  = canvas.width  / 2;  // logical pixels
    const imgH_px  = canvas.height / 2;
    const imgW_mm  = usableW;
    const imgH_mm  = imgH_px * (usableW / imgW_px);

    const imgData = canvas.toDataURL('image/jpeg', 0.97);

    if (imgH_mm <= usableH) {
      // Fits on one page
      pdf.addImage(imgData, 'JPEG', margin, margin, imgW_mm, imgH_mm);
    } else {
      // Multi-page slicing
      const sliceH_px = Math.round(imgH_px * (usableH / imgH_mm));
      let   offsetPx  = 0;
      let   page      = 0;

      while (offsetPx < canvas.height) {
        if (page > 0) pdf.addPage();
        const thisPx    = Math.min(sliceH_px * 2, canvas.height - offsetPx);
        const sliceC    = document.createElement('canvas');
        sliceC.width    = canvas.width;
        sliceC.height   = thisPx;
        sliceC.getContext('2d').drawImage(canvas, 0, offsetPx, canvas.width, thisPx, 0, 0, canvas.width, thisPx);
        const sliceH_mm = (thisPx / 2) * (usableW / imgW_px);
        pdf.addImage(sliceC.toDataURL('image/jpeg', 0.97), 'JPEG', margin, margin, imgW_mm, sliceH_mm);
        offsetPx += thisPx;
        page++;
      }
    }

    const filename = (document.getElementById('invoiceNumber')?.value || 'invoice')
                       .replace(/[^a-zA-Z0-9-_]/g,'_') + '.pdf';
    pdf.save(filename);
    showToast('✓ PDF downloaded!');

  } catch(err) {
    console.error('PDF error:', err);
    showToast('Error generating PDF. Try Print (Ctrl+P).');
  } finally {
    if (overlay) { try { overlay.remove(); } catch(e){} }
    btns.forEach((btn, i) => { btn.innerHTML = originals[i]; btn.disabled = false; });
  }
}

/* ════════════════════════════════════════════
   READ all invoice values from live DOM/state
════════════════════════════════════════════ */
function readInvoiceData() {
  const brand    = (getComputedStyle(document.documentElement).getPropertyValue('--brand') || '#1a3c5e').trim();
  const currency = state.currency;
  const fmt      = n => formatCurrency(n, currency);

  // Company
  const compEls        = document.querySelectorAll('.inv-company .editable');
  const companyName    = (compEls[0]?.textContent || '').trim();
  const companyAddress = (compEls[1]?.textContent || '').trim();
  const companyContact = (compEls[2]?.textContent || '').trim();

  // Logo
  const logoEl  = document.getElementById('logoImage');
  const logoSrc = (logoEl && !logoEl.classList.contains('hidden')) ? (logoEl.src || '') : '';

  // Doc title
  const docTitle = (document.querySelector('.inv-doc-title')?.textContent || 'INVOICE').trim().toUpperCase();

  // Meta fields
  const invoiceNumber = document.getElementById('invoiceNumber')?.value  || '';
  const invoiceDate   = fmtDate(document.getElementById('invoiceDate')?.value || '');
  const dueDate       = fmtDate(document.getElementById('dueDate')?.value   || '');
  const poNumber      = document.getElementById('poNumber')?.value  || '';
  const showPO        = document.getElementById('poRow')?.style.display !== 'none' && poNumber !== '';

  // Bill To
  const billEls    = document.querySelectorAll('.inv-party:not(.inv-party-right) .editable');
  const billName    = (billEls[0]?.textContent || '').trim();
  const billCompany = (billEls[1]?.textContent || '').trim();
  const billAddress = (billEls[2]?.textContent || '').trim();
  const billEmail   = (billEls[3]?.textContent || '').trim();

  // Tax registration IDs
  const taxIdSection = document.getElementById('taxIdSection');
  const showTaxIds   = taxIdSection && taxIdSection.style.display !== 'none';
  const taxId1Row    = document.getElementById('taxIdRow1');
  const taxId2Row    = document.getElementById('taxIdRow2');
  const showTaxId1   = showTaxIds && taxId1Row && taxId1Row.style.display !== 'none';
  const showTaxId2   = showTaxIds && taxId2Row && taxId2Row.style.display !== 'none';
  const taxId1Label  = document.getElementById('taxIdLabel1')?.textContent || '';
  const taxId1Value  = document.getElementById('taxIdInput1')?.value || '';
  const taxId2Label  = document.getElementById('taxIdLabel2')?.textContent || '';
  const taxId2Value  = document.getElementById('taxIdInput2')?.value || '';

  // Line items — read directly from DOM inputs
  const items = [];
  state.items.forEach(item => {
    const rowEl = document.getElementById(item.id);
    if (!rowEl) return;
    const desc  = (rowEl.querySelector('.editable')?.textContent || '').trim();
    const numInputs = rowEl.querySelectorAll('input[type="number"]');
    const qty   = parseFloat(numInputs[0]?.value) || 0;
    const rate  = parseFloat(numInputs[1]?.value) || 0;
    const unit  = (rowEl.querySelector('input[type="text"]')?.value || '').trim();
    if (!desc && qty === 0 && rate === 0) return; // skip blank rows
    items.push({ desc, qty, unit, rate, amount: qty * rate });
  });

  // Totals — recalculate cleanly from raw values (don't rely on display text)
  const subtotal = items.reduce((s, i) => s + i.amount, 0);

  let discountAmt = 0;
  const showDiscount = state.showDiscount;
  if (showDiscount) {
    const dv = parseFloat(document.getElementById('discountAmt')?.value) || 0;
    const dt = document.getElementById('discountType')?.value || 'pct';
    discountAmt = dt === 'pct' ? subtotal * dv / 100 : dv;
    discountAmt = Math.max(0, Math.min(discountAmt, subtotal));
  }

  const afterDiscount = subtotal - discountAmt;

  const taxLines = state.taxLines.map(t => ({
    name:   t.name,
    rate:   t.rate,
    amount: afterDiscount * t.rate / 100,
  }));
  const totalTax = taxLines.reduce((s, t) => s + t.amount, 0);

  const showShipping = state.showShipping;
  const shippingAmt  = showShipping ? Math.max(parseFloat(document.getElementById('shippingAmt')?.value) || 0, 0) : 0;
  const grandTotal   = afterDiscount + totalTax + shippingAmt;
  const amtPaid      = Math.max(parseFloat(document.getElementById('amtPaid')?.value) || 0, 0);
  const balanceDue   = Math.max(grandTotal - amtPaid, 0); // never negative

  const showTaxable  = showDiscount && discountAmt > 0 && taxLines.length > 0;

  const notes = (document.getElementById('notesBox')?.textContent || '').trim();
  const terms = (document.getElementById('termsBox')?.textContent || '').trim();

  return {
    brand, currency, fmt,
    companyName, companyAddress, companyContact, logoSrc, docTitle,
    invoiceNumber, invoiceDate, dueDate, poNumber, showPO,
    billName, billCompany, billAddress, billEmail,
    showTaxIds, showTaxId1, taxId1Label, taxId1Value,
    showTaxId2, taxId2Label, taxId2Value,
    items,
    subtotal, discountAmt, showDiscount, afterDiscount, showTaxable,
    taxLines, totalTax, shippingAmt, showShipping,
    grandTotal, amtPaid, balanceDue,
    notes, terms,
  };
}

/* ════════════════════════════════════════════
   BUILD clean, input-free invoice HTML
════════════════════════════════════════════ */
function buildCleanHtml(d) {
  const e   = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const nl  = s => e(s).replace(/\n/g,'<br>');
  const fmt = d.fmt;

  // Row style helpers
  const tr  = 'padding:7px 0;font-size:13px;color:#4b5563;border-bottom:1px solid #f3f4f6;';
  const trR = tr + 'text-align:right;font-weight:600;';

  // Line item rows
  const itemRows = d.items.length > 0
    ? d.items.map((item, i) => `
      <tr style="background:${i%2===0?'#ffffff':'#fafbfc'};">
        <td style="padding:10px 12px;font-size:13px;color:#1c1c1e;border-bottom:1px solid #f0f0f0;word-break:break-word">${nl(item.desc)}</td>
        <td style="padding:10px 12px;font-size:13px;text-align:center;color:#374151;border-bottom:1px solid #f0f0f0">${item.qty}</td>
        <td style="padding:10px 12px;font-size:13px;text-align:center;color:#374151;border-bottom:1px solid #f0f0f0">${e(item.unit)}</td>
        <td style="padding:10px 12px;font-size:13px;text-align:right;color:#374151;border-bottom:1px solid #f0f0f0">${fmt(item.rate)}</td>
        <td style="padding:10px 12px;font-size:13px;font-weight:700;text-align:right;color:#1c1c1e;border-bottom:1px solid #f0f0f0">${fmt(item.amount)}</td>
      </tr>`).join('')
    : `<tr><td colspan="5" style="padding:20px;text-align:center;color:#9ca3af;font-size:13px;font-style:italic">No line items added</td></tr>`;

  // Tax rows
  const taxRows = d.taxLines.map(t =>
    `<tr>
      <td style="${tr}">${e(t.name)} (${t.rate}%)</td>
      <td style="${trR}">${fmt(t.amount)}</td>
    </tr>`).join('');

  return `
<div style="width:794px;background:#fff;padding:44px 48px 48px;position:relative;font-family:Arial,sans-serif;color:#1c1c1e;font-size:14px;line-height:1.55;box-sizing:border-box;">

  <!-- Accent bar -->
  <div style="position:absolute;top:0;left:0;right:0;height:5px;background:${d.brand};"></div>

  <!-- HEADER -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-top:12px;margin-bottom:28px;">

    <!-- Left: logo + company -->
    <div style="flex:1;padding-right:24px;">
      ${d.logoSrc
        ? `<img src="${d.logoSrc}" style="max-width:110px;max-height:65px;object-fit:contain;display:block;margin-bottom:10px;" alt="Logo"/>`
        : ''}
      <div style="font-size:17px;font-weight:700;color:${d.brand};margin-bottom:6px;">${e(d.companyName)}</div>
      <div style="font-size:12px;color:#4b5563;line-height:1.65;white-space:pre-line;">${e(d.companyAddress)}</div>
      ${d.companyContact ? `<div style="font-size:12px;color:#4b5563;margin-top:4px;">${e(d.companyContact)}</div>` : ''}
    </div>

    <!-- Right: invoice title + meta -->
    <div style="text-align:right;flex-shrink:0;">
      <div style="font-size:36px;font-weight:700;color:${d.brand};text-transform:uppercase;letter-spacing:.04em;margin-bottom:14px;">${e(d.docTitle)}</div>
      <table style="border-collapse:collapse;margin-left:auto;">
        <tr>
          <td style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;padding:3px 12px 3px 0;white-space:nowrap;">Invoice #</td>
          <td style="font-size:12px;font-weight:600;background:#f3f4f6;padding:4px 12px;border-radius:5px;white-space:nowrap;">${e(d.invoiceNumber)}</td>
        </tr>
        <tr>
          <td style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;padding:3px 12px 3px 0;">Date</td>
          <td style="font-size:12px;font-weight:600;background:#f3f4f6;padding:4px 12px;border-radius:5px;">${e(d.invoiceDate)}</td>
        </tr>
        <tr>
          <td style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;padding:3px 12px 3px 0;">Due Date</td>
          <td style="font-size:12px;font-weight:600;background:#f3f4f6;padding:4px 12px;border-radius:5px;">${e(d.dueDate)}</td>
        </tr>
        ${d.showPO ? `<tr>
          <td style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;padding:3px 12px 3px 0;">PO #</td>
          <td style="font-size:12px;font-weight:600;background:#f3f4f6;padding:4px 12px;border-radius:5px;">${e(d.poNumber)}</td>
        </tr>` : ''}
      </table>
    </div>
  </div>

  <!-- PARTIES -->
  <div style="display:flex;gap:36px;margin-bottom:22px;padding-bottom:20px;border-bottom:1.5px solid #e5e7eb;">
    <div style="flex:1;">
      <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:${d.brand};margin-bottom:8px;">Bill To</div>
      ${d.billName    ? `<div style="font-size:14px;font-weight:700;color:#111827;margin-bottom:3px;">${e(d.billName)}</div>` : ''}
      ${d.billCompany ? `<div style="font-size:12.5px;color:#374151;margin-bottom:2px;">${e(d.billCompany)}</div>` : ''}
      ${d.billAddress ? `<div style="font-size:12px;color:#4b5563;line-height:1.6;white-space:pre-line;">${e(d.billAddress)}</div>` : ''}
      ${d.billEmail   ? `<div style="font-size:12px;color:#4b5563;margin-top:3px;">${e(d.billEmail)}</div>` : ''}
    </div>
  </div>

  <!-- TAX REGISTRATION IDs -->
  ${(d.showTaxId1 && d.taxId1Value) || (d.showTaxId2 && d.taxId2Value) ? `
  <div style="background:#f8f9fc;border:1px solid #e5e7eb;border-radius:8px;padding:10px 16px;margin-bottom:20px;display:flex;gap:28px;flex-wrap:wrap;">
    ${d.showTaxId1 && d.taxId1Value ? `
    <div>
      <span style="font-size:10.5px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-right:8px;">${e(d.taxId1Label)}</span>
      <span style="font-size:13px;font-weight:600;color:#1c1c1e;">${e(d.taxId1Value)}</span>
    </div>` : ''}
    ${d.showTaxId2 && d.taxId2Value ? `
    <div>
      <span style="font-size:10.5px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-right:8px;">${e(d.taxId2Label)}</span>
      <span style="font-size:13px;font-weight:600;color:#1c1c1e;">${e(d.taxId2Value)}</span>
    </div>` : ''}
  </div>` : ''}

  <!-- LINE ITEMS TABLE -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <thead>
      <tr style="background:${d.brand};">
        <th style="padding:10px 12px;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#fff;text-align:left;width:40%;">Description</th>
        <th style="padding:10px 12px;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#fff;text-align:center;width:8%;">Qty</th>
        <th style="padding:10px 12px;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#fff;text-align:center;width:11%;">Unit</th>
        <th style="padding:10px 12px;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#fff;text-align:right;width:18%;">Rate</th>
        <th style="padding:10px 12px;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#fff;text-align:right;width:23%;">Amount</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <!-- FOOTER: Notes + Totals -->
  <div style="display:flex;gap:28px;align-items:flex-start;">

    <!-- Notes / Terms -->
    <div style="flex:1;">
      ${d.notes ? `
        <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#6b7280;margin-bottom:5px;">Notes</div>
        <div style="font-size:12px;color:#4b5563;line-height:1.7;border:1px solid #e5e7eb;border-radius:7px;padding:10px 12px;background:#fafbfc;margin-bottom:14px;">${nl(d.notes)}</div>` : ''}
      ${d.terms ? `
        <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#6b7280;margin-bottom:5px;">Terms &amp; Conditions</div>
        <div style="font-size:12px;color:#4b5563;line-height:1.7;border:1px solid #e5e7eb;border-radius:7px;padding:10px 12px;background:#fafbfc;">${nl(d.terms)}</div>` : ''}
    </div>

    <!-- Totals -->
    <div style="width:265px;flex-shrink:0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="${tr}">Subtotal</td>
          <td style="${trR}">${fmt(d.subtotal)}</td>
        </tr>
        ${d.showDiscount && d.discountAmt > 0 ? `
        <tr>
          <td style="${tr}">Discount</td>
          <td style="${tr}text-align:right;font-weight:600;color:#ef4444;">−${fmt(d.discountAmt)}</td>
        </tr>` : ''}
        ${d.showTaxable ? `
        <tr>
          <td style="${tr}font-style:italic;color:#9ca3af;font-size:12px;">Taxable Amount</td>
          <td style="${tr}text-align:right;font-style:italic;color:#9ca3af;font-size:12px;">${fmt(d.afterDiscount)}</td>
        </tr>` : ''}
        ${taxRows}
        ${d.showShipping && d.shippingAmt > 0 ? `
        <tr>
          <td style="${tr}">Shipping</td>
          <td style="${trR}">${fmt(d.shippingAmt)}</td>
        </tr>` : ''}
        <tr>
          <td style="padding:11px 0 8px;font-size:16px;font-weight:700;color:#111827;border-top:2.5px solid #1c1c1e;">Total</td>
          <td style="padding:11px 0 8px;font-size:16px;font-weight:700;color:${d.brand};text-align:right;border-top:2.5px solid #1c1c1e;">${fmt(d.grandTotal)}</td>
        </tr>
        ${d.amtPaid > 0 ? `
        <tr>
          <td style="${tr}">Amount Paid</td>
          <td style="${tr}text-align:right;font-weight:600;color:#4b5563;">−${fmt(d.amtPaid)}</td>
        </tr>` : ''}
      </table>

      <!-- Balance Due box -->
      <div style="background:${d.brand};border-radius:8px;padding:13px 16px;display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
        <span style="font-size:15px;font-weight:700;color:#ffffff;">Balance Due</span>
        <span style="font-size:16px;font-weight:700;color:#fcd34d;">${fmt(d.balanceDue)}</span>
      </div>
    </div>

  </div>

  <!-- Footer stamp -->
  <div style="margin-top:36px;padding-top:12px;border-top:1px solid #e8eaed;text-align:center;">
    <span style="font-size:10px;color:#c8cdd6;letter-spacing:.04em;">make-free-invoice.com · Free Invoice Generator</span>
  </div>

</div>`;
}

/* ════════════════════════════════════════
   HELPERS
════════════════════════════════════════ */
function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return isNaN(dt) ? d : dt.toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

let _libsLoaded = false;
async function loadLibraries() {
  if (_libsLoaded && window.html2canvas && window.jspdf) return;
  const libs = [
    { test: () => window.html2canvas, urls: [
        'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
        'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
    ]},
    { test: () => window.jspdf, urls: [
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
        'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
    ]},
  ];
  for (const lib of libs) {
    if (lib.test()) continue;
    let ok = false;
    for (const url of lib.urls) {
      try { await loadScript(url); if (lib.test()) { ok = true; break; } } catch(e) {}
    }
    if (!ok) throw new Error('Could not load PDF library. Check internet connection.');
  }
  _libsLoaded = true;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

const _pdfStyle = document.createElement('style');
_pdfStyle.textContent = '@keyframes pdfSpin { to { transform: rotate(360deg); } }';
document.head.appendChild(_pdfStyle);
