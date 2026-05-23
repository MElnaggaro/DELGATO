/**
 * Mock catalog — mirrors design/design-reference/app/data.jsx 1:1 so visuals
 * line up exactly with the reference. Replace with real API later.
 */

export type CategoryKey = 'all' | 'grocery' | 'pharmacy' | 'food' | 'sweets' | 'produce';

export type Category = {
  key: CategoryKey;
  label: string;
  icon?: 'store' | 'pill' | 'utensils' | 'cookie' | 'leaf';
};

export type Shop = {
  id: string;
  letter: string;
  name: string;
  cat: string;
  catKey: CategoryKey;
  distance: string;
  rating: string;
  eta: string;
  fee: string;
  open: boolean;
  desc: string;
  bgFrom: string;
  bgTo: string;
  tags: string[];
};

export type Product = {
  id: string;
  name: string;
  sub: string;
  price: number;
  hue: string;
  tag: string | null;
  section: string;
};

export type Notification = {
  id: string;
  icon: 'bike' | 'tag' | 'check' | 'store' | 'info';
  title: string;
  body: string;
  time: string;
  read: boolean;
  accent: 'olive' | 'gold';
};

export type OrderStatus = 'live' | 'done' | 'cancelled';

export type OrderHistory = {
  id: string;
  shop: string;
  shopLetter: string;
  status: OrderStatus;
  statusText: string;
  date: string;
  total: number;
  items: number;
  step: 0 | 1 | 2 | 3;
};

export const SHOPS: Shop[] = [
  {
    id: 'abuhassan',
    letter: 'أ',
    name: 'سوبر ماركت أبو حسن',
    cat: 'بقالة',
    catKey: 'grocery',
    distance: '٤٠٠ متر',
    rating: '٤٫٨',
    eta: '١٥–٢٠ د',
    fee: '١٠ ج.م',
    open: true,
    desc: 'بقالة بلدي بكل اللي محتاجه — من اللبن للمعلبات.',
    bgFrom: '#1F4A3D',
    bgTo: '#173629',
    tags: ['عرض اليوم', 'الأكثر طلباً'],
  },
  {
    id: 'noor',
    letter: 'ن',
    name: 'صيدلية النور',
    cat: 'صيدلية',
    catKey: 'pharmacy',
    distance: '٢٠٠ متر',
    rating: '٤٫٩',
    eta: '١٠–١٥ د',
    fee: '٨ ج.م',
    open: true,
    desc: 'صيدلية شغّالة ٢٤ ساعة — أدوية، مستلزمات أطفال، ومستحضرات.',
    bgFrom: '#2C5C4B',
    bgTo: '#1F4A3D',
    tags: ['٢٤ ساعة'],
  },
  {
    id: 'masry',
    letter: 'م',
    name: 'فول وطعمية المصري',
    cat: 'أكل',
    catKey: 'food',
    distance: '٦٠٠ متر',
    rating: '٤٫٧',
    eta: '٢٠–٣٠ د',
    fee: '١٢ ج.م',
    open: true,
    desc: 'فول وطعمية وفطار بلدي على أصوله — كل يوم من الفجر.',
    bgFrom: '#A66B2C',
    bgTo: '#7A4D1F',
    tags: ['فطار'],
  },
  {
    id: 'halawa',
    letter: 'ح',
    name: 'حلواني الجلاء',
    cat: 'حلويات',
    catKey: 'sweets',
    distance: '٨٠٠ متر',
    rating: '٤٫٦',
    eta: '٢٥–٣٥ د',
    fee: '١٥ ج.م',
    open: false,
    desc: 'حلويات شرقية وغربية وأنواع كنافة وقطايف فى موسمها.',
    bgFrom: '#E8B14F',
    bgTo: '#C9933A',
    tags: [],
  },
  {
    id: 'khodar',
    letter: 'خ',
    name: 'خضار وفاكهة عم سعيد',
    cat: 'خضار وفاكهة',
    catKey: 'produce',
    distance: '٥٠٠ متر',
    rating: '٤٫٥',
    eta: '١٥–٢٥ د',
    fee: '١٠ ج.م',
    open: true,
    desc: 'خضار وفاكهة طازة كل يوم من السوق — انتقاء يدوي.',
    bgFrom: '#3C6B4F',
    bgTo: '#234731',
    tags: ['طازج اليوم'],
  },
  {
    id: 'sokar',
    letter: 'س',
    name: 'محل السكر',
    cat: 'بقالة',
    catKey: 'grocery',
    distance: '٣٠٠ متر',
    rating: '٤٫٤',
    eta: '١٠–١٥ د',
    fee: '٨ ج.م',
    open: true,
    desc: 'بقالة صغيرة بأسعار محل العيلة.',
    bgFrom: '#3A5247',
    bgTo: '#23362D',
    tags: [],
  },
];

