/* ============================================
   pdf.js – PDF generation via html2pdf.js
   ============================================ */

// Load html2pdf.js dynamically (CDN)
function loadHtml2Pdf() {
  return new Promise((resolve, reject) => {
    if (window.html2pdf) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function downloadPDF() {
  const btn = document.querySelector('.btn-primary');
  const originalText = btn.innerHTML;
  btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Generating…`;
  btn.disabled = true;

  try {
    await loadHtml2Pdf();

    const element = document.getElementById('invoiceDocument');

    // Temporarily hide non-printable elements
    const hideEls = document.querySelectorAll('.del-btn, .add-item-btn, .opt-toggle, .inv-options-row, .inv-stamp');
    hideEls.forEach(el => el.dataset.hiddenForPdf = el.style.display);
    hideEls.forEach(el => el.style.display = 'none');

    const invoiceNum = document.getElementById('invoiceNumber').value || 'invoice';
    const filename = `${invoiceNum.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;

    const opt = {
      margin:      [10, 10, 10, 10],
      filename:    filename,
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:   { mode: ['avoid-all', 'css'] },
    };

    await html2pdf().set(opt).from(element).save();

    // Restore hidden elements
    hideEls.forEach(el => { el.style.display = el.dataset.hiddenForPdf || ''; });

    showToast('✓ PDF downloaded successfully!');
  } catch(err) {
    console.error('PDF error:', err);
    showToast('Error generating PDF. Try printing instead (Ctrl+P).');
    // Restore hidden elements on error
    document.querySelectorAll('[data-hidden-for-pdf]').forEach(el => {
      el.style.display = el.dataset.hiddenForPdf || '';
    });
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// Add spin animation for loading button
const spinStyle = document.createElement('style');
spinStyle.textContent = `
  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin .8s linear infinite; }
`;
document.head.appendChild(spinStyle);
