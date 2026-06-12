/* ============================================
   translations.js – Multi-language invoice labels
   ============================================ */

const TRANSLATIONS = {
  en: {
    invoice:      "INVOICE",
    billTo:       "Bill To",
    shipTo:       "Ship To",
    invoiceNo:    "Invoice #",
    date:         "Date",
    dueDate:      "Due Date",
    po:           "PO Number",
    description:  "Description",
    qty:          "Qty",
    unit:         "Unit",
    rate:         "Rate",
    amount:       "Amount",
    subtotal:     "Subtotal",
    discount:     "Discount",
    shipping:     "Shipping",
    total:        "Total",
    amtPaid:      "Amount Paid",
    balanceDue:   "Balance Due",
    notes:        "Notes",
    terms:        "Terms & Conditions",
    addItem:      "+ Add Line Item",
  },
  es: {
    invoice:      "FACTURA",
    billTo:       "Facturar a",
    shipTo:       "Enviar a",
    invoiceNo:    "Factura #",
    date:         "Fecha",
    dueDate:      "Fecha de vencimiento",
    po:           "Número de orden",
    description:  "Descripción",
    qty:          "Cant.",
    unit:         "Unidad",
    rate:         "Precio",
    amount:       "Importe",
    subtotal:     "Subtotal",
    discount:     "Descuento",
    shipping:     "Envío",
    total:        "Total",
    amtPaid:      "Importe pagado",
    balanceDue:   "Saldo pendiente",
    notes:        "Notas",
    terms:        "Términos y condiciones",
    addItem:      "+ Agregar línea",
  },
  fr: {
    invoice:      "FACTURE",
    billTo:       "Facturer à",
    shipTo:       "Livrer à",
    invoiceNo:    "Facture n°",
    date:         "Date",
    dueDate:      "Date d'échéance",
    po:           "N° de commande",
    description:  "Description",
    qty:          "Qté",
    unit:         "Unité",
    rate:         "Prix unitaire",
    amount:       "Montant",
    subtotal:     "Sous-total",
    discount:     "Remise",
    shipping:     "Livraison",
    total:        "Total",
    amtPaid:      "Montant payé",
    balanceDue:   "Solde dû",
    notes:        "Notes",
    terms:        "Conditions générales",
    addItem:      "+ Ajouter une ligne",
  },
  de: {
    invoice:      "RECHNUNG",
    billTo:       "Rechnungsempfänger",
    shipTo:       "Lieferadresse",
    invoiceNo:    "Rechnungs-Nr.",
    date:         "Datum",
    dueDate:      "Fälligkeitsdatum",
    po:           "Bestellnummer",
    description:  "Beschreibung",
    qty:          "Menge",
    unit:         "Einheit",
    rate:         "Preis",
    amount:       "Betrag",
    subtotal:     "Zwischensumme",
    discount:     "Rabatt",
    shipping:     "Versand",
    total:        "Gesamt",
    amtPaid:      "Bezahlter Betrag",
    balanceDue:   "Ausstehender Betrag",
    notes:        "Notizen",
    terms:        "Allgemeine Geschäftsbedingungen",
    addItem:      "+ Position hinzufügen",
  },
  pt: {
    invoice:      "FATURA",
    billTo:       "Faturar para",
    shipTo:       "Enviar para",
    invoiceNo:    "Fatura nº",
    date:         "Data",
    dueDate:      "Data de vencimento",
    po:           "Nº de pedido",
    description:  "Descrição",
    qty:          "Qtd.",
    unit:         "Unidade",
    rate:         "Preço",
    amount:       "Valor",
    subtotal:     "Subtotal",
    discount:     "Desconto",
    shipping:     "Frete",
    total:        "Total",
    amtPaid:      "Valor pago",
    balanceDue:   "Saldo a pagar",
    notes:        "Observações",
    terms:        "Termos e condições",
    addItem:      "+ Adicionar item",
  },
  ar: {
    invoice:      "فاتورة",
    billTo:       "إلى",
    shipTo:       "الشحن إلى",
    invoiceNo:    "رقم الفاتورة",
    date:         "التاريخ",
    dueDate:      "تاريخ الاستحقاق",
    po:           "رقم أمر الشراء",
    description:  "الوصف",
    qty:          "الكمية",
    unit:         "الوحدة",
    rate:         "السعر",
    amount:       "المبلغ",
    subtotal:     "المجموع الفرعي",
    discount:     "خصم",
    shipping:     "الشحن",
    total:        "الإجمالي",
    amtPaid:      "المبلغ المدفوع",
    balanceDue:   "الرصيد المستحق",
    notes:        "ملاحظات",
    terms:        "الشروط والأحكام",
    addItem:      "+ إضافة بند",
  },
  zh: {
    invoice:      "发票",
    billTo:       "账单寄至",
    shipTo:       "送货至",
    invoiceNo:    "发票编号",
    date:         "日期",
    dueDate:      "到期日",
    po:           "采购订单号",
    description:  "描述",
    qty:          "数量",
    unit:         "单位",
    rate:         "单价",
    amount:       "金额",
    subtotal:     "小计",
    discount:     "折扣",
    shipping:     "运费",
    total:        "合计",
    amtPaid:      "已付金额",
    balanceDue:   "应付余额",
    notes:        "备注",
    terms:        "条款与条件",
    addItem:      "+ 添加项目",
  },
  ja: {
    invoice:      "請求書",
    billTo:       "請求先",
    shipTo:       "配送先",
    invoiceNo:    "請求書番号",
    date:         "発行日",
    dueDate:      "支払期限",
    po:           "注文番号",
    description:  "品目",
    qty:          "数量",
    unit:         "単位",
    rate:         "単価",
    amount:       "金額",
    subtotal:     "小計",
    discount:     "割引",
    shipping:     "送料",
    total:        "合計",
    amtPaid:      "支払済金額",
    balanceDue:   "残高",
    notes:        "備考",
    terms:        "取引条件",
    addItem:      "+ 品目を追加",
  },
  hi: {
    invoice:      "चालान",
    billTo:       "बिल करें",
    shipTo:       "भेजें",
    invoiceNo:    "चालान संख्या",
    date:         "तारीख",
    dueDate:      "देय तिथि",
    po:           "पीओ नंबर",
    description:  "विवरण",
    qty:          "मात्रा",
    unit:         "इकाई",
    rate:         "दर",
    amount:       "राशि",
    subtotal:     "उप-कुल",
    discount:     "छूट",
    shipping:     "शिपिंग",
    total:        "कुल",
    amtPaid:      "भुगतान राशि",
    balanceDue:   "शेष राशि",
    notes:        "नोट्स",
    terms:        "नियम व शर्तें",
    addItem:      "+ पंक्ति जोड़ें",
  },
};

