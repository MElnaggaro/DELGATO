// app/merchant/data.jsx — Mock data for Delngato Merchant App
// Egyptian Arabic, real-feeling shop: "سوبر ماركت أبو حسن"

// ── Store identity ─────────────────────────────────────────────────
const STORE = {
  id: 'abuhassan',
  name: 'سوبر ماركت أبو حسن',
  letter: 'أ',
  category: 'بقالة',
  ownerName: 'حسن السيد',
  phone: '٠١٠ ٢٣٤ ٥٦٧٨',
  address: 'شارع الجلاء · الدلنجات',
  joined: 'يونيو ٢٠٢٤',
  rating: '٤٫٨',
  reviewsCount: 312,
  open: true,
  acceptingOrders: true,
  prepTime: 12, // minutes
  deliveryRadius: 3, // km
  bg: 'linear-gradient(135deg,#1F4A3D 0%,#173629 100%)',
};

// ── Live order queue ───────────────────────────────────────────────
// Status: new | accepted | preparing | ready | picked | delivered | rejected | cancelled
const QUEUE = [
  { id: 'DLN-٢٠٥١', status: 'new', placedAt: 'دلوقتي · ٧:٤٤ م',
    customerName: 'أحمد محمد', customerPhone: '٠١٠ ٢٣٤ ٥٦٧٨',
    address: 'شارع الجلاء · بجوار صيدلية مصر',
    distance: '٤٠٠ متر', delivery: 'دلنجاتو',
    items: [
      { name: 'لبن جهينة', qty: 2, price: 32, sub: 'كامل الدسم · ١ لتر' },
      { name: 'بيض بلدي', qty: 1, price: 145, sub: 'كرتونة · ٣٠ بيضة' },
      { name: 'خبز فينو', qty: 3, price: 12, sub: 'طازج' },
    ],
    subtotal: 245, deliveryFee: 10, total: 255,
    note: 'العمارة بيضا — الدور التاني · من غير ثلج',
    payment: 'كاش', timerSec: 240 },
  { id: 'DLN-٢٠٥٠', status: 'accepted', placedAt: 'من دقيقتين · ٧:٤٢ م',
    customerName: 'سارة عبد الله', customerPhone: '٠١١ ٤٥٦ ٧٨٩٠',
    address: 'شارع المحطة · العمارة ٢٢',
    distance: '٧٠٠ متر', delivery: 'دلنجاتو',
    items: [
      { name: 'جبنة بيضا', qty: 1, price: 68, sub: 'دومتي · ٥٠٠ جم' },
      { name: 'زيت عافية', qty: 1, price: 92, sub: 'دوار الشمس · ١٫٨ لتر' },
    ],
    subtotal: 160, deliveryFee: 10, total: 170,
    note: '', payment: 'بطاقة', timerSec: 540 },
  { id: 'DLN-٢٠٤٨', status: 'preparing', placedAt: 'من ٧ دقايق · ٧:٣٧ م',
    customerName: 'محمود إبراهيم', customerPhone: '٠١٢ ٣٤٥ ٦٧٨٩',
    address: 'شارع الترعة · فيلا الياسمين',
    distance: '١٫٢ كم', delivery: 'دلنجاتو',
    items: [
      { name: 'أرز فينو', qty: 5, price: 28, sub: 'مصري · ١ كيلو' },
      { name: 'سكر أبيض', qty: 2, price: 24, sub: '١ كيلو' },
      { name: 'مكرونة ريجينا', qty: 4, price: 19, sub: 'سباجتي · ٤٠٠ جم' },
    ],
    subtotal: 264, deliveryFee: 12, total: 276,
    note: 'لو السكر مش متاح، الغي السكر بس', payment: 'محفظة', timerSec: 60 },
  { id: 'DLN-٢٠٤٧', status: 'ready', placedAt: 'من ١٢ دقيقة · ٧:٣٢ م',
    customerName: 'هدى مصطفى', customerPhone: '٠١٠ ٧٨٩ ٠١٢٣',
    address: 'شارع الجلاء · ٣ شقة ١٢',
    distance: '٥٠٠ متر', delivery: 'دلنجاتو', driverName: 'كريم منصور',
    items: [
      { name: 'لبن جهينة', qty: 2, price: 32, sub: 'كامل الدسم · ١ لتر' },
      { name: 'بيض بلدي', qty: 1, price: 145, sub: 'كرتونة · ٣٠ بيضة' },
      { name: 'خبز فينو', qty: 3, price: 12, sub: 'طازج' },
    ],
    subtotal: 245, deliveryFee: 10, total: 255,
    note: '', payment: 'كاش', timerSec: 0 },
  { id: 'DLN-٢٠٤٥', status: 'picked', placedAt: 'من ١٦ دقيقة · ٧:٢٨ م',
    customerName: 'يوسف حلمي', customerPhone: '٠١١ ٢٣٤ ٥٦٧٨',
    address: 'شارع المحطة · ١٠', distance: '٩٠٠ متر',
    delivery: 'دلنجاتو', driverName: 'محمود السيد',
    items: [ { name: 'شاي العروسة', qty: 2, price: 55, sub: 'فتلة · ١٠٠' } ],
    subtotal: 110, deliveryFee: 10, total: 120, payment: 'كاش' },
];

