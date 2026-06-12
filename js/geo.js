/* ============================================
   geo.js – GEO auto-detection & country grid
   Detects user's country from timezone/locale,
   pre-selects currency + tax system
   ============================================ */

// Top countries to show in the GEO grid (SEO + UX)
const GEO_GRID_COUNTRIES = [
  { code:"US", name:"United States",        flag:"🇺🇸" },
  { code:"IN", name:"India",                flag:"🇮🇳" },
  { code:"AU", name:"Australia",            flag:"🇦🇺" },
  { code:"GB", name:"United Kingdom",       flag:"🇬🇧" },
  { code:"CA", name:"Canada",               flag:"🇨🇦" },
  { code:"DE", name:"Germany",              flag:"🇩🇪" },
  { code:"FR", name:"France",               flag:"🇫🇷" },
  { code:"AE", name:"UAE",                  flag:"🇦🇪" },
  { code:"SG", name:"Singapore",            flag:"🇸🇬" },
  { code:"NZ", name:"New Zealand",          flag:"🇳🇿" },
  { code:"JP", name:"Japan",                flag:"🇯🇵" },
  { code:"KR", name:"South Korea",          flag:"🇰🇷" },
  { code:"MX", name:"Mexico",               flag:"🇲🇽" },
  { code:"BR", name:"Brazil",               flag:"🇧🇷" },
  { code:"ZA", name:"South Africa",         flag:"🇿🇦" },
  { code:"MY", name:"Malaysia",             flag:"🇲🇾" },
  { code:"IT", name:"Italy",                flag:"🇮🇹" },
  { code:"ES", name:"Spain",                flag:"🇪🇸" },
  { code:"NL", name:"Netherlands",          flag:"🇳🇱" },
  { code:"CH", name:"Switzerland",          flag:"🇨🇭" },
  { code:"SE", name:"Sweden",               flag:"🇸🇪" },
  { code:"PH", name:"Philippines",          flag:"🇵🇭" },
  { code:"ID", name:"Indonesia",            flag:"🇮🇩" },
  { code:"SA", name:"Saudi Arabia",         flag:"🇸🇦" },
  { code:"NG", name:"Nigeria",              flag:"🇳🇬" },
  { code:"KE", name:"Kenya",               flag:"🇰🇪" },
  { code:"AR", name:"Argentina",            flag:"🇦🇷" },
  { code:"PK", name:"Pakistan",             flag:"🇵🇰" },
  { code:"EG", name:"Egypt",               flag:"🇪🇬" },
  { code:"PL", name:"Poland",              flag:"🇵🇱" },
  { code:"PT", name:"Portugal",            flag:"🇵🇹" },
  { code:"IE", name:"Ireland",             flag:"🇮🇪" },
];

// Timezone → country code mapping for GEO detection
const TZ_COUNTRY_MAP = {
  "America/New_York":       "US",
  "America/Chicago":        "US",
  "America/Denver":         "US",
  "America/Los_Angeles":    "US",
  "America/Phoenix":        "US",
  "America/Anchorage":      "US",
  "Pacific/Honolulu":       "US",
  "America/Toronto":        "CA",
  "America/Vancouver":      "CA",
  "America/Winnipeg":       "CA",
  "America/Halifax":        "CA",
  "America/St_Johns":       "CA",
  "America/Mexico_City":    "MX",
  "America/Sao_Paulo":      "BR",
  "America/Argentina/Buenos_Aires": "AR",
  "America/Bogota":         "CO",
  "America/Lima":           "PE",
  "America/Santiago":       "CL",
  "Europe/London":          "GB",
  "Europe/Dublin":          "IE",
  "Europe/Paris":           "FR",
  "Europe/Berlin":          "DE",
  "Europe/Vienna":          "AT",
  "Europe/Zurich":          "CH",
  "Europe/Rome":            "IT",
  "Europe/Madrid":          "ES",
  "Europe/Amsterdam":       "NL",
  "Europe/Brussels":        "BE",
  "Europe/Stockholm":       "SE",
  "Europe/Oslo":            "NO",
  "Europe/Copenhagen":      "DK",
  "Europe/Helsinki":        "FI",
  "Europe/Warsaw":          "PL",
  "Europe/Lisbon":          "PT",
  "Europe/Athens":          "GR",
  "Europe/Prague":          "CZ",
  "Europe/Budapest":        "HU",
  "Europe/Bucharest":       "RO",
  "Europe/Kiev":            "UA",
  "Europe/Moscow":          "RU",
  "Asia/Kolkata":           "IN",
  "Asia/Calcutta":          "IN",
  "Asia/Tokyo":             "JP",
  "Asia/Seoul":             "KR",
  "Asia/Shanghai":          "CN",
  "Asia/Hong_Kong":         "HK",
  "Asia/Singapore":         "SG",
  "Asia/Kuala_Lumpur":      "MY",
  "Asia/Jakarta":           "ID",
  "Asia/Bangkok":           "TH",
  "Asia/Manila":            "PH",
  "Asia/Ho_Chi_Minh":       "VN",
  "Asia/Karachi":           "PK",
  "Asia/Dhaka":             "BD",
  "Asia/Colombo":           "LK",
  "Asia/Taipei":            "TW",
  "Asia/Dubai":             "AE",
  "Asia/Riyadh":            "SA",
  "Asia/Kuwait":            "KW",
  "Asia/Qatar":             "QA",
  "Asia/Bahrain":           "BH",
  "Asia/Muscat":            "OM",
  "Asia/Jerusalem":         "IL",
  "Australia/Sydney":       "AU",
  "Australia/Melbourne":    "AU",
  "Australia/Brisbane":     "AU",
  "Australia/Adelaide":     "AU",
  "Australia/Perth":        "AU",
  "Pacific/Auckland":       "NZ",
  "Africa/Johannesburg":    "ZA",
  "Africa/Cairo":           "EG",
  "Africa/Lagos":           "NG",
  "Africa/Nairobi":         "KE",
  "Africa/Accra":           "GH",
  "Africa/Casablanca":      "MA",
  "Africa/Addis_Ababa":     "ET",
  "Africa/Dar_es_Salaam":   "TZ",
};