function applyLanguage() {
  const lang = document.getElementById('invoiceLang').value;
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // RTL support
  document.getElementById('invoiceDocument').dir = (lang === 'ar') ? 'rtl' : 'ltr';

  // Apply labels
  const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };

  // Invoice title (only if untouched)
  const titleEl = document.querySelector('.inv-doc-title');
  if (titleEl) titleEl.textContent = t.invoice;

  set('billToLabel',    t.billTo);
  set('shipToLabel',    t.shipTo + ' ');
  set('colItemLabel',   t.description);
  set('colQtyLabel',    t.qty);
  set('colUnitLabel',   t.unit);
  set('colRateLabel',   t.rate);
  set('colTotalLabel',  t.amount);
  set('subtotalLabel',  t.subtotal);
  set('grandTotalLabel',t.total);
  set('amtPaidLabel',   t.amtPaid);
  set('balanceDueLabel',t.balanceDue);
  set('shippingLabel',  t.shipping);
  set('notesLabel',     t.notes);
  set('termsLabel',     t.terms);
  set('addItemBtn',     t.addItem);

  // Meta labels
  const metaRows = document.querySelectorAll('.inv-meta-row .meta-label');
  if (metaRows[0]) metaRows[0].textContent = t.invoiceNo;
  if (metaRows[1]) metaRows[1].textContent = t.date;
  if (metaRows[2]) metaRows[2].textContent = t.dueDate;
  if (metaRows[3]) metaRows[3].textContent = t.po;
}