// ── Past orders (history) ──────────────────────────────────────────
const HISTORY = [
  { id: 'DLN-٢٠٤٠', status: 'delivered', date: 'النهاردة · ٦:٢٠ م', total: 187,
    items: 4, customerName: 'وائل حسن' },
  { id: 'DLN-٢٠٣٨', status: 'delivered', date: 'النهاردة · ٥:١٠ م', total: 145,
    items: 3, customerName: 'منى صلاح' },
  { id: 'DLN-٢٠٣٢', status: 'delivered', date: 'النهاردة · ٤:٤٥ م', total: 86,
    items: 2, customerName: 'كريم رمضان' },
  { id: 'DLN-٢٠٢٤', status: 'rejected', date: 'النهاردة · ٣:١٢ م', total: 0,
    items: 0, customerName: 'فاتن أحمد', reason: 'منتج خلصان' },
  { id: 'DLN-٢٠١٨', status: 'cancelled', date: 'النهاردة · ٢:٥٠ م', total: 0,
    items: 0, customerName: 'سامي رياض', reason: 'العميل ألغى' },
  { id: 'DLN-٢٠١٢', status: 'delivered', date: 'النهاردة · ١:٣٠ م', total: 312,
    items: 8, customerName: 'علاء يوسف' },
];

// ── Product catalog ─────────────────────────────────────────────────
// availability: 'available' | 'low' | 'out' | 'archived'
const M_PRODUCTS = [
  { id: 'p1', name: 'لبن جهينة', sub: 'كامل الدسم · ١ لتر', category: 'ألبان',
    price: 32, cost: 24, stock: 18, hue: '#F2EEE3', availability: 'available',
    soldToday: 22, sku: 'DM-LBN-01' },
  { id: 'p2', name: 'بيض بلدي', sub: 'كرتونة · ٣٠ بيضة', category: 'ألبان',
    price: 145, cost: 110, stock: 4, hue: '#FAE3B6', availability: 'low',
    soldToday: 12, sku: 'DM-BD-02', tag: 'الأكثر طلباً' },
  { id: 'p3', name: 'جبنة بيضا', sub: 'دومتي · ٥٠٠ جم', category: 'ألبان',
    price: 68, cost: 50, stock: 24, hue: '#F4EFE0', availability: 'available',
    soldToday: 9, sku: 'DM-JN-03' },
  { id: 'p4', name: 'خبز فينو', sub: 'طازج · ٥ أرغفة', category: 'مخبوزات',
    price: 12, cost: 8, stock: 0, hue: '#E9D7A8', availability: 'out',
    soldToday: 31, sku: 'DM-KH-04' },
  { id: 'p5', name: 'زيت عافية', sub: 'دوار الشمس · ١٫٨ لتر', category: 'بقالة',
    price: 92, cost: 75, stock: 14, hue: '#D9DFC8', availability: 'available',
    soldToday: 6, sku: 'DM-ZT-05', tag: 'عرض' },
  { id: 'p6', name: 'أرز فينو', sub: 'مصري · ١ كيلو', category: 'بقالة',
    price: 28, cost: 20, stock: 42, hue: '#F2EEE3', availability: 'available',
    soldToday: 18, sku: 'DM-RZ-06' },
  { id: 'p7', name: 'سكر أبيض', sub: '١ كيلو', category: 'بقالة',
    price: 24, cost: 18, stock: 3, hue: '#EFEFEF', availability: 'low',
    soldToday: 7, sku: 'DM-SK-07' },
  { id: 'p8', name: 'شاي العروسة', sub: 'فتلة · ١٠٠ فتلة', category: 'مشروبات',
    price: 55, cost: 42, stock: 28, hue: '#D8C7B0', availability: 'available',
    soldToday: 11, sku: 'DM-SH-08' },
  { id: 'p9', name: 'مياه نستله', sub: 'عبوة ٦ × ١٫٥ لتر', category: 'مشروبات',
    price: 45, cost: 32, stock: 16, hue: '#E4ECEF', availability: 'available',
    soldToday: 14, sku: 'DM-MY-09' },
  { id: 'p10', name: 'مكرونة ريجينا', sub: 'سباجتي · ٤٠٠ جم', category: 'بقالة',
    price: 19, cost: 14, stock: 38, hue: '#F5EDD8', availability: 'available',
    soldToday: 10, sku: 'DM-MK-10' },
  { id: 'p11', name: 'تونة الوادي', sub: '١٦٠ جم', category: 'معلبات',
    price: 38, cost: 28, stock: 22, hue: '#E1E3D8', availability: 'available',
    soldToday: 5, sku: 'DM-TN-11' },
  { id: 'p12', name: 'مارجرين', sub: 'الزعيم · ٢٥٠ جم', category: 'ألبان',
    price: 22, cost: 16, stock: 0, hue: '#FAE3B6', availability: 'archived',
    soldToday: 0, sku: 'DM-MJ-12' },
];

