/* ============================================
   pdf.js – PDF generation via html2pdf.js
   Generates a clean, invoice-only PDF by cloning
   the live invoice into an isolated container
   with all interactive fields converted to static text.
   ============================================ */

// Load html2pdf.js dynamically, trying multiple CDNs as fallback
const HTML2PDF_CDNS = [
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js',
  'https://unpkg.com/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js',
];

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load script: ' + src));
    document.head.appendChild(script);
  });
}

async function loadHtml2Pdf() {
  if (window.html2pdf) return;
  let lastError = null;
  for (const url of HTML2PDF_CDNS) {
    try {
      await loadScript(url);
      if (window.html2pdf) return;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('Could not load PDF library from any source.');
}

/**
 * Build a standalone, print-safe clone of the invoice.
 */
function buildInvoiceClone() {
  const original = document.getElementById('invoiceDocument');
  const clone = original.cloneNode(true);

  // Resolve current brand colors from CSS variables on :root
  const rootStyles = getComputedStyle(document.documentElement);
  const brand      = (rootStyles.getPropertyValue('--brand') || '#1a3c5e').trim();
  const brandLight = (rootStyles.getPropertyValue('--brand-light') || '#e8f0f8').trim();

  // Remove interactive-only / decorative elements
  clone.querySelectorAll('.del-btn, .add-item-btn, .opt-toggle, .inv-options-row, .inv-stamp, .tax-del, #logoUpload')
    .forEach(el => el.remove());

  // Remove empty line-item rows (no description, qty=0/1 default, rate=0)
  clone.querySelectorAll('#itemsBody tr').forEach(row => {
    const descEl = row.querySelector('.editable');
    const inputs = row.querySelectorAll('input[type="number"]');
    const qty  = parseFloat(inputs[0]?.value || '0');
    const rate = parseFloat(inputs[1]?.value || '0');
    const desc = (descEl?.textContent || '').trim();
    if (!desc && rate === 0) row.remove();
  });

  // Convert contenteditable text blocks to plain divs (keep visible text, drop empty placeholders)
  clone.querySelectorAll('[contenteditable]').forEach(el => {
    el.removeAttribute('contenteditable');
    if (!el.textContent.trim()) {
      el.textContent = '';
      el.style.minHeight = '0';
    }
  });

  // Hide empty notes/terms boxes entirely
  clone.querySelectorAll('.notes-box').forEach(el => {
    if (!el.textContent.trim()) {
      const label = el.previousElementSibling;
      if (label && label.classList.contains('notes-label')) label.remove();
      el.remove();
    }
  });

  // Convert <input> fields to static, formatted text
  clone.querySelectorAll('input').forEach(input => {
    const span = document.createElement('span');
    let value = input.value || '';

    if (input.type === 'date' && value) {
      // Format date nicely (e.g. "Jun 15, 2026")
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d)) {
        value = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      }
    }
    if (input.type === 'number') {
      const num = parseFloat(value) || 0;
      const cell = input.closest('td');
      if (cell && cell.classList.contains('col-rate')) {
        // Rate column shows currency-formatted value (e.g. $200.00)
        value = formatCurrency(num, state.currency);
      } else if (cell && cell.classList.contains('col-qty')) {
        // Quantity stays a plain number
        value = num.toString();
      } else if (input.id === 'discountAmt') {
        // Discount value: shown plain (its unit/% is rendered by the adjacent select)
        value = num.toString();
      } else if (input.id === 'shippingAmt' || input.id === 'amtPaid') {
        // Currency fields
        value = formatCurrency(num, state.currency);
      } else {
        value = num.toString();
      }
    }

    span.textContent = value;
    span.className = 'pdf-static-field';
    if (input.id) span.dataset.field = input.id;

    // Preserve layout sizing where it mattered for inputs (rate column alignment)
    if (input.type === 'number') span.style.textAlign = 'right';
    if (input.classList.contains('meta-input')) span.classList.add('pdf-meta-value');

    input.replaceWith(span);
  });

  // Convert <select> to static text (e.g. discount type "%")
  clone.querySelectorAll('select').forEach(select => {
    const span = document.createElement('span');
    const opt = select.options[select.selectedIndex];
    span.textContent = opt ? opt.textContent : '';
    span.className = 'pdf-static-field';
    select.replaceWith(span);
  });

  // Remove the "Amount Paid" row entirely if nothing has been paid yet
  const liveAmtPaid = parseFloat(document.getElementById('amtPaid')?.value) || 0;
  if (liveAmtPaid === 0) {
    const paidRow = clone.querySelector('.paid-row');
    if (paidRow) paidRow.remove();
  }

  // Hide rows that are still toggled off (defensive — they already have display:none)
  ['discountRow','shippingRow','taxableRow','poRow'].forEach(id => {
    const row = clone.querySelector(`#${id}`);
    if (row && getComputedStyle(document.getElementById(id)).display === 'none') {
      row.remove();
    }
  });

  // Hide empty Ship To block if untouched
  const shipParty = clone.querySelector('.inv-party-right');
  if (shipParty) {
    const fields = shipParty.querySelectorAll('.editable');
    const allEmpty = Array.from(fields).every(f => !f.textContent.trim());
    if (allEmpty) shipParty.remove();
  }

  // Hide tax registration section if both rows are empty/hidden
  const taxIdSection = clone.querySelector('#taxIdSection');
  if (taxIdSection) {
    const liveSection = document.getElementById('taxIdSection');
    if (getComputedStyle(liveSection).display === 'none') {
      taxIdSection.remove();
    } else {
      // Remove any empty registration rows
      ['taxIdRow1','taxIdRow2'].forEach(id => {
        const row = taxIdSection.querySelector(`#${id}`);
        const liveRow = document.getElementById(id);
        if (row && getComputedStyle(liveRow).display === 'none') row.remove();
      });
    }
  }

  // Remove logo placeholder if no logo uploaded; remove broken/empty <img> entirely
  const logoImg = clone.querySelector('#logoImage');
  const logoPlaceholder = clone.querySelector('#logoPlaceholder');
  const logoArea = clone.querySelector('#logoArea');
  if (logoImg && (logoImg.classList.contains('hidden') || !logoImg.getAttribute('src'))) {
    logoImg.remove();
    if (logoArea) logoArea.style.display = 'none';
  } else if (logoImg) {
    logoPlaceholder?.remove();
  }

  // Wrapper with isolated, static styles
  const wrapper = document.createElement('div');
  wrapper.id = 'pdfExportRoot';
  wrapper.style.position = 'fixed';
  wrapper.style.top = '0';
  wrapper.style.left = '-99999px';
  wrapper.style.width = '800px';
  wrapper.style.background = '#ffffff';
  wrapper.style.setProperty('--brand', brand);
  wrapper.style.setProperty('--brand-light', brandLight);

  // `clone` is the outer .invoice-wrapper — strip its spacing.
  // The inner .invoice-paper keeps its class (for table/header styles) but loses shadow/border.
  clone.removeAttribute('id');
  clone.className = 'pdf-clone-wrapper';
  clone.style.margin = '0';
  clone.style.padding = '0';

  const paper = clone.querySelector('.invoice-paper');
  if (paper) {
    paper.style.boxShadow = 'none';
    paper.style.border = 'none';
    paper.style.borderRadius = '0';
    paper.style.padding = '0';
  }

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);
  return wrapper;
}

