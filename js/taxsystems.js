/* ============================================
   taxsystems.js – Tax system definitions
   ============================================ */

const TAX_SYSTEMS = {

  none: {
    label: "No Tax",
    description: "No tax applied",
    defaultRates: [],
    registrationFields: [],
  },

  // ── GST – Australia
  gst_au: {
    label: "GST (Australia)",
    description: "Goods and Services Tax",
    defaultRates: [{ name:"GST", rate:10 }],
    registrationFields: [
      { id:"taxIdInput1", label:"ABN", placeholder:"12 345 678 901" },
    ],
    notes: "GST is 10% on most goods and services.",
  },

  // ── GST – New Zealand
  gst_nz: {
    label: "GST (New Zealand)",
    description: "Goods and Services Tax",
    defaultRates: [{ name:"GST", rate:15 }],
    registrationFields: [
      { id:"taxIdInput1", label:"GST Number", placeholder:"12-345-678" },
    ],
  },

  // ── GST – India
  gst_in: {
    label: "GST (India)",
    description: "Goods and Services Tax – CGST + SGST or IGST",
    defaultRates: [
      { name:"CGST", rate:9 },
      { name:"SGST", rate:9 },
    ],
    registrationFields: [
      { id:"taxIdInput1", label:"GSTIN", placeholder:"22AAAAA0000A1Z5" },
      { id:"taxIdInput2", label:"PAN",   placeholder:"AAAAA0000A" },
    ],
    notes: "For inter-state: use IGST 18%. For intra-state: CGST 9% + SGST 9%.",
    presets: [
      { label:"0% (Exempt)", rates:[{name:"CGST",rate:0},{name:"SGST",rate:0}] },
      { label:"5%",  rates:[{name:"CGST",rate:2.5},{name:"SGST",rate:2.5}] },
      { label:"12%", rates:[{name:"CGST",rate:6},{name:"SGST",rate:6}] },
      { label:"18%", rates:[{name:"CGST",rate:9},{name:"SGST",rate:9}] },
      { label:"28%", rates:[{name:"CGST",rate:14},{name:"SGST",rate:14}] },
      { label:"IGST 18% (Inter-state)", rates:[{name:"IGST",rate:18}] },
    ],
  },

  // ── GST – Singapore
  gst_sg: {
    label: "GST (Singapore)",
    description: "Goods and Services Tax",
    defaultRates: [{ name:"GST", rate:9 }],
    registrationFields: [
      { id:"taxIdInput1", label:"GST Reg No.", placeholder:"M12345678X" },
    ],
  },

  // ── GST – Pakistan
  gst_pk: {
    label: "GST (Pakistan)",
    description: "General Sales Tax",
    defaultRates: [{ name:"GST", rate:17 }],
    registrationFields: [
      { id:"taxIdInput1", label:"NTN", placeholder:"1234567-8" },
    ],
  },

  // ── GST/HST/PST – Canada
  gst_hst_pst: {
    label: "GST/HST/PST (Canada)",
    description: "Canadian federal and provincial taxes",
    defaultRates: [{ name:"GST", rate:5 }],
    registrationFields: [
      { id:"taxIdInput1", label:"GST/HST Number", placeholder:"123456789 RT 0001" },
    ],
    presets: [
      { label:"GST only 5%",         rates:[{name:"GST",rate:5}] },
      { label:"HST Ontario 13%",     rates:[{name:"HST",rate:13}] },
      { label:"HST Nova Scotia 15%", rates:[{name:"HST",rate:15}] },
      { label:"GST+PST BC",          rates:[{name:"GST",rate:5},{name:"PST",rate:7}] },
      { label:"GST+QST Quebec",      rates:[{name:"GST",rate:5},{name:"QST",rate:9.975}] },
      { label:"GST+PST Saskatchewan",rates:[{name:"GST",rate:5},{name:"PST",rate:6}] },
      { label:"GST+PST Manitoba",    rates:[{name:"GST",rate:5},{name:"RST",rate:7}] },
    ],
  },

  // ── VAT – EU / Generic
  vat: {
    label: "VAT",
    description: "Value Added Tax",
    defaultRates: [{ name:"VAT", rate:20 }],
    registrationFields: [
      { id:"taxIdInput1", label:"VAT Number", placeholder:"GB123456789" },
    ],
    presets: [
      { label:"5%",  rates:[{name:"VAT",rate:5}] },
      { label:"10%", rates:[{name:"VAT",rate:10}] },
      { label:"15%", rates:[{name:"VAT",rate:15}] },
      { label:"20%", rates:[{name:"VAT",rate:20}] },
      { label:"23%", rates:[{name:"VAT",rate:23}] },
      { label:"25%", rates:[{name:"VAT",rate:25}] },
    ],
  },

  // ── MwSt – Germany / Austria / Switzerland
  mwst: {
    label: "MwSt (Germany/Austria/CH)",
    description: "Mehrwertsteuer",
    defaultRates: [{ name:"MwSt", rate:19 }],
    registrationFields: [
      { id:"taxIdInput1", label:"USt-IdNr", placeholder:"DE123456789" },
    ],
    presets: [
      { label:"7% (reduced)",  rates:[{name:"MwSt",rate:7}] },
      { label:"19% (standard)",rates:[{name:"MwSt",rate:19}] },
      { label:"AT 10%",        rates:[{name:"MwSt",rate:10}] },
      { label:"AT 20%",        rates:[{name:"MwSt",rate:20}] },
      { label:"CH 2.6%",       rates:[{name:"MWST",rate:2.6}] },
      { label:"CH 8.1%",       rates:[{name:"MWST",rate:8.1}] },
    ],
  },

  // ── TVA – France
  tva: {
    label: "TVA (France)",
    description: "Taxe sur la Valeur Ajoutée",
    defaultRates: [{ name:"TVA", rate:20 }],
    registrationFields: [
      { id:"taxIdInput1", label:"Numéro TVA", placeholder:"FR12345678901" },
    ],
    presets: [
      { label:"2.1% (super-réduit)", rates:[{name:"TVA",rate:2.1}] },
      { label:"5.5% (réduit)",       rates:[{name:"TVA",rate:5.5}] },
      { label:"10% (intermédiaire)", rates:[{name:"TVA",rate:10}] },
      { label:"20% (normal)",        rates:[{name:"TVA",rate:20}] },
    ],
  },

  // ── IVA – Mexico
  iva: {
    label: "IVA (Mexico)",
    description: "Impuesto al Valor Agregado",
    defaultRates: [{ name:"IVA", rate:16 }],
    registrationFields: [
      { id:"taxIdInput1", label:"RFC", placeholder:"AAAA010101AAA" },
    ],
    presets: [
      { label:"0%",  rates:[{name:"IVA",rate:0}] },
      { label:"8% (border zone)", rates:[{name:"IVA",rate:8}] },
      { label:"16%", rates:[{name:"IVA",rate:16}] },
    ],
  },

  // ── IVA – EU (Italy, Spain)
  iva_eu: {
    label: "IVA (Italy/Spain)",
    description: "Imposta sul Valore Aggiunto / Impuesto sobre el Valor Añadido",
    defaultRates: [{ name:"IVA", rate:22 }],
    registrationFields: [
      { id:"taxIdInput1", label:"Partita IVA / NIF", placeholder:"IT12345678901" },
    ],
    presets: [
      { label:"IT 4%",  rates:[{name:"IVA",rate:4}] },
      { label:"IT 10%", rates:[{name:"IVA",rate:10}] },
      { label:"IT 22%", rates:[{name:"IVA",rate:22}] },
      { label:"ES 4%",  rates:[{name:"IVA",rate:4}] },
      { label:"ES 10%", rates:[{name:"IVA",rate:10}] },
      { label:"ES 21%", rates:[{name:"IVA",rate:21}] },
    ],
  },

  // ── VAT – GCC (UAE, Saudi, etc.)
  vat_gcc: {
    label: "VAT (GCC Countries)",
    description: "Value Added Tax – Gulf Cooperation Council",
    defaultRates: [{ name:"VAT", rate:5 }],
    registrationFields: [
      { id:"taxIdInput1", label:"TRN / VAT Number", placeholder:"100123456700003" },
    ],
    presets: [
      { label:"0% (Zero-rated)", rates:[{name:"VAT",rate:0}] },
      { label:"5% (Standard)",   rates:[{name:"VAT",rate:5}] },
      { label:"SA 15%",          rates:[{name:"VAT",rate:15}] },
    ],
  },

  // ── SST – Malaysia
  sst: {
    label: "SST (Malaysia)",
    description: "Sales and Service Tax",
    defaultRates: [{ name:"SST", rate:6 }],
    registrationFields: [
      { id:"taxIdInput1", label:"SST Registration No.", placeholder:"W10-1234-12345678" },
    ],
    presets: [
      { label:"Service Tax 6%", rates:[{name:"Service Tax",rate:6}] },
      { label:"Sales Tax 5%",   rates:[{name:"Sales Tax",rate:5}] },
      { label:"Sales Tax 10%",  rates:[{name:"Sales Tax",rate:10}] },
    ],
  },

  // ── PPN – Indonesia
  ppn: {
    label: "PPN (Indonesia)",
    description: "Pajak Pertambahan Nilai",
    defaultRates: [{ name:"PPN", rate:11 }],
    registrationFields: [
      { id:"taxIdInput1", label:"NPWP", placeholder:"12.345.678.9-012.345" },
    ],
  },

  // ── JCT – Japan
  jct: {
    label: "JCT (Japan)",
    description: "Japanese Consumption Tax",
    defaultRates: [{ name:"消費税", rate:10 }],
    registrationFields: [
      { id:"taxIdInput1", label:"Invoice Number (適格請求書)", placeholder:"T1234567890123" },
    ],
    presets: [
      { label:"8% (food/newspapers)", rates:[{name:"消費税",rate:8}] },
      { label:"10% (standard)",       rates:[{name:"消費税",rate:10}] },
    ],
  },

  // ── VAT – China
  vat_cn: {
    label: "VAT (China)",
    description: "增值税 – Value Added Tax",
    defaultRates: [{ name:"增值税", rate:13 }],
    registrationFields: [
      { id:"taxIdInput1", label:"统一社会信用代码", placeholder:"91310000XXXXXXXX" },
    ],
    presets: [
      { label:"1% (small taxpayer)", rates:[{name:"增值税",rate:1}] },
      { label:"6% (services)",       rates:[{name:"增值税",rate:6}] },
      { label:"9% (transport/real estate)", rates:[{name:"增值税",rate:9}] },
      { label:"13% (goods)",         rates:[{name:"增值税",rate:13}] },
    ],
  },

  // ── НДС – Russia
  nds: {
    label: "НДС (Russia)",
    description: "Налог на добавленную стоимость",
    defaultRates: [{ name:"НДС", rate:20 }],
    registrationFields: [
      { id:"taxIdInput1", label:"ИНН", placeholder:"7707083893" },
    ],
    presets: [
      { label:"0%",  rates:[{name:"НДС",rate:0}] },
      { label:"10%", rates:[{name:"НДС",rate:10}] },
      { label:"20%", rates:[{name:"НДС",rate:20}] },
    ],
  },

  // ── US Sales Tax
  sales_tax: {
    label: "Sales Tax (US)",
    description: "US state and local sales tax",
    defaultRates: [{ name:"Sales Tax", rate:0 }],
    registrationFields: [],
    notes: "US sales tax varies by state. Enter your applicable rate. No federal VAT in the US.",
    presets: [
      { label:"No tax (5 states)", rates:[{name:"Sales Tax",rate:0}] },
      { label:"CA 7.25%", rates:[{name:"Sales Tax",rate:7.25}] },
      { label:"TX 6.25%", rates:[{name:"Sales Tax",rate:6.25}] },
      { label:"NY 4%",    rates:[{name:"Sales Tax",rate:4}] },
      { label:"FL 6%",    rates:[{name:"Sales Tax",rate:6}] },
      { label:"WA 6.5%",  rates:[{name:"Sales Tax",rate:6.5}] },
    ],
  },

  // ── IVA – Argentina / Colombia / Chile / Peru
  igv: {
    label: "IGV (Peru)",
    description: "Impuesto General a las Ventas",
    defaultRates: [{ name:"IGV", rate:18 }],
    registrationFields: [
      { id:"taxIdInput1", label:"RUC", placeholder:"20123456789" },
    ],
  },

  // ── ICMS/IPI – Brazil
  icms_ipi: {
    label: "ICMS/IPI (Brazil)",
    description: "Imposto sobre Circulação de Mercadorias e Serviços",
    defaultRates: [{ name:"ICMS", rate:12 }],
    registrationFields: [
      { id:"taxIdInput1", label:"CNPJ",   placeholder:"12.345.678/0001-90" },
      { id:"taxIdInput2", label:"Insc. Estadual", placeholder:"State registration" },
    ],
    presets: [
      { label:"ICMS 12%",       rates:[{name:"ICMS",rate:12}] },
      { label:"ICMS 17%",       rates:[{name:"ICMS",rate:17}] },
      { label:"ISS 5%",         rates:[{name:"ISS",rate:5}] },
      { label:"PIS 0.65% + COFINS 3%", rates:[{name:"PIS",rate:0.65},{name:"COFINS",rate:3}] },
    ],
  },
};

// Populate tax system select based on selected country
function populateTaxSelect(taxSystemKey) {
  const sel = document.getElementById('taxSystemSelect');
  sel.innerHTML = '';

  // Always add "No Tax"
  const noneOpt = document.createElement('option');
  noneOpt.value = 'none';
  noneOpt.textContent = 'No Tax';
  sel.appendChild(noneOpt);

  // Add country-specific system first
  if (taxSystemKey && taxSystemKey !== 'none' && TAX_SYSTEMS[taxSystemKey]) {
    const opt = document.createElement('option');
    opt.value = taxSystemKey;
    opt.textContent = TAX_SYSTEMS[taxSystemKey].label;
    sel.appendChild(opt);
    sel.value = taxSystemKey;
  }

  // Add all others (sorted)
  Object.entries(TAX_SYSTEMS).forEach(([key, sys]) => {
    if (key === 'none' || key === taxSystemKey) return;
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = sys.label;
    sel.appendChild(opt);
  });

  if (!taxSystemKey || taxSystemKey === 'none') sel.value = 'none';
}

function getTaxSystem(key) {
  return TAX_SYSTEMS[key] || TAX_SYSTEMS.none;
}

document.addEventListener('DOMContentLoaded', () => populateTaxSelect('none'));
