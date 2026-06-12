/* ============================================
   invoice.js – Core invoice logic
   ============================================ */

// ── STATE ─────────────────────────────────────
let state = {
  currency: 'USD',
  country:  '',
  taxSystem:'none',
  taxLines: [],   // [{id, name, rate}]
  themeColor: '#1a3c5e',
  items: [],
  showDiscount: false,
  showShipping: false,
};

let itemIdCounter = 0;

// ── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setTodayDates();
  addItem(); addItem(); addItem();
  loadFromLocalStorage();
  recalculate();
  setupAutoSave();
});

function setTodayDates() {
  const today = new Date();
  const fmt = d => d.toISOString().split('T')[0];
  document.getElementById('invoiceDate').value = fmt(today);
  const due = new Date(today); due.setDate(due.getDate() + 30);
  document.getElementById('dueDate').value = fmt(due);
}

// ── COUNTRY / CURRENCY CHANGE ──────────────────
function onCountryChange() {
  const code = document.getElementById('countrySelect').value;
  if (!code) return;
  const country = getCountryData(code);
  if (!country) return;
  state.country = code;

  // Set currency
  document.getElementById('currencySelect').value = country.currency;
  state.currency = country.currency;

  // Set tax system
  populateTaxSelect(country.taxSystem);
  state.taxSystem = country.taxSystem;
  applyTaxSystem(country.taxSystem);

  showToast(`✓ Set to ${country.name} · ${country.currency}`);
  recalculate();
}

function onCurrencyChange() {
  state.currency = document.getElementById('currencySelect').value;
  recalculate();
}

function onTaxSystemChange() {
  const key = document.getElementById('taxSystemSelect').value;
  state.taxSystem = key;
  applyTaxSystem(key);
  recalculate();
}

function applyTaxSystem(key) {
  const sys = getTaxSystem(key);
  const taxSection = document.getElementById('taxIdSection');
  const row1 = document.getElementById('taxIdRow1');
  const row2 = document.getElementById('taxIdRow2');

  // Reset
  row1.style.display = 'none';
  row2.style.display = 'none';
  taxSection.style.display = 'none';

  if (sys.registrationFields && sys.registrationFields.length > 0) {
    taxSection.style.display = 'flex';
    sys.registrationFields.forEach((f, i) => {
      const rowEl = document.getElementById(`taxIdRow${i+1}`);
      const labelEl = document.getElementById(`taxIdLabel${i+1}`);
      const inputEl = document.getElementById(`taxIdInput${i+1}`);
      if (rowEl && labelEl && inputEl) {
        rowEl.style.display = 'flex';
        labelEl.textContent = f.label;
        inputEl.placeholder = f.placeholder || '';
      }
    });
  }

  // Apply default tax rates
  state.taxLines = [];
  document.getElementById('taxRowsContainer').innerHTML = '';

  if (key !== 'none' && sys.defaultRates) {
    sys.defaultRates.forEach(r => addTaxLineWithData(r.name, r.rate));
  }
}

// ── TAX LINES ─────────────────────────────────
function addTaxLine() {
  const sys = getTaxSystem(state.taxSystem);
  const defaultName = sys.defaultRates && sys.defaultRates[0] ? sys.defaultRates[0].name : 'Tax';
  addTaxLineWithData(defaultName, 0);
  recalculate();
}

function addTaxLineWithData(name, rate) {
  const id = 'tax_' + (++itemIdCounter);
  state.taxLines.push({ id, name, rate });
  renderTaxLine(id, name, rate);
}

function renderTaxLine(id, name, rate) {
  const container = document.getElementById('taxRowsContainer');
  const div = document.createElement('div');
  div.className = 'tax-rate-row';
  div.id = id;
  div.innerHTML = `
    <span>
      <input type="text" class="tax-name-input" value="${name}" onchange="updateTaxLine('${id}','name',this.value)" />
      <input type="number" class="tax-pct-input" value="${rate}" min="0" max="100" step="0.01" onchange="updateTaxLine('${id}','rate',this.value)" />%
    </span>
    <span class="tax-amount" id="${id}_amount">$0.00</span>
    <button class="tax-del" onclick="removeTaxLine('${id}')">✕</button>
  `;
  container.appendChild(div);
}

function updateTaxLine(id, field, val) {
  const line = state.taxLines.find(t => t.id === id);
  if (!line) return;
  if (field === 'rate') line.rate = parseFloat(val) || 0;
  if (field === 'name') line.name = val;
  recalculate();
}

function removeTaxLine(id) {
  state.taxLines = state.taxLines.filter(t => t.id !== id);
  const el = document.getElementById(id);
  if (el) el.remove();
  recalculate();
}

