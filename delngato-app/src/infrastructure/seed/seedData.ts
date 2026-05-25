/**
 * Seed data for the platform store on first boot.
 *
 * Source: existing `src/features/catalog/data.ts` constants (which mirror the
 * design reference 1:1). This file adapts them to the new domain entity
 * shapes (audit fields, store ownership, etc.). The original catalog file
 * remains untouched — it continues to feed the customer surface today.
 *
 * Phase 2 of the roadmap migrates customer reads to route through the
 * platform store so this seed becomes the live source for both roles.
 */

import {
  SHOPS,
  PRODUCTS,
  CATEGORIES,
  ORDERS_HISTORY,
  NOTIFICATIONS,
  REVIEWS,
  DEALS,
} from '@/features/catalog/data';
import type {
  Address,
  Category,
  Customer,
  HoursWeek,
  Merchant,
  Notification,
  Order,
  OrderItem,
  Product,
  Promotion,
  Review,
  Staff,
  Store,
  Wallet,
} from '@/domain/types';

const NOW = '2026-05-24T08:00:00.000Z';

const newAudit = () => ({ createdAt: NOW, updatedAt: NOW, version: 1 });

const DEFAULT_HOURS: HoursWeek = {
  sun: { closed: false, open: '08:00', close: '23:30' },
  mon: { closed: false, open: '08:00', close: '23:30' },
  tue: { closed: false, open: '08:00', close: '23:30' },
  wed: { closed: false, open: '08:00', close: '23:30' },
  thu: { closed: false, open: '08:00', close: '23:30' },
  fri: { closed: false, open: '10:00', close: '23:30' },
  sat: { closed: false, open: '08:00', close: '23:30' },
};

const MERCHANT_OWNER_ID_PREFIX = 'merchant-owner-';

// ---------- Customer demo identity ----------

export const DEMO_CUSTOMER: Customer = {
  ...newAudit(),
  id: 'customer-001',
  name: 'يحيى محمد',
  phone: '01000000001',
  email: 'yahia@example.com',
  roles: ['customer'],
  walletId: 'wallet-customer-001',
  addressIds: ['addr-customer-001-1'],
};

export const DEMO_CUSTOMER_WALLET: Wallet = {
  ...newAudit(),
  id: 'wallet-customer-001',
  userId: DEMO_CUSTOMER.id,
  balance: 248,
  points: 1820,
  cashbackThisMonth: 34,
};

export const DEMO_CUSTOMER_ADDRESSES: readonly Address[] = [
  {
    ...newAudit(),
    id: 'addr-customer-001-1',
    userId: DEMO_CUSTOMER.id,
    label: 'البيت',
    icon: 'home',
    street: '٢٧ شارع شريف، وسط البلد',
    detail: 'الدور الرابع، شقة ٤٠٢',
    isDefault: true,
  },
];

// ---------- Stores + Merchants (one merchant per shop) ----------

export const SEED_STORES: readonly Store[] = SHOPS.map((shop) => ({
  ...newAudit(),
  id: shop.id,
  merchantId: `${MERCHANT_OWNER_ID_PREFIX}${shop.id}`,
  name: shop.name,
  letter: shop.letter,
  category: shop.cat,
  catKey: shop.catKey,
  phone: '01000000000',
  address: 'وسط البلد، القاهرة',
  rating: parseFloat(shop.rating.replace('٫', '.').replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))) || 4.5,
  reviewsCount: 128,
  tags: shop.tags,
  bg: { bgFrom: shop.bgFrom, bgTo: shop.bgTo },
  desc: shop.desc,
  open: shop.open,
  acceptingOrders: shop.open,
  prepTimeMin: 15,
  deliveryRadiusKm: 5,
  hours: DEFAULT_HOURS,
  tempClose: null,
  paymentMethods: { cash: true, card: true, wallet: true },
  taxConfig: { enabled: false, rate: 14, inclusive: true },
  deliveryFee: parseFloat(shop.fee.replace(/[^\d.]/g, '')) || 10,
  distance: shop.distance,
}));

export const SEED_MERCHANTS: readonly Merchant[] = SHOPS.map((shop) => ({
  ...newAudit(),
  id: `${MERCHANT_OWNER_ID_PREFIX}${shop.id}`,
  name: 'صاحب المحل',
  phone: '01000000000',
  roles: ['merchant'],
  storeId: shop.id,
  kycStatus: 'verified',
}));

export const DEMO_MERCHANT_ID = SHOPS[0]!.id; // 'abuhassan'

// ---------- Products (all attached to demo merchant's store) ----------

export const SEED_PRODUCTS: readonly Product[] = PRODUCTS.map((p) => {
  const stock = p.available === false ? 0 : 12;
  const availability: Product['availability'] = stock === 0 ? 'out' : stock < 5 ? 'low' : 'available';
  return {
    ...newAudit(),
    id: p.id,
    storeId: DEMO_MERCHANT_ID,
    name: p.name,
    sub: p.sub,
    categoryId: null,
    price: p.price,
    stock,
    hue: p.hue,
    availability,
    soldToday: 0,
    modifierGroupIds: [],
    ...(p.tag ? { tag: p.tag } : {}),
    ...(p.section ? { section: p.section } : {}),
  };
});

// ---------- Categories (per the design reference's flat list) ----------

export const SEED_CATEGORIES: readonly Category[] = CATEGORIES.filter(
  (c) => c.key !== 'all',
).map((c, i) => ({
  ...newAudit(),
  id: `cat-${c.key}`,
  storeId: DEMO_MERCHANT_ID,
  name: c.label,
  count: 0,
  ...(c.icon ? { icon: c.icon } : {}),
  visible: true,
  order: i,
}));