// ── Categories ──────────────────────────────────────────────────────
const M_CATEGORIES = [
  { id: 'c1', name: 'ألبان', count: 3, icon: 'leaf', visible: true },
  { id: 'c2', name: 'مخبوزات', count: 1, icon: 'cookie', visible: true },
  { id: 'c3', name: 'بقالة', count: 4, icon: 'store', visible: true },
  { id: 'c4', name: 'مشروبات', count: 2, icon: 'cookie', visible: true },
  { id: 'c5', name: 'معلبات', count: 1, icon: 'package', visible: true },
  { id: 'c6', name: 'مأكولات مجمدة', count: 0, icon: 'package', visible: false },
];

// ── Modifiers / Add-ons ─────────────────────────────────────────────
const MODIFIERS = [
  { id: 'm1', name: 'الحجم', required: true, kind: 'one',
    options: [
      { name: 'صغير', price: 0 },
      { name: 'وسط', price: 8 },
      { name: 'كبير', price: 16 },
    ],
    appliesTo: 3 },
  { id: 'm2', name: 'إضافات', required: false, kind: 'multi',
    options: [
      { name: 'كيس إضافي', price: 2 },
      { name: 'تغليف هدية', price: 10 },
      { name: 'فاتورة مطبوعة', price: 0 },
    ],
    appliesTo: 12 },
  { id: 'm3', name: 'الطازة', required: false, kind: 'one',
    options: [
      { name: 'طازج اليوم', price: 0 },
      { name: 'مجمد', price: -2 },
    ],
    appliesTo: 4 },
];

