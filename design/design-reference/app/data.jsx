// data.jsx — full mock catalog. Arabic-first; Egyptian colloquial.

// ── Shops ──────────────────────────────────────────────────────────
const SHOPS = [
  { id: 'abuhassan', letter: 'أ', name: 'سوبر ماركت أبو حسن', cat: 'بقالة',
    catKey: 'grocery', distance: '٤٠٠ متر', rating: '٤٫٨', eta: '١٥–٢٠ د',
    fee: '١٠ ج.م', open: true,
    desc: 'بقالة بلدي بكل اللي محتاجه — من اللبن للمعلبات.',
    bg: 'linear-gradient(135deg,#1F4A3D 0%,#173629 100%)',
    tags: ['عرض اليوم', 'الأكثر طلباً'] },
  { id: 'noor', letter: 'ن', name: 'صيدلية النور', cat: 'صيدلية',
    catKey: 'pharmacy', distance: '٢٠٠ متر', rating: '٤٫٩', eta: '١٠–١٥ د',
    fee: '٨ ج.م', open: true,
    desc: 'صيدلية شغّالة ٢٤ ساعة — أدوية، مستلزمات أطفال، ومستحضرات.',
    bg: 'linear-gradient(135deg,#2C5C4B 0%,#1F4A3D 100%)',
    tags: ['٢٤ ساعة'] },
  { id: 'masry', letter: 'م', name: 'فول وطعمية المصري', cat: 'أكل',
    catKey: 'food', distance: '٦٠٠ متر', rating: '٤٫٧', eta: '٢٠–٣٠ د',
    fee: '١٢ ج.م', open: true,
    desc: 'فول وطعمية وفطار بلدي على أصوله — كل يوم من الفجر.',
    bg: 'linear-gradient(135deg,#A66B2C 0%,#7A4D1F 100%)',
    tags: ['فطار'] },
  { id: 'halawa', letter: 'ح', name: 'حلواني الجلاء', cat: 'حلويات',
    catKey: 'sweets', distance: '٨٠٠ متر', rating: '٤٫٦', eta: '٢٥–٣٥ د',
    fee: '١٥ ج.م', open: false,
    desc: 'حلويات شرقية وغربية وأنواع كنافة وقطايف فى موسمها.',
    bg: 'linear-gradient(135deg,#E8B14F 0%,#C9933A 100%)',
    tags: [] },
  { id: 'khodar', letter: 'خ', name: 'خضار وفاكهة عم سعيد', cat: 'خضار وفاكهة',
    catKey: 'produce', distance: '٥٠٠ متر', rating: '٤٫٥', eta: '١٥–٢٥ د',
    fee: '١٠ ج.م', open: true,
    desc: 'خضار وفاكهة طازة كل يوم من السوق — انتقاء يدوي.',
    bg: 'linear-gradient(135deg,#3C6B4F 0%,#234731 100%)',
    tags: ['طازج اليوم'] },
  { id: 'sokar', letter: 'س', name: 'محل السكر', cat: 'بقالة',
    catKey: 'grocery', distance: '٣٠٠ متر', rating: '٤٫٤', eta: '١٠–١٥ د',
    fee: '٨ ج.م', open: true,
    desc: 'بقالة صغيرة بأسعار محل العيلة.',
    bg: 'linear-gradient(135deg,#3A5247 0%,#23362D 100%)',
    tags: [] },
];

// ── Categories ────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'all', label: 'الكل' },
  { key: 'grocery', label: 'بقالة', icon: 'store' },
  { key: 'pharmacy', label: 'صيدلية', icon: 'pill' },
  { key: 'food', label: 'أكل', icon: 'utensils' },
  { key: 'sweets', label: 'حلويات', icon: 'cookie' },
  { key: 'produce', label: 'خضار وفاكهة', icon: 'leaf' },
];

