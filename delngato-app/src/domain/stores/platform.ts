/**
 * The platform store.
 *
 * Canonical reactive cache for every entity that needs to be shared between
 * the customer and merchant surfaces. Per blueprint § 8.1, this store is the
 * **cache, not the API**: only repository implementations call its setters.
 *
 * Lint rule: anything outside `src/infrastructure/` may read this store via
 * selectors but MUST NOT call its mutating setters directly.
 */

import { create } from 'zustand';
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware';

import { zustandAsyncStorage } from '@/services/storage';
import type {
  Address,
  Category,
  Id,
  ModifierGroup,
  Notification,
  Order,
  Payout,
  Product,
  Promotion,
  Review,
  Staff,
  Store,
  Wallet,
  WalletTx,
} from '@/domain/types';

export type EntityKind =
  | 'product'
  | 'order'
  | 'promotion'
  | 'store'
  | 'review'
  | 'category'
  | 'modifier'
  | 'staff'
  | 'payout'
  | 'notification'
  | 'address'
  | 'wallet'
  | 'walletTx';

export type PlatformPatch = {
  readonly products?: readonly Product[];
  readonly orders?: readonly Order[];
  readonly promotions?: readonly Promotion[];
  readonly stores?: readonly Store[];
  readonly reviews?: readonly Review[];
  readonly categories?: readonly Category[];
  readonly modifiers?: readonly ModifierGroup[];
  readonly staff?: readonly Staff[];
  readonly payouts?: readonly Payout[];
  readonly notifications?: readonly Notification[];
  readonly addresses?: readonly Address[];
  readonly wallets?: readonly Wallet[];
  readonly walletTx?: readonly WalletTx[];
};

type Entities = {
  products: Record<Id, Product>;
  orders: Record<Id, Order>;
  promotions: Record<Id, Promotion>;
  stores: Record<Id, Store>;
  reviews: Record<Id, Review>;
  categories: Record<Id, Category>;
  modifiers: Record<Id, ModifierGroup>;
  staff: Record<Id, Staff>;
  payouts: Record<Id, Payout>;
  notifications: Record<Id, Notification>;
  addresses: Record<Id, Address>;
  wallets: Record<Id, Wallet>;
  walletTx: Record<Id, WalletTx>;
};

type State = Entities & {
  hydrated: boolean;
};

type Actions = {
  applyProduct: (p: Product) => void;
  applyOrder: (o: Order) => void;
  applyPromotion: (p: Promotion) => void;
  applyStore: (s: Store) => void;
  applyReview: (r: Review) => void;
  applyCategory: (c: Category) => void;
  applyModifier: (m: ModifierGroup) => void;
  applyStaff: (s: Staff) => void;
  applyPayout: (p: Payout) => void;
  applyNotification: (n: Notification) => void;
  applyAddress: (a: Address) => void;
  applyWallet: (w: Wallet) => void;
  applyWalletTx: (t: WalletTx) => void;
  applyBatch: (patch: PlatformPatch) => void;
  remove: (kind: EntityKind, id: Id) => void;
  markHydrated: () => void;
  /** Wipe everything. Used by dev kit + role-switch sign-out. */
  reset: () => void;
};

const emptyEntities = (): Entities => ({
  products: {},
  orders: {},
  promotions: {},
  stores: {},
  reviews: {},
  categories: {},
  modifiers: {},
  staff: {},
  payouts: {},
  notifications: {},
  addresses: {},
  wallets: {},
  walletTx: {},
});

const indexById = <T extends { readonly id: Id }>(
  prev: Record<Id, T>,
  rows: readonly T[],
): Record<Id, T> => {
  if (rows.length === 0) return prev;
  const next = { ...prev };
  for (const r of rows) next[r.id] = r;
  return next;
};