async function downloadPDF() {
  const btns = document.querySelectorAll('[onclick="downloadPDF()"]');
  const originalHtml = [];
  btns.forEach((btn, i) => {
    originalHtml[i] = btn.innerHTML;
    btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> <span>Generating…</span>`;
    btn.disabled = true;
  });

  let cloneWrapper = null;

  try {
    await loadHtml2Pdf();

    cloneWrapper = buildInvoiceClone();

    const invoiceNum = document.getElementById('invoiceNumber').value || 'invoice';
    const filename = `${invoiceNum.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;

    const opt = {
      margin:      [10, 10, 10, 10],
      filename:    filename,
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800,
        onclone: (clonedDoc) => {
          // Remove external stylesheet <link> tags (e.g. Google Fonts) from the
          // html2canvas-internal document clone — cross-origin/failed stylesheets
          // throw an opaque Event error when html2canvas inspects cssRules.
          clonedDoc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            try {
              const href = link.getAttribute('href') || '';
              if (/^https?:\/\//.test(href) && !href.startsWith(window.location.origin)) {
                link.remove();
              }
            } catch(e) { link.remove(); }
          });
          // Also drop any <script> tags (e.g. AdSense) — irrelevant to rendering and
          // can trigger blocked-resource errors during cloning.
          clonedDoc.querySelectorAll('script').forEach(s => s.remove());
        }
      },
      jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:   { mode: ['avoid-all', 'css'] },
    };

    // html2canvas can occasionally reject with a raw DOM `Event` object
    // (e.g. a blocked/cross-origin stylesheet) instead of an Error.
    // Normalize that into a readable Error so the catch block below works.
    try {
      await html2pdf().set(opt).from(cloneWrapper).save();
    } catch (inner) {
      if (inner instanceof Event || !(inner instanceof Error)) {
        throw new Error('PDF rendering failed (a page resource could not be loaded). Please try again, or use Print instead.');
      }
      throw inner;
    }

    showToast('✓ PDF downloaded successfully!');
  } catch(err) {
    console.error('PDF error:', err);
    showToast(err?.message?.includes('rendering failed')
      ? err.message
      : 'Error generating PDF. Try printing instead (Ctrl+P).');
  } finally {
    if (cloneWrapper) cloneWrapper.remove();
    btns.forEach((btn, i) => {
      btn.innerHTML = originalHtml[i];
      btn.disabled = false;
    });
  }
}

// Add spin animation + static field styling
const spinStyle = document.createElement('style');
spinStyle.textContent = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin .8s linear infinite; }
  #pdfExportRoot .pdf-static-field {
    display: inline-block;
    font-family: inherit;
    color: inherit;
    font-size: inherit;
    font-weight: inherit;
  }
  #pdfExportRoot .pdf-meta-value {
    padding: 5px 10px;
    color: #1c1c1e;
    font-weight: 600;
  }
  #pdfExportRoot .inv-table td .pdf-static-field { width: 100%; }
  #pdfExportRoot .invoice-paper::before { display: none !important; }
`;
document.head.appendChild(spinStyle);