export const CATEGORIES: Category[] = [
  { key: 'all', label: 'الكل' },
  { key: 'grocery', label: 'بقالة', icon: 'store' },
  { key: 'pharmacy', label: 'صيدلية', icon: 'pill' },
  { key: 'food', label: 'أكل', icon: 'utensils' },
  { key: 'sweets', label: 'حلويات', icon: 'cookie' },
  { key: 'produce', label: 'خضار وفاكهة', icon: 'leaf' },
];

export const PRODUCTS: Product[] = [
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

export const NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    icon: 'bike',
    title: 'الكابتن في الطريق',
    body: 'محمود السيد في طريقه ليك — بعد ٧ دقايق تقريباً.',
    time: 'دلوقتي',
    read: false,
    accent: 'olive',
  },
  {
    id: 'n2',
    icon: 'tag',
    title: 'عرض اليوم',
    body: 'توصيل ببلاش على أول طلب — استخدم كود DLN10.',
    time: 'من ساعتين',
    read: false,
    accent: 'gold',
  },
  {
    id: 'n3',
    icon: 'check',
    title: 'تم التوصيل · طلب DLN-٢٠٣٢',
    body: 'شكراً لاستخدامك دلنجاتُو. قيّم تجربتك دلوقتي.',
    time: 'إمبارح',
    read: true,
    accent: 'olive',
  },
  {
    id: 'n4',
    icon: 'store',
    title: 'محل جديد قريب منك',
    body: 'فتح حلواني العائلة بـ ٥٠٠ متر — جرب طلبك الأول.',
    time: 'إمبارح',
    read: true,
    accent: 'olive',
  },
  {
    id: 'n5',
    icon: 'info',
    title: 'تحديث على وقت التوصيل',
    body: 'بسبب الأمطار، التوصيل ممكن يتأخر ٥–١٠ دقايق.',
    time: 'من يومين',
    read: true,
    accent: 'gold',
  },
];

export const ORDERS_HISTORY: OrderHistory[] = [
  {
    id: 'DLN-٢٠٤٧',
    shop: 'سوبر ماركت أبو حسن',
    shopLetter: 'أ',
    status: 'live',
    statusText: 'في الطريق',
    date: 'دلوقتي',
    total: 187,
    items: 3,
    step: 2,
  },
  {
    id: 'DLN-٢٠٣٢',
    shop: 'صيدلية النور',
    shopLetter: 'ن',
    status: 'done',
    statusText: 'تم التوصيل',
    date: 'إمبارح · ٧:٤٠ م',
    total: 86,
    items: 2,
    step: 3,
  },
  {
    id: 'DLN-٢٠١٨',
    shop: 'فول وطعمية المصري',
    shopLetter: 'م',
    status: 'done',
    statusText: 'تم التوصيل',
    date: 'الأحد · ٨:٢٠ ص',
    total: 65,
    items: 5,
    step: 3,
  },
  {
    id: 'DLN-٢٠٠٤',
    shop: 'سوبر ماركت أبو حسن',
    shopLetter: 'أ',
    status: 'cancelled',
    statusText: 'متلغي',
    date: 'الجمعة',
    total: 0,
    items: 0,
    step: 0,
  },
  {
    id: 'DLN-١٩٩٣',
    shop: 'خضار وفاكهة عم سعيد',
    shopLetter: 'خ',
    status: 'done',
    statusText: 'تم التوصيل',
    date: 'الخميس · ٥:١٠ م',
    total: 132,
    items: 6,
    step: 3,
  },
];

export const RECENT_SEARCHES = ['لبن', 'صيدلية', 'خبز', 'طعمية'];
export const TRENDING_SEARCHES = ['كنافة', 'بيض بلدي', 'مياه', 'شاي', 'مكرونة'];