// ── Products (Abu Hassan's catalog) ───────────────────────────────
const PRODUCTS = [
  { id: 'p1', name: 'لبن جهينة', sub: 'كامل الدسم · ١ لتر', price: 32, hue: '#F2EEE3', tag: null, section: 'الألبان' },
  { id: 'p2', name: 'بيض بلدي', sub: 'كرتونة · ٣٠ بيضة', price: 145, hue: '#FAE3B6', tag: 'الأكثر طلباً', section: 'الألبان' },
  { id: 'p3', name: 'جبنة بيضا', sub: 'دومتي · ٥٠٠ جم', price: 68, hue: '#F4EFE0', tag: null, section: 'الألبان' },
  { id: 'p4', name: 'خبز فينو', sub: 'طازج · ٥ أرغفة', price: 12, hue: '#E9D7A8', tag: null, section: 'مخبوزات' },
  { id: 'p5', name: 'زيت عافية', sub: 'دوار الشمس · ١٫٨ لتر', price: 92, hue: '#D9DFC8', tag: 'عرض', section: 'بقالة' },
  { id: 'p6', name: 'أرز فينو', sub: 'مصري · ١ كيلو', price: 28, hue: '#F2EEE3', tag: null, section: 'بقالة' },
  { id: 'p7', name: 'سكر أبيض', sub: '١ كيلو', price: 24, hue: '#EFEFEF', tag: null, section: 'بقالة' },
  { id: 'p8', name: 'شاي العروسة', sub: 'فتلة · ١٠٠ فتلة', price: 55, hue: '#D8C7B0', tag: null, section: 'مشروبات' },
  { id: 'p9', name: 'مياه نستله', sub: 'عبوة ٦ × ١٫٥ لتر', price: 45, hue: '#E4ECEF', tag: null, section: 'مشروبات' },
  { id: 'p10', name: 'مكرونة ريجينا', sub: 'سباجتي · ٤٠٠ جم', price: 19, hue: '#F5EDD8', tag: null, section: 'بقالة' },
  { id: 'p11', name: 'تونة الوادي', sub: '١٦٠ جم', price: 38, hue: '#E1E3D8', tag: null, section: 'معلبات' },
  { id: 'p12', name: 'كنافة بالقشطة', sub: 'كيلو · طازجة', price: 220, hue: '#F4DCA8', tag: 'موسم', section: 'حلويات' },
];

// ── Addresses ──────────────────────────────────────────────────────
const ADDRESSES = [
  { id: 'a1', label: 'البيت', icon: 'home', street: 'شارع الجلاء',
    detail: 'بجوار صيدلية مصر · الدلنجات', selected: true },
  { id: 'a2', label: 'الشغل', icon: 'store', street: 'شارع الترعة',
    detail: 'محل أبو وليد · الدور التاني', selected: false },
  { id: 'a3', label: 'بيت ماما', icon: 'heart', street: 'شارع المحطة',
    detail: 'منزل العيلة · الدلنجات', selected: false },
];

// ── Orders history ────────────────────────────────────────────────
const ORDERS = [
  { id: 'DLN-٢٠٤٧', shop: 'سوبر ماركت أبو حسن', shopLetter: 'أ',
    status: 'live', statusText: 'في الطريق', date: 'دلوقتي',
    total: 187, items: 3, step: 2 },
  { id: 'DLN-٢٠٣٢', shop: 'صيدلية النور', shopLetter: 'ن',
    status: 'done', statusText: 'تم التوصيل', date: 'إمبارح · ٧:٤٠ م',
    total: 86, items: 2, step: 3 },
  { id: 'DLN-٢٠١٨', shop: 'فول وطعمية المصري', shopLetter: 'م',
    status: 'done', statusText: 'تم التوصيل', date: 'الأحد · ٨:٢٠ ص',
    total: 65, items: 5, step: 3 },
  { id: 'DLN-٢٠٠٤', shop: 'سوبر ماركت أبو حسن', shopLetter: 'أ',
    status: 'cancelled', statusText: 'متلغي', date: 'الجمعة', total: 0, items: 0, step: 0 },
  { id: 'DLN-١٩٩٣', shop: 'خضار وفاكهة عم سعيد', shopLetter: 'خ',
    status: 'done', statusText: 'تم التوصيل', date: 'الخميس · ٥:١٠ م',
    total: 132, items: 6, step: 3 },
];

