/* ============================================
   countries.js – Country / Currency / Tax data
   ============================================ */

const COUNTRIES = [
  // North America
  { code:"US", name:"United States",           currency:"USD", taxSystem:"sales_tax",   locale:"en-US", dateFormat:"MM/DD/YYYY" },
  { code:"CA", name:"Canada",                  currency:"CAD", taxSystem:"gst_hst_pst", locale:"en-CA", dateFormat:"YYYY-MM-DD" },
  { code:"MX", name:"Mexico",                  currency:"MXN", taxSystem:"iva",         locale:"es-MX", dateFormat:"DD/MM/YYYY" },

  // Europe
  { code:"GB", name:"United Kingdom",          currency:"GBP", taxSystem:"vat",         locale:"en-GB", dateFormat:"DD/MM/YYYY" },
  { code:"DE", name:"Germany",                 currency:"EUR", taxSystem:"mwst",        locale:"de-DE", dateFormat:"DD.MM.YYYY" },
  { code:"FR", name:"France",                  currency:"EUR", taxSystem:"tva",         locale:"fr-FR", dateFormat:"DD/MM/YYYY" },
  { code:"IT", name:"Italy",                   currency:"EUR", taxSystem:"iva_eu",      locale:"it-IT", dateFormat:"DD/MM/YYYY" },
  { code:"ES", name:"Spain",                   currency:"EUR", taxSystem:"iva_eu",      locale:"es-ES", dateFormat:"DD/MM/YYYY" },
  { code:"NL", name:"Netherlands",             currency:"EUR", taxSystem:"vat",         locale:"nl-NL", dateFormat:"DD-MM-YYYY" },
  { code:"BE", name:"Belgium",                 currency:"EUR", taxSystem:"vat",         locale:"nl-BE", dateFormat:"DD/MM/YYYY" },
  { code:"AT", name:"Austria",                 currency:"EUR", taxSystem:"mwst",        locale:"de-AT", dateFormat:"DD.MM.YYYY" },
  { code:"CH", name:"Switzerland",             currency:"CHF", taxSystem:"mwst",        locale:"de-CH", dateFormat:"DD.MM.YYYY" },
  { code:"SE", name:"Sweden",                  currency:"SEK", taxSystem:"vat",         locale:"sv-SE", dateFormat:"YYYY-MM-DD" },
  { code:"NO", name:"Norway",                  currency:"NOK", taxSystem:"vat",         locale:"nb-NO", dateFormat:"DD.MM.YYYY" },
  { code:"DK", name:"Denmark",                 currency:"DKK", taxSystem:"vat",         locale:"da-DK", dateFormat:"DD-MM-YYYY" },
  { code:"FI", name:"Finland",                 currency:"EUR", taxSystem:"vat",         locale:"fi-FI", dateFormat:"DD.MM.YYYY" },
  { code:"PL", name:"Poland",                  currency:"PLN", taxSystem:"vat",         locale:"pl-PL", dateFormat:"DD.MM.YYYY" },
  { code:"PT", name:"Portugal",                currency:"EUR", taxSystem:"vat",         locale:"pt-PT", dateFormat:"DD/MM/YYYY" },
  { code:"IE", name:"Ireland",                 currency:"EUR", taxSystem:"vat",         locale:"en-IE", dateFormat:"DD/MM/YYYY" },
  { code:"GR", name:"Greece",                  currency:"EUR", taxSystem:"vat",         locale:"el-GR", dateFormat:"DD/MM/YYYY" },
  { code:"CZ", name:"Czech Republic",          currency:"CZK", taxSystem:"vat",         locale:"cs-CZ", dateFormat:"DD.MM.YYYY" },
  { code:"HU", name:"Hungary",                 currency:"HUF", taxSystem:"vat",         locale:"hu-HU", dateFormat:"YYYY.MM.DD" },
  { code:"RO", name:"Romania",                 currency:"RON", taxSystem:"vat",         locale:"ro-RO", dateFormat:"DD.MM.YYYY" },
  { code:"UA", name:"Ukraine",                 currency:"UAH", taxSystem:"vat",         locale:"uk-UA", dateFormat:"DD.MM.YYYY" },
  { code:"RU", name:"Russia",                  currency:"RUB", taxSystem:"nds",         locale:"ru-RU", dateFormat:"DD.MM.YYYY" },

  // Asia-Pacific
  { code:"AU", name:"Australia",               currency:"AUD", taxSystem:"gst_au",      locale:"en-AU", dateFormat:"DD/MM/YYYY" },
  { code:"NZ", name:"New Zealand",             currency:"NZD", taxSystem:"gst_nz",      locale:"en-NZ", dateFormat:"DD/MM/YYYY" },
  { code:"IN", name:"India",                   currency:"INR", taxSystem:"gst_in",      locale:"en-IN", dateFormat:"DD/MM/YYYY" },
  { code:"CN", name:"China",                   currency:"CNY", taxSystem:"vat_cn",      locale:"zh-CN", dateFormat:"YYYY/MM/DD" },
  { code:"JP", name:"Japan",                   currency:"JPY", taxSystem:"jct",         locale:"ja-JP", dateFormat:"YYYY/MM/DD" },
  { code:"KR", name:"South Korea",             currency:"KRW", taxSystem:"vat",         locale:"ko-KR", dateFormat:"YYYY.MM.DD" },
  { code:"SG", name:"Singapore",               currency:"SGD", taxSystem:"gst_sg",      locale:"en-SG", dateFormat:"DD/MM/YYYY" },
  { code:"MY", name:"Malaysia",                currency:"MYR", taxSystem:"sst",         locale:"ms-MY", dateFormat:"DD/MM/YYYY" },
  { code:"ID", name:"Indonesia",               currency:"IDR", taxSystem:"ppn",         locale:"id-ID", dateFormat:"DD/MM/YYYY" },
  { code:"TH", name:"Thailand",                currency:"THB", taxSystem:"vat",         locale:"th-TH", dateFormat:"DD/MM/YYYY" },
  { code:"PH", name:"Philippines",             currency:"PHP", taxSystem:"vat",         locale:"en-PH", dateFormat:"MM/DD/YYYY" },
  { code:"VN", name:"Vietnam",                 currency:"VND", taxSystem:"vat",         locale:"vi-VN", dateFormat:"DD/MM/YYYY" },
  { code:"PK", name:"Pakistan",                currency:"PKR", taxSystem:"gst_pk",      locale:"en-PK", dateFormat:"DD/MM/YYYY" },
  { code:"BD", name:"Bangladesh",              currency:"BDT", taxSystem:"vat",         locale:"en-BD", dateFormat:"DD/MM/YYYY" },
  { code:"LK", name:"Sri Lanka",               currency:"LKR", taxSystem:"vat",         locale:"en-LK", dateFormat:"DD/MM/YYYY" },
  { code:"HK", name:"Hong Kong",               currency:"HKD", taxSystem:"none",        locale:"en-HK", dateFormat:"DD/MM/YYYY" },
  { code:"TW", name:"Taiwan",                  currency:"TWD", taxSystem:"vat",         locale:"zh-TW", dateFormat:"YYYY/MM/DD" },

  // Middle East & Africa
  { code:"AE", name:"United Arab Emirates",    currency:"AED", taxSystem:"vat_gcc",     locale:"ar-AE", dateFormat:"DD/MM/YYYY" },
  { code:"SA", name:"Saudi Arabia",            currency:"SAR", taxSystem:"vat_gcc",     locale:"ar-SA", dateFormat:"DD/MM/YYYY" },
  { code:"QA", name:"Qatar",                   currency:"QAR", taxSystem:"none",        locale:"ar-QA", dateFormat:"DD/MM/YYYY" },
  { code:"KW", name:"Kuwait",                  currency:"KWD", taxSystem:"none",        locale:"ar-KW", dateFormat:"DD/MM/YYYY" },
  { code:"BH", name:"Bahrain",                 currency:"BHD", taxSystem:"vat_gcc",     locale:"ar-BH", dateFormat:"DD/MM/YYYY" },
  { code:"OM", name:"Oman",                    currency:"OMR", taxSystem:"vat_gcc",     locale:"ar-OM", dateFormat:"DD/MM/YYYY" },
  { code:"IL", name:"Israel",                  currency:"ILS", taxSystem:"vat",         locale:"he-IL", dateFormat:"DD/MM/YYYY" },
  { code:"ZA", name:"South Africa",            currency:"ZAR", taxSystem:"vat",         locale:"en-ZA", dateFormat:"YYYY/MM/DD" },
  { code:"EG", name:"Egypt",                   currency:"EGP", taxSystem:"vat",         locale:"ar-EG", dateFormat:"DD/MM/YYYY" },
  { code:"NG", name:"Nigeria",                 currency:"NGN", taxSystem:"vat",         locale:"en-NG", dateFormat:"DD/MM/YYYY" },
  { code:"KE", name:"Kenya",                   currency:"KES", taxSystem:"vat",         locale:"en-KE", dateFormat:"DD/MM/YYYY" },
  { code:"GH", name:"Ghana",                   currency:"GHS", taxSystem:"vat",         locale:"en-GH", dateFormat:"DD/MM/YYYY" },
  { code:"MA", name:"Morocco",                 currency:"MAD", taxSystem:"vat",         locale:"ar-MA", dateFormat:"DD/MM/YYYY" },
  { code:"TZ", name:"Tanzania",                currency:"TZS", taxSystem:"vat",         locale:"en-TZ", dateFormat:"DD/MM/YYYY" },
  { code:"UG", name:"Uganda",                  currency:"UGX", taxSystem:"vat",         locale:"en-UG", dateFormat:"DD/MM/YYYY" },
  { code:"ET", name:"Ethiopia",                currency:"ETB", taxSystem:"vat",         locale:"en-ET", dateFormat:"DD/MM/YYYY" },

  // Latin America
  { code:"BR", name:"Brazil",                  currency:"BRL", taxSystem:"icms_ipi",    locale:"pt-BR", dateFormat:"DD/MM/YYYY" },
  { code:"AR", name:"Argentina",               currency:"ARS", taxSystem:"iva",         locale:"es-AR", dateFormat:"DD/MM/YYYY" },
  { code:"CO", name:"Colombia",                currency:"COP", taxSystem:"iva",         locale:"es-CO", dateFormat:"DD/MM/YYYY" },
  { code:"CL", name:"Chile",                   currency:"CLP", taxSystem:"iva",         locale:"es-CL", dateFormat:"DD/MM/YYYY" },
  { code:"PE", name:"Peru",                    currency:"PEN", taxSystem:"igv",         locale:"es-PE", dateFormat:"DD/MM/YYYY" },
  { code:"VE", name:"Venezuela",               currency:"VES", taxSystem:"iva",         locale:"es-VE", dateFormat:"DD/MM/YYYY" },
  { code:"UY", name:"Uruguay",                 currency:"UYU", taxSystem:"iva",         locale:"es-UY", dateFormat:"DD/MM/YYYY" },
];