export type DealKind = 'hero' | 'percent' | 'cashback' | 'bogo' | 'flat';

export type Deal = {
  id: string;
  kind: DealKind;
  title: string;
  sub: string;
  bgFrom: string;
  bgTo: string;
  icon: 'bike' | 'pill' | 'wallet' | 'utensils' | 'tag';
  code: string;
  value: string;
  shopId?: string;
};

export const DEALS: Deal[] = [
  { id: 'd1', kind: 'hero', title: 'توصيل ببلاش', sub: 'على أول طلب بكود DLN10', bgFrom: '#1F4A3D', bgTo: '#173629', icon: 'bike', code: 'DLN10', value: 'توصيل مجاني' },
  { id: 'd2', kind: 'percent', title: 'خصم ٢٥٪', sub: 'على كل صيدلية النور', bgFrom: '#2C5C4B', bgTo: '#1F4A3D', icon: 'pill', code: 'NOOR25', value: '-٢٥٪', shopId: 'noor' },
  { id: 'd3', kind: 'cashback', title: 'كاش باك ١٠٪', sub: 'على المحفظة لمدة أسبوع', bgFrom: '#E8B14F', bgTo: '#C9933A', icon: 'wallet', code: 'WALLET10', value: '+١٠٪' },
  { id: 'd4', kind: 'bogo', title: '١+١ مجاناً', sub: 'فول وطعمية المصري — كل يوم جمعة', bgFrom: '#A66B2C', bgTo: '#7A4D1F', icon: 'utensils', code: 'FRIDAY', value: '١+١', shopId: 'masry' },
  { id: 'd5', kind: 'flat', title: '٢٠ ج.م خصم', sub: 'على أي طلب فوق ١٥٠ ج.م', bgFrom: '#3C6B4F', bgTo: '#234731', icon: 'tag', code: 'SAVE20', value: '-٢٠ ج' },
];

export type Review = {
  id: string;
  name: string;
  avatar: string;
  stars: number;
  date: string;
  body: string;
  tags: string[];
};

export const REVIEWS: Review[] = [
  { id: 'r1', name: 'سارة عبد الله', avatar: 'س', stars: 5, date: 'إمبارح', body: 'المنتج وصل طازج والكابتن لطيف. هطلب تاني أكيد.', tags: ['التوصيل سريع', 'المنتجات نضيفة'] },
  { id: 'r2', name: 'محمد إبراهيم', avatar: 'م', stars: 4, date: 'من ٣ أيام', body: 'كله كويس بس التوصيل اتأخر شوية. عموماً تجربة ممتازة.', tags: ['الكابتن مؤدب'] },
  { id: 'r3', name: 'هدى مصطفى', avatar: 'هـ', stars: 5, date: 'الأسبوع اللي فات', body: 'أحسن من ٢٤ ساعة. الجبنة طازة والأسعار مناسبة.', tags: ['الأسعار مناسبة', 'المنتجات نضيفة'] },
  { id: 'r4', name: 'يوسف حلمي', avatar: 'ي', stars: 5, date: 'من أسبوعين', body: 'ربنا يبارك في دلنجاتُو. وفّروا علينا وقت وفلوس مواصلات.', tags: ['التوصيل سريع'] },
];

export type AddonOption = { id: string; name: string; price: number };

export const PRODUCT_ADDONS = {
  size: {
    label: 'الحجم',
    required: true,
    kind: 'one' as const,
    options: [
      { id: 's', name: 'صغير', price: 0 },
      { id: 'm', name: 'وسط', price: 8 },
      { id: 'l', name: 'كبير', price: 16 },
    ],
  },
  extras: {
    label: 'إضافات',
    required: false,
    kind: 'multi' as const,
    options: [
      { id: 'e1', name: 'كيس إضافي', price: 2 },
      { id: 'e2', name: 'تغليف هدية', price: 10 },
      { id: 'e3', name: 'فاتورة مطبوعة', price: 0 },
    ],
  },
  notes: { label: 'ملاحظات للمحل', required: false, kind: 'text' as const },
};

export const FEATURED_IDS = ['abuhassan', 'masry', 'noor'];

export function findShop(id: string): Shop | undefined {
  return SHOPS.find((s) => s.id === id);
}

export function findProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