// ── Promotions ──────────────────────────────────────────────────────
// kind: percent | flat | bogo | combo
// status: active | scheduled | ended | draft
const PROMOS = [
  { id: 'pr1', code: 'WEEKEND25', kind: 'percent', value: 25, title: 'خصم نهاية الأسبوع',
    sub: '٢٥٪ خصم على كل الطلبات', status: 'active',
    startsAt: 'الجمعة', endsAt: 'السبت', uses: 142, cap: 500 },
  { id: 'pr2', code: 'BREAD10', kind: 'flat', value: 10, title: 'خصم ١٠ ج.م',
    sub: 'على المخبوزات فقط', status: 'active',
    startsAt: 'كل يوم', endsAt: 'مستمر', uses: 38, cap: null },
  { id: 'pr3', code: 'COMBO50', kind: 'combo', value: 50, title: 'كومبو الإفطار',
    sub: 'لبن + بيض + خبز · ١٢٠ ج.م بدل ١٧٠',
    status: 'active', uses: 67, cap: 200 },
  { id: 'pr4', code: 'RAMADAN30', kind: 'percent', value: 30, title: 'خصم رمضان',
    sub: '٣٠٪ على الكنافة والقطايف', status: 'scheduled',
    startsAt: '١٠ مارس', endsAt: '٩ أبريل', uses: 0, cap: 1000 },
  { id: 'pr5', code: 'BOGO_RICE', kind: 'bogo', value: null, title: 'اشتري ١ خد ١',
    sub: 'على الأرز فينو · كل يوم اتنين',
    status: 'scheduled', startsAt: 'الاتنين الجاي', endsAt: 'لحد الشهر', uses: 0, cap: 50 },
  { id: 'pr6', code: 'NEWYEAR50', kind: 'percent', value: 50, title: 'عرض السنة الجديدة',
    sub: '٥٠٪ على أول طلب · أكتوبر ٢٠٢٥', status: 'ended',
    startsAt: '١ يناير', endsAt: '٧ يناير', uses: 421, cap: 500 },
];

// ── Analytics ───────────────────────────────────────────────────────
const REVENUE_TODAY = 4280;
const REVENUE_YESTERDAY = 3960;
const REVENUE_WEEK = 26450;
const ORDERS_TODAY = 38;
const ORDERS_LIVE = 5;
const AVG_TICKET = Math.round(REVENUE_TODAY / ORDERS_TODAY);
const CONVERSION = 68;

// Hourly revenue for sparkline (today)
const HOURLY = [
  { h: '٨ ص', v: 80 },  { h: '٩', v: 140 }, { h: '١٠', v: 220 },
  { h: '١١', v: 280 }, { h: '١٢ م', v: 340 }, { h: '١', v: 380 },
  { h: '٢', v: 290 }, { h: '٣', v: 260 }, { h: '٤', v: 310 },
  { h: '٥', v: 480 }, { h: '٦', v: 560 }, { h: '٧', v: 620 },
  { h: '٨ م', v: 400 }, { h: '٩', v: 0 }, { h: '١٠', v: 0 },
];

// Daily revenue (last 7 days)
const DAILY = [
  { d: 'الأحد', v: 3120 },
  { d: 'الاتنين', v: 3540 },
  { d: 'التلات', v: 4280 },
  { d: 'الأربع', v: 3960 },
  { d: 'الخميس', v: 4720 },
  { d: 'الجمعة', v: 6840 },
  { d: 'السبت', v: 4280 },
];

// Best sellers
const BEST_SELLERS = [
  { name: 'بيض بلدي', sold: 142, revenue: 20590, trend: 'up' },
  { name: 'خبز فينو', sold: 218, revenue: 2616, trend: 'up' },
  { name: 'لبن جهينة', sold: 156, revenue: 4992, trend: 'flat' },
  { name: 'مياه نستله', sold: 84, revenue: 3780, trend: 'down' },
  { name: 'شاي العروسة', sold: 62, revenue: 3410, trend: 'up' },
];

// Busy hours (heatmap-style data)
const BUSY = [
  { day: 'سبت', hours: [0,0,1,2,3,4,3,2,2,3,4,5,4,3,4,5,5,4,3,2] },
  { day: 'أحد', hours: [0,0,1,2,3,3,3,2,2,3,3,4,4,3,3,4,4,4,3,2] },
  { day: 'اتنين', hours: [0,0,1,2,3,3,3,2,2,3,3,4,4,3,4,4,5,4,3,2] },
  { day: 'تلات', hours: [0,0,1,2,2,3,3,2,2,3,3,4,4,3,4,4,4,4,3,2] },
  { day: 'أربع', hours: [0,0,1,2,3,3,3,2,2,3,3,4,4,3,4,5,5,4,3,2] },
  { day: 'خميس', hours: [0,0,1,2,3,4,4,3,3,3,4,4,5,4,4,5,5,5,4,3] },
  { day: 'جمعة', hours: [0,0,0,1,2,2,2,1,1,2,3,4,5,5,5,5,5,5,4,3] },
];

