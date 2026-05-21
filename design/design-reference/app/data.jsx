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

window.SHOPS = SHOPS;
window.CATEGORIES = CATEGORIES;
window.PRODUCTS = PRODUCTS;
window.ADDRESSES = ADDRESSES;
window.ORDERS = ORDERS;
window.NOTIFICATIONS = NOTIFICATIONS;
window.RECENT_SEARCHES = RECENT_SEARCHES;
window.TRENDING_SEARCHES = TRENDING_SEARCHES;