// ── Notifications ─────────────────────────────────────────────────
const NOTIFICATIONS = [
  { id: 'n1', icon: 'bike', title: 'الكابتن في الطريق',
    body: 'محمود السيد في طريقه ليك — بعد ٧ دقايق تقريباً.',
    time: 'دلوقتي', read: false, accent: 'olive' },
  { id: 'n2', icon: 'tag', title: 'عرض اليوم',
    body: 'توصيل ببلاش على أول طلب — استخدم كود DLN10.',
    time: 'من ساعتين', read: false, accent: 'gold' },
  { id: 'n3', icon: 'check', title: 'تم التوصيل · طلب DLN-٢٠٣٢',
    body: 'شكراً لاستخدامك دلنجاتُو. قيّم تجربتك دلوقتي.',
    time: 'إمبارح', read: true, accent: 'olive' },
  { id: 'n4', icon: 'store', title: 'محل جديد قريب منك',
    body: 'فتح حلواني العائلة بـ ٥٠٠ متر — جرب طلبك الأول.',
    time: 'إمبارح', read: true, accent: 'olive' },
  { id: 'n5', icon: 'info', title: 'تحديث على وقت التوصيل',
    body: 'بسبب الأمطار، التوصيل ممكن يتأخر ٥–١٠ دقايق.',
    time: 'من يومين', read: true, accent: 'gold' },
];

// ── Recent searches ───────────────────────────────────────────────
const RECENT_SEARCHES = ['لبن', 'صيدلية', 'خبز', 'طعمية'];
const TRENDING_SEARCHES = ['كنافة', 'بيض بلدي', 'مياه', 'شاي', 'مكرونة'];

// ── Deals & promotions ─────────────────────────────────────────────
const DEALS = [
  { id: 'd1', kind: 'hero', title: 'توصيل ببلاش', sub: 'على أول طلب بكود DLN10',
    bg: 'linear-gradient(135deg,#1F4A3D 0%,#173629 100%)', icon: 'bike', code: 'DLN10', value: 'توصيل مجاني' },
  { id: 'd2', kind: 'percent', title: 'خصم ٢٥٪', sub: 'على كل صيدلية النور',
    bg: 'linear-gradient(135deg,#2C5C4B 0%,#1F4A3D 100%)', icon: 'pill', code: 'NOOR25', value: '-٢٥٪', shopId: 'noor' },
  { id: 'd3', kind: 'cashback', title: 'كاش باك ١٠٪', sub: 'على المحفظة لمدة أسبوع',
    bg: 'linear-gradient(135deg,#E8B14F 0%,#C9933A 100%)', icon: 'wallet', code: 'WALLET10', value: '+١٠٪' },
  { id: 'd4', kind: 'bogo', title: '١+١ مجاناً', sub: 'فول وطعمية المصري — كل يوم جمعة',
    bg: 'linear-gradient(135deg,#A66B2C 0%,#7A4D1F 100%)', icon: 'utensils', code: 'FRIDAY', value: '١+١', shopId: 'masry' },
  { id: 'd5', kind: 'flat', title: '٢٠ ج.م خصم', sub: 'على أي طلب فوق ١٥٠ ج.م',
    bg: 'linear-gradient(135deg,#3C6B4F 0%,#234731 100%)', icon: 'tag', code: 'SAVE20', value: '-٢٠ ج' },
];

// ── Reviews ────────────────────────────────────────────────────────
const REVIEWS = [
  { id: 'r1', name: 'سارة عبد الله', avatar: 'س', stars: 5, date: 'إمبارح',
    body: 'المنتج وصل طازج والكابتن لطيف. هطلب تاني أكيد.',
    tags: ['التوصيل سريع', 'المنتجات نضيفة'] },
  { id: 'r2', name: 'محمد إبراهيم', avatar: 'م', stars: 4, date: 'من ٣ أيام',
    body: 'كله كويس بس التوصيل اتأخر شوية. عموماً تجربة ممتازة.',
    tags: ['الكابتن مؤدب'] },
  { id: 'r3', name: 'هدى مصطفى', avatar: 'هـ', stars: 5, date: 'الأسبوع اللي فات',
    body: 'أحسن من ٢٤ ساعة. الجبنة طازة والأسعار مناسبة.',
    tags: ['الأسعار مناسبة', 'المنتجات نضيفة'] },
  { id: 'r4', name: 'يوسف حلمي', avatar: 'ي', stars: 5, date: 'من أسبوعين',
    body: 'ربنا يبارك في دلنجاتُو. وفّروا علينا وقت وفلوس مواصلات.',
    tags: ['التوصيل سريع'] },
];

// ── Product add-ons / modifiers ────────────────────────────────────
const PRODUCT_ADDONS = {
  // generic options used when product has customizable kind
  size: { label: 'الحجم', required: true, kind: 'one',
    options: [
      { id: 's', name: 'صغير', price: 0 },
      { id: 'm', name: 'وسط', price: 8 },
      { id: 'l', name: 'كبير', price: 16 },
    ]},
  extras: { label: 'إضافات', required: false, kind: 'multi',
    options: [
      { id: 'e1', name: 'كيس إضافي', price: 2 },
      { id: 'e2', name: 'تغليف هدية', price: 10 },
      { id: 'e3', name: 'فاتورة مطبوعة', price: 0 },
    ]},
  notes: { label: 'ملاحظات للمحل', required: false, kind: 'text' },
};