const CANCEL_REASONS = [
  { reason: 'منتج خلصان', count: 12, pct: 38 },
  { reason: 'وقت تحضير طويل', count: 8, pct: 25 },
  { reason: 'العميل ألغى', count: 6, pct: 19 },
  { reason: 'مشكلة دفع', count: 4, pct: 13 },
  { reason: 'أسباب تانية', count: 2, pct: 5 },
];

// ── Reviews ─────────────────────────────────────────────────────────
const M_REVIEWS = [
  { id: 'r1', name: 'سارة عبد الله', avatar: 'س', stars: 5, date: 'إمبارح',
    order: 'DLN-٢٠٣٢',
    body: 'المنتج وصل طازج والكابتن لطيف. هطلب تاني أكيد.',
    tags: ['التوصيل سريع', 'المنتجات نضيفة'], response: null },
  { id: 'r2', name: 'محمد إبراهيم', avatar: 'م', stars: 4, date: 'من ٣ أيام',
    order: 'DLN-١٩٩٨',
    body: 'كله كويس بس التوصيل اتأخر شوية. عموماً تجربة ممتازة.',
    tags: ['الكابتن مؤدب'],
    response: 'شكراً لتعليقك! هنشتغل على وقت التحضير علشان توصلك أسرع.' },
  { id: 'r3', name: 'هدى مصطفى', avatar: 'هـ', stars: 2, date: 'من ٤ أيام',
    order: 'DLN-١٩٨٢',
    body: 'الخبز ما كانش طازج اللي ينفع. حلو لو راجعتوا التغليف.',
    tags: ['تغليف ضعيف'], response: null },
  { id: 'r4', name: 'يوسف حلمي', avatar: 'ي', stars: 5, date: 'من أسبوع',
    order: 'DLN-١٩٢٠',
    body: 'أحسن سوبر ماركت في الدلنجات. أسعار مناسبة وخدمة سريعة.',
    tags: ['الأسعار مناسبة', 'المنتجات نضيفة'], response: null },
  { id: 'r5', name: 'منى صلاح', avatar: 'م', stars: 5, date: 'من أسبوع',
    order: 'DLN-١٨٩٤',
    body: 'البيع الكرتونة كاملة والأسعار أرخص من السوق. ربنا يبارك.',
    tags: [], response: 'ربنا يخليكي أم محمد، نورتي المحل.' },
];

const REVIEW_STATS = {
  avg: 4.8,
  total: 312,
  breakdown: [
    { n: 5, count: 248, pct: 79 },
    { n: 4, count: 38, pct: 12 },
    { n: 3, count: 14, pct: 5 },
    { n: 2, count: 8, pct: 3 },
    { n: 1, count: 4, pct: 1 },
  ],
};

// ── Staff ───────────────────────────────────────────────────────────
const STAFF = [
  { id: 's1', name: 'حسن السيد', role: 'مدير المحل', phone: '٠١٠ ٢٣٤ ٥٦٧٨',
    perms: ['orders', 'products', 'analytics', 'staff', 'settings'],
    active: true, letter: 'ح', owner: true },
  { id: 's2', name: 'محمد علي', role: 'كاشير', phone: '٠١١ ٢٣٤ ٥٦٧٨',
    perms: ['orders', 'products'], active: true, letter: 'م' },
  { id: 's3', name: 'هاني عبد الفتاح', role: 'مسؤول التحضير', phone: '٠١٢ ٢٣٤ ٥٦٧٨',
    perms: ['orders'], active: true, letter: 'هـ' },
  { id: 's4', name: 'سيد محمود', role: 'مسؤول المخزن', phone: '٠١٢ ٤٥٦ ٧٨٩٠',
    perms: ['products'], active: false, letter: 'س' },
];

const ROLE_TEMPLATES = [
  { id: 'manager', name: 'مدير المحل', perms: ['orders', 'products', 'analytics', 'staff', 'settings'] },
  { id: 'cashier', name: 'كاشير', perms: ['orders', 'products'] },
  { id: 'prep', name: 'مسؤول التحضير', perms: ['orders'] },
  { id: 'stock', name: 'مسؤول المخزن', perms: ['products'] },
];