// Country flags map for badge
const COUNTRY_FLAGS = {
  US:"🇺🇸", CA:"🇨🇦", MX:"🇲🇽", GB:"🇬🇧", DE:"🇩🇪", FR:"🇫🇷",
  IT:"🇮🇹", ES:"🇪🇸", NL:"🇳🇱", BE:"🇧🇪", AT:"🇦🇹", CH:"🇨🇭",
  SE:"🇸🇪", NO:"🇳🇴", DK:"🇩🇰", FI:"🇫🇮", PL:"🇵🇱", PT:"🇵🇹",
  IE:"🇮🇪", GR:"🇬🇷", CZ:"🇨🇿", HU:"🇭🇺", RO:"🇷🇴", UA:"🇺🇦",
  RU:"🇷🇺", AU:"🇦🇺", NZ:"🇳🇿", IN:"🇮🇳", CN:"🇨🇳", JP:"🇯🇵",
  KR:"🇰🇷", SG:"🇸🇬", MY:"🇲🇾", ID:"🇮🇩", TH:"🇹🇭", PH:"🇵🇭",
  VN:"🇻🇳", PK:"🇵🇰", BD:"🇧🇩", LK:"🇱🇰", HK:"🇭🇰", TW:"🇹🇼",
  AE:"🇦🇪", SA:"🇸🇦", QA:"🇶🇦", KW:"🇰🇼", BH:"🇧🇭", OM:"🇴🇲",
  IL:"🇮🇱", ZA:"🇿🇦", EG:"🇪🇬", NG:"🇳🇬", KE:"🇰🇪", GH:"🇬🇭",
  MA:"🇲🇦", TZ:"🇹🇿", UG:"🇺🇬", ET:"🇪🇹", BR:"🇧🇷", AR:"🇦🇷",
  CO:"🇨🇴", CL:"🇨🇱", PE:"🇵🇪", VE:"🇻🇪", UY:"🇺🇾",
};

/* ── DETECT COUNTRY ────────────────────────── */
function detectCountryCode() {
  // 1. Try timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TZ_COUNTRY_MAP[tz]) return TZ_COUNTRY_MAP[tz];
  } catch(e) {}

  // 2. Try browser language (e.g. "en-AU" → AU)
  try {
    const lang = navigator.language || navigator.languages[0] || '';
    const parts = lang.split('-');
    if (parts.length >= 2) {
      const cc = parts[parts.length - 1].toUpperCase();
      if (cc.length === 2 && COUNTRIES.find(c => c.code === cc)) return cc;
    }
  } catch(e) {}

  return null;
}

/* ── APPLY GEO ────────────────────────────── */
function applyGeoDetection() {
  const code = detectCountryCode();
  const geoBar = document.getElementById('geoBar');
  const geoBarText = document.getElementById('geoBarText');
  const heroName = document.getElementById('heroCountryName');

  if (!code) {
    if (geoBarText) geoBarText.textContent = 'Select your country above';
    return;
  }

  const country = getCountryData(code);
  if (!country) return;

  // Update hero H1 country name
  if (heroName) heroName.textContent = country.name;

  // Update geo bar
  const flag = COUNTRY_FLAGS[code] || '🌍';
  if (geoBarText) geoBarText.textContent = `${flag} ${country.name} detected — ${country.currency} · ${TAX_SYSTEMS[country.taxSystem]?.label || 'No Tax'}`;

  // Show geo badge in settings bar
  const badge = document.getElementById('geoBadge');
  const badgeFlag = document.getElementById('geoBadgeFlag');
  const badgeText = document.getElementById('geoBadgeText');
  if (badge && badgeFlag && badgeText) {
    badge.style.display = 'inline-flex';
    badgeFlag.textContent = flag;
    badgeText.textContent = country.name;
  }

  // Pre-select country dropdown
  const countrySelect = document.getElementById('countrySelect');
  if (countrySelect) {
    countrySelect.value = code;
    onCountryChange();
  }
}

/* ── COUNTRY GRID (GEO SEO block) ─────────── */
function buildCountryGrid() {
  const grid = document.getElementById('countryGrid');
  if (!grid) return;

  GEO_GRID_COUNTRIES.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'country-pill';
    btn.setAttribute('role', 'listitem');
    btn.setAttribute('aria-label', `Use ${c.name} settings`);
    btn.innerHTML = `<span class="country-flag" aria-hidden="true">${c.flag}</span>${c.name}`;
    btn.onclick = () => {
      // Scroll to editor
      document.getElementById('invoiceApp').scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Set country
      const sel = document.getElementById('countrySelect');
      if (sel) {
        sel.value = c.code;
        onCountryChange();
        showToast(`✓ Configured for ${c.name}`);
      }
    };
    grid.appendChild(btn);
  });
}

/* ── MOBILE MENU ──────────────────────────── */
function toggleMobileMenu() {
  const nav = document.querySelector('.header-nav');
  if (!nav) return;
  const open = nav.style.display === 'flex';
  if (open) {
    nav.style.display = '';
  } else {
    nav.style.cssText = `
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 58px;
      left: 0; right: 0;
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
      padding: 16px 20px;
      gap: 4px;
      z-index: 199;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    `;
  }
}

/* ── INIT ────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  buildCountryGrid();
  // Small delay so countries.js populates select first
  setTimeout(applyGeoDetection, 100);
});