const CURRENCIES = {
  USD: { symbol:"$",   name:"US Dollar",           decimals:2 },
  EUR: { symbol:"€",   name:"Euro",                decimals:2 },
  GBP: { symbol:"£",   name:"British Pound",       decimals:2 },
  CAD: { symbol:"CA$", name:"Canadian Dollar",     decimals:2 },
  AUD: { symbol:"A$",  name:"Australian Dollar",   decimals:2 },
  NZD: { symbol:"NZ$", name:"New Zealand Dollar",  decimals:2 },
  CHF: { symbol:"CHF", name:"Swiss Franc",         decimals:2 },
  JPY: { symbol:"¥",   name:"Japanese Yen",        decimals:0 },
  CNY: { symbol:"¥",   name:"Chinese Yuan",        decimals:2 },
  INR: { symbol:"₹",   name:"Indian Rupee",        decimals:2 },
  SGD: { symbol:"S$",  name:"Singapore Dollar",    decimals:2 },
  HKD: { symbol:"HK$", name:"Hong Kong Dollar",    decimals:2 },
  KRW: { symbol:"₩",   name:"South Korean Won",    decimals:0 },
  MXN: { symbol:"$",   name:"Mexican Peso",        decimals:2 },
  BRL: { symbol:"R$",  name:"Brazilian Real",      decimals:2 },
  ARS: { symbol:"$",   name:"Argentine Peso",      decimals:2 },
  CLP: { symbol:"$",   name:"Chilean Peso",        decimals:0 },
  COP: { symbol:"$",   name:"Colombian Peso",      decimals:0 },
  PEN: { symbol:"S/",  name:"Peruvian Sol",        decimals:2 },
  VES: { symbol:"Bs",  name:"Venezuelan Bolívar",  decimals:2 },
  UYU: { symbol:"$",   name:"Uruguayan Peso",      decimals:2 },
  AED: { symbol:"د.إ", name:"UAE Dirham",          decimals:2 },
  SAR: { symbol:"﷼",   name:"Saudi Riyal",         decimals:2 },
  QAR: { symbol:"ر.ق", name:"Qatari Riyal",        decimals:2 },
  KWD: { symbol:"د.ك", name:"Kuwaiti Dinar",       decimals:3 },
  BHD: { symbol:".د.ب",name:"Bahraini Dinar",      decimals:3 },
  OMR: { symbol:"﷼",   name:"Omani Rial",          decimals:3 },
  ILS: { symbol:"₪",   name:"Israeli Shekel",      decimals:2 },
  ZAR: { symbol:"R",   name:"South African Rand",  decimals:2 },
  EGP: { symbol:"£",   name:"Egyptian Pound",      decimals:2 },
  NGN: { symbol:"₦",   name:"Nigerian Naira",      decimals:2 },
  KES: { symbol:"KSh", name:"Kenyan Shilling",     decimals:2 },
  GHS: { symbol:"₵",   name:"Ghanaian Cedi",       decimals:2 },
  MAD: { symbol:"MAD", name:"Moroccan Dirham",     decimals:2 },
  TZS: { symbol:"TSh", name:"Tanzanian Shilling",  decimals:0 },
  UGX: { symbol:"USh", name:"Ugandan Shilling",    decimals:0 },
  ETB: { symbol:"Br",  name:"Ethiopian Birr",      decimals:2 },
  SEK: { symbol:"kr",  name:"Swedish Krona",       decimals:2 },
  NOK: { symbol:"kr",  name:"Norwegian Krone",     decimals:2 },
  DKK: { symbol:"kr",  name:"Danish Krone",        decimals:2 },
  PLN: { symbol:"zł",  name:"Polish Zloty",        decimals:2 },
  CZK: { symbol:"Kč",  name:"Czech Koruna",        decimals:2 },
  HUF: { symbol:"Ft",  name:"Hungarian Forint",    decimals:0 },
  RON: { symbol:"lei", name:"Romanian Leu",        decimals:2 },
  UAH: { symbol:"₴",   name:"Ukrainian Hryvnia",   decimals:2 },
  RUB: { symbol:"₽",   name:"Russian Ruble",       decimals:2 },
  MYR: { symbol:"RM",  name:"Malaysian Ringgit",   decimals:2 },
  IDR: { symbol:"Rp",  name:"Indonesian Rupiah",   decimals:0 },
  THB: { symbol:"฿",   name:"Thai Baht",           decimals:2 },
  PHP: { symbol:"₱",   name:"Philippine Peso",     decimals:2 },
  VND: { symbol:"₫",   name:"Vietnamese Dong",     decimals:0 },
  PKR: { symbol:"₨",   name:"Pakistani Rupee",     decimals:2 },
  BDT: { symbol:"৳",   name:"Bangladeshi Taka",    decimals:2 },
  LKR: { symbol:"₨",   name:"Sri Lankan Rupee",    decimals:2 },
  TWD: { symbol:"NT$", name:"New Taiwan Dollar",   decimals:2 },
};

// Populate country select
function populateCountrySelect() {
  const sel = document.getElementById('countrySelect');
  COUNTRIES.sort((a,b) => a.name.localeCompare(b.name)).forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.code;
    opt.textContent = c.name;
    sel.appendChild(opt);
  });
  // Populate currency select
  const csel = document.getElementById('currencySelect');
  csel.innerHTML = '';
  Object.entries(CURRENCIES).sort((a,b) => a[0].localeCompare(b[0])).forEach(([code, info]) => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = `${code} – ${info.name}`;
    csel.appendChild(opt);
  });
  csel.value = 'USD';
}

function getCountryData(code) {
  return COUNTRIES.find(c => c.code === code) || null;
}

document.addEventListener('DOMContentLoaded', populateCountrySelect);
