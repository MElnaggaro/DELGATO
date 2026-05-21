// data.jsx — shop catalog used across screens
const SHOPS = [
  { id: 'abuhassan', letter: 'أ', name: 'سوبر ماركت أبو حسن', cat: 'بقالة', distance: '٤٠٠ متر',
    rating: '٤٫٨', eta: '١٥–٢٠ د', fee: '١٠ ج.م', open: true,
    bg: 'linear-gradient(135deg,#1F4A3D 0%,#173629 100%)' },
  { id: 'noor', letter: 'ن', name: 'صيدلية النور', cat: 'صيدلية', distance: '٢٠٠ متر',
    rating: '٤٫٩', eta: '١٠–١٥ د', fee: '٨ ج.م', open: true,
    bg: 'linear-gradient(135deg,#2C5C4B 0%,#1F4A3D 100%)' },
  { id: 'masry', letter: 'م', name: 'فول وطعمية المصري', cat: 'أكل', distance: '٦٠٠ متر',
    rating: '٤٫٧', eta: '٢٠–٣٠ د', fee: '١٢ ج.م', open: true,
    bg: 'linear-gradient(135deg,#A66B2C 0%,#7A4D1F 100%)' },
  { id: 'halawa', letter: 'ح', name: 'حلواني الجلاء', cat: 'حلويات', distance: '٨٠٠ متر',
    rating: '٤٫٦', eta: '٢٥–٣٥ د', fee: '١٥ ج.م', open: false,
    bg: 'linear-gradient(135deg,#E8B14F 0%,#C9933A 100%)' },
  { id: 'khodar', letter: 'خ', name: 'خضار وفاكهة عم سعيد', cat: 'خضار وفاكهة', distance: '٥٠٠ متر',
    rating: '٤٫٥', eta: '١٥–٢٥ د', fee: '١٠ ج.م', open: true,
    bg: 'linear-gradient(135deg,#3C6B4F 0%,#234731 100%)' },
];

const CATEGORIES = [
  { key: 'all', label: 'الكل', icon: '⊕' },
  { key: 'grocery', label: 'بقالة' },
  { key: 'pharmacy', label: 'صيدلية' },
  { key: 'food', label: 'أكل' },
  { key: 'sweets', label: 'حلويات' },
  { key: 'produce', label: 'خضار وفاكهة' },
];

// Products inside a shop (Abu Hassan grocery).
// "img" is a small tag/hue for the placeholder photo tile — brand bans
// emoji in product UI, so each product gets a warm-tinted swatch + glyph
// pulled from the product's first Arabic letter.
const PRODUCTS = [
  { id: 'p1', name: 'لبن جهينة', sub: 'كامل الدسم · ١ لتر', price: 32, hue: '#F2EEE3', tag: null },
  { id: 'p2', name: 'بيض بلدي', sub: 'كرتونة · ٣٠ بيضة', price: 145, hue: '#FAE3B6', tag: 'الأكثر طلباً' },
  { id: 'p3', name: 'جبنة بيضا', sub: 'دومتي · ٥٠٠ جم', price: 68, hue: '#F4EFE0', tag: null },
  { id: 'p4', name: 'خبز فينو', sub: 'طازج · ٥ أرغفة', price: 12, hue: '#E9D7A8', tag: null },
  { id: 'p5', name: 'زيت عافية', sub: 'دوار الشمس · ١٫٨ لتر', price: 92, hue: '#D9DFC8', tag: 'عرض' },
  { id: 'p6', name: 'أرز فينو', sub: 'مصري · ١ كيلو', price: 28, hue: '#F2EEE3', tag: null },
  { id: 'p7', name: 'سكر أبيض', sub: '١ كيلو', price: 24, hue: '#EFEFEF', tag: null },
  { id: 'p8', name: 'شاي العروسة', sub: 'فتلة · ١٠٠ فتلة', price: 55, hue: '#D8C7B0', tag: null },
];

window.SHOPS = SHOPS;
window.CATEGORIES = CATEGORIES;
window.PRODUCTS = PRODUCTS;