// ── ITEMS ──────────────────────────────────────
function addItem() {
  const id = 'item_' + (++itemIdCounter);
  state.items.push({ id, description:'', qty:1, unit:'', rate:0, amount:0 });
  renderItem(id);
  recalculate();
}

function renderItem(id) {
  const tbody = document.getElementById('itemsBody');
  const tr = document.createElement('tr');
  tr.id = id;
  tr.innerHTML = `
    <td class="col-item">
      <div class="editable" contenteditable="true" data-placeholder="Item description…"
           oninput="updateItem('${id}','description',this.textContent)"></div>
    </td>
    <td class="col-qty">
      <input type="number" value="1" min="0" step="any"
             onchange="updateItem('${id}','qty',this.value)" onkeyup="updateItem('${id}','qty',this.value)" />
    </td>
    <td class="col-unit">
      <input type="text" placeholder="hrs, pcs…"
             onchange="updateItem('${id}','unit',this.value)" />
    </td>
    <td class="col-rate">
      <input type="number" value="0" min="0" step="any"
             onchange="updateItem('${id}','rate',this.value)" onkeyup="updateItem('${id}','rate',this.value)" />
    </td>
    <td class="col-total" id="${id}_amount">$0.00</td>
    <td class="col-del">
      <button class="del-btn" onclick="removeItem('${id}')" title="Remove">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </button>
    </td>
  `;
  tbody.appendChild(tr);
}

function updateItem(id, field, val) {
  const item = state.items.find(i => i.id === id);
  if (!item) return;
  if (field === 'qty' || field === 'rate') item[field] = parseFloat(val) || 0;
  else item[field] = val;
  recalculate();
}

function removeItem(id) {
  state.items = state.items.filter(i => i.id !== id);
  const el = document.getElementById(id);
  if (el) el.remove();
  recalculate();
}

// ── CALCULATIONS ───────────────────────────────
function recalculate() {
  const cur = CURRENCIES[state.currency] || CURRENCIES['USD'];
  const fmt = n => formatCurrency(n, state.currency);

  // Line item totals
  let subtotal = 0;
  state.items.forEach(item => {
    item.amount = (item.qty || 0) * (item.rate || 0);
    subtotal += item.amount;
    const amtEl = document.getElementById(item.id + '_amount');
    if (amtEl) amtEl.textContent = fmt(item.amount);
  });

  // Discount
  let discountAmt = 0;
  if (state.showDiscount) {
    const discVal = parseFloat(document.getElementById('discountAmt').value) || 0;
    const discType = document.getElementById('discountType').value;
    discountAmt = discType === 'pct' ? subtotal * (discVal / 100) : discVal;
    document.getElementById('discountVal').textContent = `-${fmt(discountAmt)}`;
  }

  const afterDiscount = subtotal - discountAmt;

  // Tax lines
  let totalTax = 0;
  state.taxLines.forEach(t => {
    const taxAmt = afterDiscount * (t.rate / 100);
    totalTax += taxAmt;
    const el = document.getElementById(t.id + '_amount');
    if (el) el.textContent = fmt(taxAmt);
  });

  // Shipping
  let shippingAmt = 0;
  if (state.showShipping) {
    shippingAmt = parseFloat(document.getElementById('shippingAmt').value) || 0;
  }

  const grandTotal = afterDiscount + totalTax + shippingAmt;
  const amtPaid = parseFloat(document.getElementById('amtPaid').value) || 0;
  const balanceDue = grandTotal - amtPaid;

  // Update display
  document.getElementById('subtotalVal').textContent = fmt(subtotal);
  document.getElementById('grandTotalVal').textContent = fmt(grandTotal);
  document.getElementById('balanceDueVal').textContent = fmt(balanceDue);
}

function formatCurrency(amount, currencyCode) {
  const cur = CURRENCIES[currencyCode] || { symbol:'$', decimals:2 };
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: cur.decimals,
      maximumFractionDigits: cur.decimals,
    }).format(amount);
  } catch(e) {
    return `${cur.symbol}${amount.toFixed(cur.decimals)}`;
  }
}

// ── TOGGLES ────────────────────────────────────
function toggleDiscount() {
  state.showDiscount = !state.showDiscount;
  document.getElementById('discountRow').style.display = state.showDiscount ? 'flex' : 'none';
  document.getElementById('discountToggle').textContent = state.showDiscount ? '✕ Discount' : '+ Discount';
  recalculate();
}
function toggleShipping() {
  state.showShipping = !state.showShipping;
  document.getElementById('shippingRow').style.display = state.showShipping ? 'flex' : 'none';
  document.getElementById('shippingToggle').textContent = state.showShipping ? '✕ Shipping' : '+ Shipping';
  recalculate();
}
function togglePO() {
  const row = document.getElementById('poRow');
  const vis = row.style.display !== 'none';
  row.style.display = vis ? 'none' : 'flex';
  document.getElementById('poToggle').textContent = vis ? '+ PO Number' : '✕ PO Number';
}

