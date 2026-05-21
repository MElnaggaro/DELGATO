/**
 * Icon barrel — Lucide via lucide-react-native. The brand README explicitly
 * names Lucide as the stand-in pack. All icons:
 *   - 2px stroke, square joins (Lucide default)
 *   - olive or ink, no other colors
 *   - 24×24 standard, 20×20 compact, 32×32 prominent
 *
 * Directional icons (arrows, chevrons, back) MUST be picked via Icon.back / .forward
 * which select the visually-correct glyph for the active writing direction.
 */
import {
  Bell,
  Bike,
  Cake,
  CheckCircle2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  CreditCard,
  Globe,
  Home,
  Heart,
  HelpCircle,
  Info,
  Leaf,
  LogOut,
  MapPin,
  MessageCircle,
  Minus,
  Navigation,
  Package,
  Pencil,
  Phone,
  Pill,
  Plus,
  RefreshCw,
  Receipt,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  Store,
  Tag,
  Trash2,
  User,
  Utensils,
  Wallet,
  Wifi,
  WifiOff,
  X,
  Flame,
  Cookie,
  Banknote,
  type LucideProps,
} from 'lucide-react-native';

import { useRtl } from '@/shared/hooks/useRtl';
import { colors } from '@/shared/theme';

type IconCommon = Omit<LucideProps, 'color'> & { color?: string };

const defaults: Pick<LucideProps, 'strokeWidth' | 'color' | 'size'> = {
  strokeWidth: 2,
  color: colors.ink,
  size: 24,
};

const wrap = (Cmp: React.ComponentType<LucideProps>) => {
  const Wrapped = (props: IconCommon) => <Cmp {...defaults} {...props} />;
  Wrapped.displayName = `Icon(${Cmp.displayName ?? Cmp.name ?? 'lucide'})`;
  return Wrapped;
};

export const Icon = {
  bell: wrap(Bell),
  bike: wrap(Bike),
  cake: wrap(Cake),
  cart: wrap(ShoppingCart),
  bag: wrap(ShoppingBag),
  cash: wrap(Banknote),
  card: wrap(CreditCard),
  check: wrap(Check),
  checkCircle: wrap(CheckCircle2),
  chevronDown: wrap(ChevronDown),
  chevronUp: wrap(ChevronUp),
  clock: wrap(Clock),
  cookie: wrap(Cookie),
  edit: wrap(Pencil),
  filter: wrap(SlidersHorizontal),
  flame: wrap(Flame),
  globe: wrap(Globe),
  heart: wrap(Heart),
  help: wrap(HelpCircle),
  home: wrap(Home),
  info: wrap(Info),
  leaf: wrap(Leaf),
  logout: wrap(LogOut),
  message: wrap(MessageCircle),
  minus: wrap(Minus),
  navigation: wrap(Navigation),
  package: wrap(Package),
  phone: wrap(Phone),
  pill: wrap(Pill),
  pin: wrap(MapPin),
  plus: wrap(Plus),
  receipt: wrap(Receipt),
  refresh: wrap(RefreshCw),
  search: wrap(Search),
  share: wrap(Share2),
  shieldCheck: wrap(ShieldCheck),
  star: wrap(Star),
  store: wrap(Store),
  tag: wrap(Tag),
  trash: wrap(Trash2),
  user: wrap(User),
  utensils: wrap(Utensils),
  wallet: wrap(Wallet),
  wifi: wrap(Wifi),
  wifiOff: wrap(WifiOff),
  x: wrap(X),
} as const;

/**
 * Directional icons — `back` is always the chevron that points toward the
 * start of reading direction. In RTL, that is chevron-right (which is the
 * "next character" in the LTR sense, but the "previous screen" visually).
 */
export function IconBack(props: IconCommon) {
  const { isRtl } = useRtl();
  const C = isRtl ? ChevronRight : ChevronLeft;
  return <C {...defaults} {...props} />;
}

export function IconForward(props: IconCommon) {
  const { isRtl } = useRtl();
  const C = isRtl ? ChevronLeft : ChevronRight;
  return <C {...defaults} {...props} />;
}