export const usePlatformStore = create<State & Actions>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        ...emptyEntities(),
        hydrated: false,

        applyProduct: (p) => set((s) => ({ products: { ...s.products, [p.id]: p } })),
        applyOrder: (o) => set((s) => ({ orders: { ...s.orders, [o.id]: o } })),
        applyPromotion: (p) =>
          set((s) => ({ promotions: { ...s.promotions, [p.id]: p } })),
        applyStore: (s2) => set((s) => ({ stores: { ...s.stores, [s2.id]: s2 } })),
        applyReview: (r) => set((s) => ({ reviews: { ...s.reviews, [r.id]: r } })),
        applyCategory: (c) =>
          set((s) => ({ categories: { ...s.categories, [c.id]: c } })),
        applyModifier: (m) =>
          set((s) => ({ modifiers: { ...s.modifiers, [m.id]: m } })),
        applyStaff: (st) => set((s) => ({ staff: { ...s.staff, [st.id]: st } })),
        applyPayout: (p) => set((s) => ({ payouts: { ...s.payouts, [p.id]: p } })),
        applyNotification: (n) =>
          set((s) => ({ notifications: { ...s.notifications, [n.id]: n } })),
        applyAddress: (a) =>
          set((s) => ({ addresses: { ...s.addresses, [a.id]: a } })),
        applyWallet: (w) => set((s) => ({ wallets: { ...s.wallets, [w.id]: w } })),
        applyWalletTx: (t) =>
          set((s) => ({ walletTx: { ...s.walletTx, [t.id]: t } })),

        applyBatch: (patch) =>
          set((s) => ({
            ...(patch.products ? { products: indexById(s.products, patch.products) } : null),
            ...(patch.orders ? { orders: indexById(s.orders, patch.orders) } : null),
            ...(patch.promotions
              ? { promotions: indexById(s.promotions, patch.promotions) }
              : null),
            ...(patch.stores ? { stores: indexById(s.stores, patch.stores) } : null),
            ...(patch.reviews ? { reviews: indexById(s.reviews, patch.reviews) } : null),
            ...(patch.categories
              ? { categories: indexById(s.categories, patch.categories) }
              : null),
            ...(patch.modifiers
              ? { modifiers: indexById(s.modifiers, patch.modifiers) }
              : null),
            ...(patch.staff ? { staff: indexById(s.staff, patch.staff) } : null),
            ...(patch.payouts ? { payouts: indexById(s.payouts, patch.payouts) } : null),
            ...(patch.notifications
              ? { notifications: indexById(s.notifications, patch.notifications) }
              : null),
            ...(patch.addresses
              ? { addresses: indexById(s.addresses, patch.addresses) }
              : null),
            ...(patch.wallets ? { wallets: indexById(s.wallets, patch.wallets) } : null),
            ...(patch.walletTx
              ? { walletTx: indexById(s.walletTx, patch.walletTx) }
              : null),
          })),

        remove: (kind, id) =>
          set((s) => {
            const key = kindToKey[kind];
            const slice = { ...s[key] };
            delete (slice as Record<Id, unknown>)[id];
            return { [key]: slice } as unknown as Partial<State>;
          }),

        markHydrated: () => set({ hydrated: true }),

        reset: () => set({ ...emptyEntities(), hydrated: true }),
      }),
      {
        name: 'delngato.platform.v1',
        version: 1,
        storage: createJSONStorage(() => zustandAsyncStorage),
        partialize: (s) => {
          const { hydrated: _h, ...rest } = s as State & Actions;
          // Strip actions and `hydrated` flag.
          const persisted: Entities = {
            products: rest.products,
            orders: rest.orders,
            promotions: rest.promotions,
            stores: rest.stores,
            reviews: rest.reviews,
            categories: rest.categories,
            modifiers: rest.modifiers,
            staff: rest.staff,
            payouts: rest.payouts,
            notifications: rest.notifications,
            addresses: rest.addresses,
            wallets: rest.wallets,
            walletTx: rest.walletTx,
          };
          return persisted;
        },
      },
    ),
  ),
);

const kindToKey: Record<EntityKind, keyof Entities> = {
  product: 'products',
  order: 'orders',
  promotion: 'promotions',
  store: 'stores',
  review: 'reviews',
  category: 'categories',
  modifier: 'modifiers',
  staff: 'staff',
  payout: 'payouts',
  notification: 'notifications',
  address: 'addresses',
  wallet: 'wallets',
  walletTx: 'walletTx',
};

/**
 * Imperative read accessor for repository implementations and selectors that
 * don't need React reactivity. UI should always use `usePlatformStore(selector)`.
 */
export const platformStore = usePlatformStore;