// ── THEME COLOR ────────────────────────────────
function setThemeColor(el) {
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  const color = el.dataset.color;
  state.themeColor = color;
  document.documentElement.style.setProperty('--brand', color);
  // Also update brand-light
  document.documentElement.style.setProperty('--brand-light', hexToLightBg(color));
}

function hexToLightBg(hex) {
  try {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},0.1)`;
  } catch(e) { return '#e8eef5'; }
}

// ── LOGO ───────────────────────────────────────
function uploadLogo(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById('logoImage');
    img.src = e.target.result;
    img.classList.remove('hidden');
    document.getElementById('logoPlaceholder').classList.add('hidden');
  };
  reader.readAsDataURL(file);
}

// ── SAVE / LOAD ────────────────────────────────
function saveInvoice() {
  const data = collectInvoiceData();
  localStorage.setItem('invoiceforge_save', JSON.stringify(data));
  showToast('✓ Invoice saved locally');
}

function loadSavedInvoice() {
  const raw = localStorage.getItem('invoiceforge_save');
  if (!raw) { showToast('No saved invoice found.'); return; }
  try {
    const data = JSON.parse(raw);
    restoreInvoiceData(data);
    showToast('✓ Invoice loaded');
  } catch(e) { showToast('Error loading invoice.'); }
}

function loadFromLocalStorage() {
  const raw = localStorage.getItem('invoiceforge_autosave');
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    restoreInvoiceData(data);
  } catch(e) {}
}

function setupAutoSave() {
  setInterval(() => {
    const data = collectInvoiceData();
    localStorage.setItem('invoiceforge_autosave', JSON.stringify(data));
  }, 10000); // every 10s
}

function collectInvoiceData() {
  return {
    currency:   state.currency,
    country:    state.country,
    taxSystem:  state.taxSystem,
    taxLines:   state.taxLines,
    themeColor: state.themeColor,
    showDiscount: state.showDiscount,
    showShipping: state.showShipping,
    invoiceNumber: document.getElementById('invoiceNumber').value,
    invoiceDate:   document.getElementById('invoiceDate').value,
    dueDate:       document.getElementById('dueDate').value,
    poNumber:      document.getElementById('poNumber').value,
    amtPaid:       document.getElementById('amtPaid').value,
    discountAmt:   document.getElementById('discountAmt')?.value || 0,
    shippingAmt:   document.getElementById('shippingAmt')?.value || 0,
    notes:         document.getElementById('notesBox').textContent,
    terms:         document.getElementById('termsBox').textContent,
    editables:     Array.from(document.querySelectorAll('.editable[contenteditable]')).map(e => ({
      className: e.className, text: e.textContent
    })),
  };
}

function restoreInvoiceData(data) {
  if (data.currency) {
    state.currency = data.currency;
    document.getElementById('currencySelect').value = data.currency;
  }
  if (data.invoiceNumber) document.getElementById('invoiceNumber').value = data.invoiceNumber;
  if (data.invoiceDate)   document.getElementById('invoiceDate').value = data.invoiceDate;
  if (data.dueDate)       document.getElementById('dueDate').value = data.dueDate;
  if (data.poNumber)      document.getElementById('poNumber').value = data.poNumber;
  if (data.amtPaid)       document.getElementById('amtPaid').value = data.amtPaid;
  if (data.notes)         document.getElementById('notesBox').textContent = data.notes;
  if (data.terms)         document.getElementById('termsBox').textContent = data.terms;
  if (data.showDiscount)  toggleDiscount();
  if (data.showShipping)  toggleShipping();
  recalculate();
}

function clearInvoice() {
  if (!confirm('Clear all invoice data? This cannot be undone.')) return;
  localStorage.removeItem('invoiceforge_autosave');
  location.reload();
}

// ── PRINT ──────────────────────────────────────
function previewPrint() { window.print(); }
function sendEmail() {
  const num = document.getElementById('invoiceNumber').value || 'Invoice';
  window.location.href = `mailto:?subject=${encodeURIComponent(num)}&body=${encodeURIComponent('Please find the invoice attached.')}`;
}

// ── TOAST ──────────────────────────────────────
function showToast(msg, duration=2800) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}