// ── Recently viewed ────────────────────────────────────────────────
const RECENTLY_VIEWED = ['p2', 'p1', 'p12', 'p5', 'p9'];

// ── Wallet & loyalty ───────────────────────────────────────────────
const WALLET_BALANCE = 248;
const POINTS_BALANCE = 1820;
const CASHBACK_THIS_MONTH = 34;
const WALLET_TX = [
  { id: 'tx1', kind: 'in', title: 'كاش باك من طلب DLN-٢٠٣٢', date: 'إمبارح', amount: 8 },
  { id: 'tx2', kind: 'out', title: 'دفع طلب DLN-٢٠١٨', date: 'الأحد', amount: -65 },
  { id: 'tx3', kind: 'in', title: 'شحن من فودافون كاش', date: 'الخميس', amount: 200 },
  { id: 'tx4', kind: 'in', title: 'مكافأة دعوة صديق · يوسف', date: 'الأسبوع اللي فات', amount: 30 },
  { id: 'tx5', kind: 'out', title: 'دفع طلب DLN-١٩٩٣', date: 'الخميس', amount: -132 },
  { id: 'tx6', kind: 'in', title: 'كاش باك من طلب DLN-١٩٧٢', date: 'من أسبوعين', amount: 12 },
];

const REWARDS = [
  { id: 'rw1', title: 'توصيل ببلاش', cost: 500, icon: 'bike', desc: 'خصم رسوم التوصيل على طلب واحد' },
  { id: 'rw2', title: '٢٥ ج.م خصم', cost: 1000, icon: 'tag', desc: 'خصم مباشر من إجمالي الطلب' },
  { id: 'rw3', title: '٥٠ ج.م خصم', cost: 1800, icon: 'tag', desc: 'لطلباتك من ١٥٠ ج.م فوق' },
  { id: 'rw4', title: 'منتج هدية', cost: 2500, icon: 'sparkle', desc: 'بكنافة بالقشطة على بيتك' },
];

// ── Chat (with driver) ─────────────────────────────────────────────
const CHAT_QUICK = [
  'بس بدقيقة', 'أنا في الطريق', 'وصلت', 'العنوان مظبوط؟', 'استنّى دقيقة',
];
const CHAT_HISTORY = [
  { id: 'c1', from: 'driver', text: 'السلام عليكم، أنا في الطريق ليك دلوقتي.', time: '٧:٣٢' },
  { id: 'c2', from: 'me', text: 'وعليكم السلام، تمام يا كابتن.', time: '٧:٣٣' },
  { id: 'c3', from: 'driver', text: 'حضرتك في شارع الجلاء بجوار صيدلية مصر صح؟', time: '٧:٣٣' },
  { id: 'c4', from: 'me', text: 'آه. العمارة البيضا اللي على الناصية.', time: '٧:٣٤' },
];

// ── Featured merchants ─────────────────────────────────────────────
const FEATURED_IDS = ['abuhassan', 'masry', 'noor'];

window.DEALS = DEALS;
window.REVIEWS = REVIEWS;
window.PRODUCT_ADDONS = PRODUCT_ADDONS;
window.RECENTLY_VIEWED = RECENTLY_VIEWED;
window.WALLET_BALANCE = WALLET_BALANCE;
window.POINTS_BALANCE = POINTS_BALANCE;
window.CASHBACK_THIS_MONTH = CASHBACK_THIS_MONTH;
window.WALLET_TX = WALLET_TX;
window.REWARDS = REWARDS;
window.CHAT_QUICK = CHAT_QUICK;
window.CHAT_HISTORY = CHAT_HISTORY;
window.FEATURED_IDS = FEATURED_IDS;

window.SHOPS = SHOPS;
window.CATEGORIES = CATEGORIES;
window.PRODUCTS = PRODUCTS;
window.ADDRESSES = ADDRESSES;
window.ORDERS = ORDERS;
window.NOTIFICATIONS = NOTIFICATIONS;
window.RECENT_SEARCHES = RECENT_SEARCHES;
window.TRENDING_SEARCHES = TRENDING_SEARCHES;
