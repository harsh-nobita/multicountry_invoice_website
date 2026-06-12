# ⬡ InvoiceForge — Free Professional Invoice Generator

A complete, production-ready invoice generator website. Supports **150+ countries**, currencies, and all major international tax systems (GST, VAT, HST, PST, IVA, TVA, MwSt, SST, PPN, JCT, and more). Google AdSense-friendly. No backend required.

---

## 📁 File Structure

```
invoice-generator/
├── index.html                  ← Main invoice generator (homepage)
├── sitemap.xml                 ← SEO sitemap
├── robots.txt                  ← Search engine crawler rules
├── README.md                   ← This file
│
├── css/
│   ├── style.css               ← Global styles (header, footer, layout, ads)
│   ├── invoice.css             ← Invoice document styles
│   └── print.css               ← Print / PDF print styles
│
├── js/
│   ├── countries.js            ← Country, currency & locale data (150+ countries)
│   ├── taxsystems.js           ← Tax system definitions (GST, VAT, HST, etc.)
│   ├── translations.js         ← Invoice label translations (9 languages)
│   ├── invoice.js              ← Core invoice logic (items, totals, save/load)
│   └── pdf.js                  ← PDF generation (html2pdf.js)
│
├── pages/
│   ├── templates.html          ← Invoice templates page
│   ├── how-it-works.html       ← How it works page
│   ├── blog.html               ← Blog / invoicing guides (SEO content)
│   ├── tax-guide.html          ← International tax guide (GST, VAT, etc.)
│   ├── faq.html                ← FAQ page
│   ├── contact.html            ← Contact page
│   ├── privacy.html            ← Privacy policy
│   └── terms.html              ← Terms of use
│
└── assets/
    └── icons/                  ← (Place any custom SVG icons here)
```

---

## 🚀 Getting Started in VS Code

### Option 1 – Open Directly (No Server Needed)
1. Open the `invoice-generator/` folder in VS Code.
2. Open `index.html` and click **"Open with Live Server"** (requires the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)).
3. The site opens at `http://127.0.0.1:5500/`.