const PERMISSIONS = [
  { key: 'orders', label: 'إدارة الطلبات', icon: 'receipt' },
  { key: 'products', label: 'إدارة المنتجات والمخزن', icon: 'package' },
  { key: 'analytics', label: 'التحليلات والإحصائيات', icon: 'layers' },
  { key: 'staff', label: 'إدارة الفريق', icon: 'user' },
  { key: 'settings', label: 'إعدادات المحل', icon: 'settings' },
];

// ── Opening hours ───────────────────────────────────────────────────
const HOURS = [
  { day: 'السبت', open: '٨:٠٠ ص', close: '١٠:٠٠ م', closed: false },
  { day: 'الأحد', open: '٨:٠٠ ص', close: '١٠:٠٠ م', closed: false },
  { day: 'الاتنين', open: '٨:٠٠ ص', close: '١٠:٠٠ م', closed: false },
  { day: 'التلات', open: '٨:٠٠ ص', close: '١٠:٠٠ م', closed: false },
  { day: 'الأربع', open: '٨:٠٠ ص', close: '١٠:٠٠ م', closed: false },
  { day: 'الخميس', open: '٨:٠٠ ص', close: '١٢:٠٠ ص', closed: false },
  { day: 'الجمعة', open: '١:٠٠ م', close: '١٢:٠٠ ص', closed: false },
];

// ── Notifications ───────────────────────────────────────────────────
const M_NOTIFICATIONS = [
  { id: 'n1', icon: 'receipt', title: 'طلب جديد · DLN-٢٠٥١',
    body: 'أحمد محمد · ٢٥٥ ج.م · ٣ منتجات',
    time: 'دلوقتي', read: false, accent: 'olive', kind: 'order' },
  { id: 'n2', icon: 'package', title: 'مخزون منخفض · بيض بلدي',
    body: 'باقي ٤ قطع بس — لو نفد هيختفي من القائمة.',
    time: 'من ١٠ دقايق', read: false, accent: 'gold', kind: 'stock' },
  { id: 'n3', icon: 'star', title: 'تقييم جديد · ٥ نجوم',
    body: 'يوسف حلمي قيّمك — "أحسن سوبر ماركت في الدلنجات".',
    time: 'من ٢٠ دقيقة', read: false, accent: 'olive', kind: 'review' },
  { id: 'n4', icon: 'flame', title: 'عرض WEEKEND25 شغّال',
    body: 'استخدم ١٤٢ مرة من أول الجمعة — كسبت ١٤ عميل جديد.',
    time: 'من ساعة', read: true, accent: 'gold', kind: 'campaign' },
  { id: 'n5', icon: 'info', title: 'تحديث على رسوم التوصيل',
    body: 'الرسوم الجديدة ٨–١٢ ج.م سارية من بكرة.',
    time: 'إمبارح', read: true, accent: 'olive', kind: 'ops' },
  { id: 'n6', icon: 'check', title: 'تم تحويل أرباح الأسبوع',
    body: '٢٢٬٤٧٨ ج.م على حسابك البنكي · مرجع #٤٢١٠',
    time: 'إمبارح', read: true, accent: 'olive', kind: 'payout' },
];

// ── Payout summary ──────────────────────────────────────────────────
const PAYOUT = {
  nextDate: 'بكرة · الأحد ٩ ص',
  pending: 4280,
  thisMonth: 96420,
  lastMonth: 88340,
  bank: 'البنك الأهلي المصري',
  bankAccount: '••• ٤٥٠٩',
  history: [
    { date: 'الجمعة', amount: 22478, ref: '#٤٢١٠' },
    { date: 'الجمعة اللي فاتت', amount: 19840, ref: '#٤١٨٣' },
    { date: 'من ١٤ يوم', amount: 21340, ref: '#٤١٥٢' },
  ],
};

Object.assign(window, {
  STORE, QUEUE, HISTORY, M_PRODUCTS, M_CATEGORIES, MODIFIERS, PROMOS,
  REVENUE_TODAY, REVENUE_YESTERDAY, REVENUE_WEEK, ORDERS_TODAY, ORDERS_LIVE,
  AVG_TICKET, CONVERSION,
  HOURLY, DAILY, BEST_SELLERS, BUSY, CANCEL_REASONS,
  M_REVIEWS, REVIEW_STATS,
  STAFF, ROLE_TEMPLATES, PERMISSIONS,
  HOURS, M_NOTIFICATIONS, PAYOUT,
});
