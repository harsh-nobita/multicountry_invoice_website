/* ============================================
   pdf.js – PDF Generation
   
   Strategy: Use jsPDF + html2canvas directly
   on the visible invoice-paper element.
   
   This is the most reliable approach because:
   - The element is already rendered on screen
   - No cloning, no iframes, no off-screen tricks
   - html2canvas captures what's actually visible
   ============================================ */

async function downloadPDF() {

  // ── 1. Show loading state on all PDF buttons ──
  const btns = document.querySelectorAll('[onclick="downloadPDF()"]');
  const originals = [];
  btns.forEach((btn, i) => {
    originals[i] = btn.innerHTML;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:pdfSpin .8s linear infinite;display:inline-block"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Generating…`;
    btn.disabled = true;
  });

  try {
    // ── 2. Load jsPDF + html2canvas from CDN ──
    await loadLibraries();

    // ── 3. Temporarily hide non-invoice UI elements ──
    const hiddenEls = [];
    const selectorsToHide = [
      '.del-btn', '.add-item-btn', '.opt-toggle',
      '.inv-options-row', '.inv-stamp',
      '.logo-placeholder', '#logoUpload'
    ];
    selectorsToHide.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (el.style.display !== 'none') {
          hiddenEls.push({ el, display: el.style.display });
          el.style.display = 'none';
        }
      });
    });

    // ── 4. Also hide empty editable placeholders visually ──
    const editables = document.querySelectorAll('[contenteditable]');
    const savedOutlines = [];
    editables.forEach(el => {
      savedOutlines.push({ el, outline: el.style.outline, bg: el.style.background });
      el.style.outline = 'none';
      el.style.background = 'transparent';
    });

    // ── 5. Grab the invoice paper element (the white card) ──
    const paperEl = document.querySelector('.invoice-paper');
    if (!paperEl) throw new Error('Invoice element not found');

    // Small delay to let style changes apply
    await sleep(200);

    // ── 6. Capture with html2canvas ──
    const canvas = await html2canvas(paperEl, {
      scale:           2,          // 2x for sharp PDF
      useCORS:         true,
      allowTaint:      true,
      backgroundColor: '#ffffff',
      logging:         false,
      removeContainer: true,
    });

    // ── 7. Restore hidden elements ──
    hiddenEls.forEach(({ el, display }) => { el.style.display = display; });
    savedOutlines.forEach(({ el, outline, bg }) => {
      el.style.outline = outline;
      el.style.background = bg;
    });

    // ── 8. Build PDF from canvas ──
    const { jsPDF } = window.jspdf;
    const imgData = canvas.toDataURL('image/jpeg', 0.97);

    const pageW  = 210; // A4 width in mm
    const pageH  = 297; // A4 height in mm
    const margin = 10;  // mm
    const usableW = pageW - margin * 2;

    // Image dimensions in mm at 96dpi (canvas is at 2x scale = 192dpi)
    const imgW = canvas.width  / 2;
    const imgH = canvas.height / 2;
    const ratio = usableW / imgW;      // scale to fit width
    const scaledH = imgH * ratio;      // resulting height in mm (at 96dpi)

    // Convert px to mm (1px = 0.264583 mm at 96dpi)
    const pxToMm = 0.264583;
    const pdfImgW = usableW;
    const pdfImgH = (imgH * pxToMm) * (usableW / (imgW * pxToMm));

    const pdf = new jsPDF({
      orientation: pdfImgH > pageH ? 'portrait' : 'portrait',
      unit:        'mm',
      format:      'a4',
    });

    // If invoice is taller than one A4 page, split across pages
    if (pdfImgH <= pageH - margin * 2) {
      // Fits on one page — vertically center-ish
      pdf.addImage(imgData, 'JPEG', margin, margin, pdfImgW, pdfImgH);
    } else {
      // Multi-page: slice the canvas into A4-height chunks
      const pageHeightPx = ((pageH - margin * 2) / pxToMm) / (pdfImgW / imgW);
      let yOffset = 0;
      let pageNum = 0;

      while (yOffset < imgH) {
        if (pageNum > 0) pdf.addPage();
        const sliceH = Math.min(pageHeightPx, imgH - yOffset);

        // Create a slice canvas
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width  = canvas.width;
        sliceCanvas.height = sliceH * 2; // *2 because canvas is at 2x
        const ctx = sliceCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, yOffset * 2, canvas.width, sliceH * 2, 0, 0, canvas.width, sliceH * 2);

        const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.97);
        const slicePdfH = (sliceH * pxToMm) * (pdfImgW / (imgW * pxToMm));
        pdf.addImage(sliceData, 'JPEG', margin, margin, pdfImgW, slicePdfH);

        yOffset  += sliceH;
        pageNum  += 1;
      }
    }

    // ── 9. Download ──
    const invoiceNum = document.getElementById('invoiceNumber')?.value || 'invoice';
    const filename = invoiceNum.replace(/[^a-zA-Z0-9-_]/g, '_') + '.pdf';
    pdf.save(filename);

    showToast('✓ PDF downloaded successfully!');

  } catch (err) {
    console.error('PDF Error:', err);
    showToast('PDF failed. Use Print (Ctrl+P) as alternative.');
  } finally {
    btns.forEach((btn, i) => {
      btn.innerHTML = originals[i];
      btn.disabled  = false;
    });
  }
}

// ─── Load jsPDF + html2canvas from CDN ────────
let _libsLoaded = false;
async function loadLibraries() {
  if (_libsLoaded && window.html2canvas && window.jspdf) return;

  const libs = [
    {
      check: () => window.html2canvas,
      urls: [
        'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
        'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
      ]
    },
    {
      check: () => window.jspdf,
      urls: [
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
        'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
      ]
    }
  ];

  for (const lib of libs) {
    if (lib.check()) continue;
    let loaded = false;
    for (const url of lib.urls) {
      try {
        await loadScript(url);
        if (lib.check()) { loaded = true; break; }
      } catch(e) { /* try next url */ }
    }
    if (!loaded) throw new Error('Failed to load required library from CDN. Check your internet connection.');
  }
  _libsLoaded = true;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    // Don't load same script twice
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src     = src;
    s.onload  = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Inject spin keyframe once
const _style = document.createElement('style');
_style.textContent = '@keyframes pdfSpin { to { transform: rotate(360deg); } }';
document.head.appendChild(_style);