### Option 2 – Open HTML File Directly
Simply open `index.html` in your browser. Everything works without a server, except:
- PDF generation loads `html2pdf.js` from a CDN on first use.
- Google Fonts requires internet access.
- AdSense requires a live domain (won't show on localhost).

### Recommended VS Code Extensions
- **Live Server** – Real-time preview with hot reload
- **Prettier** – Code formatting
- **HTML CSS Support** – Autocomplete for HTML/CSS
- **Path Intellisense** – Autocomplete file paths

---

## 💡 Key Features

| Feature | Details |
|---|---|
| **Countries** | 70+ countries with auto-detected currency, date format & tax system |
| **Currencies** | 50+ currencies with correct symbols and decimal places |
| **Tax Systems** | GST (IN/AU/CA/NZ/SG/PK), VAT (EU/UK/UAE/ZA/RU), HST/PST/QST, MwSt, TVA, IVA, SST, PPN, JCT, US Sales Tax |
| **Multi-tax** | Add multiple tax lines (e.g., CGST + SGST, GST + PST) |
| **Languages** | 9 languages: EN, ES, FR, DE, PT, AR, ZH, JA, HI |
| **RTL Support** | Arabic switches invoice to right-to-left layout |
| **PDF Download** | Client-side PDF via html2pdf.js — no server needed |
| **Logo Upload** | Upload PNG/JPG/SVG logo directly onto the invoice |
| **Auto-Save** | Saves to localStorage every 10 seconds |
| **Print Ready** | Dedicated print.css hides all UI chrome |
| **AdSense Ready** | 6 ad placements (header, sidebar ×2, mid-page ×2, footer) |
| **SEO Ready** | Meta tags, sitemap.xml, robots.txt, semantic HTML |

---

## 📢 Google AdSense Setup

1. Sign up at [Google AdSense](https://www.google.com/adsense/).
2. Once approved, get your **Publisher ID** (format: `ca-pub-XXXXXXXXXXXXXXXX`).
3. Find and replace ALL instances of `ca-pub-XXXXXXXXXXXXXXXX` in every HTML file with your real Publisher ID.
4. Replace the `data-ad-slot` values with real ad unit slot IDs from your AdSense dashboard.

**Ad Placement Map:**

| Location | File | Slot Variable |
|---|---|---|
| Top leaderboard | index.html | `1234567890` |
| Left sidebar | index.html | `2345678901` |
| Right sidebar | index.html | `3456789012` |
| Mid-page | index.html | `4567890123` |
| Blog top | blog.html | `7890123456` |
| Blog mid-article | blog.html | `8901234567` |
| Blog sidebar ×2 | blog.html | `9012345678`, `0123456789` |
| Tax guide | tax-guide.html | `2345610987` |
| FAQ | faq.html | `5678943210` |

> **AdSense Policy Tips:**
> - All ad slots are in clearly marked `aria-label="Advertisement"` containers.
> - Ads are never placed inside the invoice document itself (only around it).
> - The site has substantial original content (blog, tax guide, FAQ).
> - Privacy policy clearly discloses use of AdSense and cookies.

---

## 🌍 Adding a New Country

In `js/countries.js`, add to the `COUNTRIES` array:

```javascript
{ 
  code: "XX",           // ISO 3166-1 alpha-2 country code
  name: "My Country", 
  currency: "XXX",      // ISO 4217 currency code (must exist in CURRENCIES object)
  taxSystem: "vat",     // Key from TAX_SYSTEMS in taxsystems.js
  locale: "en-XX",      // BCP 47 locale for date/number formatting
  dateFormat: "DD/MM/YYYY"
},
```

Also add the currency to the `CURRENCIES` object if it doesn't exist:

```javascript
XXX: { symbol: "$", name: "My Currency", decimals: 2 },
```

---

## 🧾 Adding a New Tax System

In `js/taxsystems.js`, add to the `TAX_SYSTEMS` object:

```javascript
my_tax: {
  label: "My Tax (Country)",
  description: "Description shown in dropdown",
  defaultRates: [{ name: "TAX", rate: 10 }],
  registrationFields: [
    { id: "taxIdInput1", label: "Tax ID", placeholder: "123456789" },
  ],
  presets: [
    { label: "5% Reduced", rates: [{ name: "TAX", rate: 5 }] },
    { label: "10% Standard", rates: [{ name: "TAX", rate: 10 }] },
  ],
},
```

---

## 🌐 Adding a New Language

In `js/translations.js`, add a new entry to the `TRANSLATIONS` object following the same structure as existing entries. Then add an `<option>` in the `#invoiceLang` select in `index.html`.

---

## 📦 Deployment

### Static Hosting (Recommended)
Deploy the entire `invoice-generator/` folder to any static host:
- **Netlify** – Drag and drop the folder at netlify.com/drop
- **Vercel** – `vercel --prod`
- **GitHub Pages** – Push to a GitHub repo, enable Pages
- **Cloudflare Pages** – Connect your repo

### Custom Domain
Update `sitemap.xml` and replace `https://www.invoiceforge.com/` with your actual domain.

---

## 🔧 Customization Checklist

- [ ] Replace `ca-pub-XXXXXXXXXXXXXXXX` with your AdSense Publisher ID (in all HTML files)
- [ ] Replace ad slot IDs with your real AdSense ad unit IDs
- [ ] Update brand name (`InvoiceForge`) across all HTML files if rebranding
- [ ] Update email addresses in `contact.html` and `privacy.html`
- [ ] Update domain in `sitemap.xml` and `robots.txt`
- [ ] Update copyright year in all footers
- [ ] Consider adding a favicon (`<link rel="icon" ...>` in `<head>`)
- [ ] Add Google Analytics or similar (in `<head>` of each page)
- [ ] Consider adding Formspree or EmailJS to `contact.html` for real form submissions

---

## 📜 License

Free to use for personal and commercial projects. No attribution required, but appreciated. You may not resell the template as-is.

---

## 🙏 Credits

- PDF generation: [html2pdf.js](https://github.com/eKoopmans/html2pdf.js)
- Fonts: [Google Fonts](https://fonts.google.com/) (Playfair Display + DM Sans)
- Icons: Hand-crafted SVG