// ---------- Promotions (derived from DEALS) ----------

const farFuture = '2027-01-01T00:00:00.000Z';
const farPast = '2025-01-01T00:00:00.000Z';

export const SEED_PROMOTIONS: readonly Promotion[] = DEALS.map((d) => {
  const kind: Promotion['kind'] = d.kind === 'hero' ? 'flat' : d.kind === 'cashback' ? 'percent' : (d.kind as Promotion['kind']);
  const value = (() => {
    if (kind === 'percent') return 25;
    if (kind === 'flat') return 20;
    return 0;
  })();
  return {
    ...newAudit(),
    id: `promo-${d.id}`,
    storeId: d.shopId ?? DEMO_MERCHANT_ID,
    code: d.code,
    kind,
    value,
    title: d.title,
    sub: d.sub,
    startsAt: farPast,
    endsAt: farFuture,
    uses: 0,
    status: 'active',
  };
});

// ---------- Orders (mapped from legacy OrderHistory[]) ----------

export const SEED_ORDERS: readonly Order[] = ORDERS_HISTORY.map((o) => {
  const status: Order['status'] = o.status === 'live'
    ? (o.step === 0 ? 'accepted' : o.step === 1 ? 'preparing' : o.step === 2 ? 'picked' : 'ready')
    : o.status === 'cancelled'
      ? 'cancelled'
      : 'delivered';

  // Pair every order with the matching store letter
  const store = SEED_STORES.find((s) => s.letter === o.shopLetter) ?? SEED_STORES[0]!;

  const item: OrderItem = {
    productId: SEED_PRODUCTS[0]!.id,
    name: o.shop,
    qty: o.items,
    unitPrice: Math.round(o.total / Math.max(1, o.items)),
    subtotal: o.total,
  };

  return {
    ...newAudit(),
    id: o.id,
    storeId: store.id,
    customerId: DEMO_CUSTOMER.id,
    placedAt: NOW,
    status,
    items: [item],
    subtotal: o.total,
    deliveryFee: store.deliveryFee,
    tip: 0,
    discount: 0,
    total: o.total + store.deliveryFee,
    merchantShare: Math.round(o.total * 0.93),
    payment: 'cash',
    address: DEMO_CUSTOMER_ADDRESSES[0]!.street,
    distanceKm: 1,
    customerName: DEMO_CUSTOMER.name,
    customerPhone: DEMO_CUSTOMER.phone,
    timerSec: (status as string) === 'new' ? 300 : status === 'accepted' || status === 'preparing' ? 600 : 0,
    timeline: [{ ts: NOW, status, byRole: 'system' }],
    ...(o.status === 'cancelled' ? { cancellationReason: 'متلغي' } : {}),
  };
});

// ---------- Reviews ----------

export const SEED_REVIEWS: readonly Review[] = REVIEWS.map((r, i) => ({
  ...newAudit(),
  id: r.id,
  storeId: DEMO_MERCHANT_ID,
  customerId: DEMO_CUSTOMER.id,
  customerName: r.name,
  avatar: r.avatar,
  stars: r.stars,
  ts: NOW,
  orderId: ORDERS_HISTORY[i % ORDERS_HISTORY.length]!.id,
  body: r.body,
  tags: r.tags,
  response: null,
}));

// ---------- Notifications (customer) ----------

export const SEED_NOTIFICATIONS_CUSTOMER: readonly Notification[] = NOTIFICATIONS.map((n) => ({
  ...newAudit(),
  id: n.id,
  userId: DEMO_CUSTOMER.id,
  role: 'customer',
  icon: n.icon,
  title: n.title,
  body: n.body,
  ts: NOW,
  read: n.read,
  accent: n.accent,
  kind: 'order',
}));

// ---------- Staff (owner only for demo merchant) ----------

export const SEED_STAFF: readonly Staff[] = SHOPS.map((shop) => ({
  ...newAudit(),
  id: `staff-${shop.id}-owner`,
  storeId: shop.id,
  name: 'صاحب المحل',
  phone: '01000000000',
  role: 'Owner',
  perms: ['orders', 'products', 'analytics', 'staff', 'settings'],
  active: true,
  isOwner: true,
}));

// ---------- Aggregated bundle ----------

export type SeedBundle = {
  readonly stores: readonly Store[];
  readonly merchants: readonly Merchant[];
  readonly customers: readonly Customer[];
  readonly products: readonly Product[];
  readonly categories: readonly Category[];
  readonly promotions: readonly Promotion[];
  readonly orders: readonly Order[];
  readonly reviews: readonly Review[];
  readonly notifications: readonly Notification[];
  readonly addresses: readonly Address[];
  readonly wallets: readonly Wallet[];
  readonly staff: readonly Staff[];
};

export const SEED_BUNDLE: SeedBundle = {
  stores: SEED_STORES,
  merchants: SEED_MERCHANTS,
  customers: [DEMO_CUSTOMER],
  products: SEED_PRODUCTS,
  categories: SEED_CATEGORIES,
  promotions: SEED_PROMOTIONS,
  orders: SEED_ORDERS,
  reviews: SEED_REVIEWS,
  notifications: SEED_NOTIFICATIONS_CUSTOMER,
  addresses: DEMO_CUSTOMER_ADDRESSES,
  wallets: [DEMO_CUSTOMER_WALLET],
  staff: SEED_STAFF,
};
