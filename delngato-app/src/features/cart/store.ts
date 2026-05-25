import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { zustandAsyncStorage } from '@/services/storage';
import type { Product, Shop } from '@/features/catalog/data';

export type CartItem = {
  id: string;
  name: string;
  sub: string;
  price: number;
  qty: number;
  hue: string;
  shop: string;
  shopId: string;
};

export type AppliedPromo = {
  code: string;
  title: string;
  value: string;
  shopId?: string;
};

export type ScheduledSlot = {
  day: string;
  daySub: string;
  slot: string;
};

export type AddItemResult =
  | { ok: true }
  | { ok: false; reason: 'conflict'; existingShop: string; existingShopId: string };

type State = {
  items: CartItem[];
  favorites: string[];
  notifyList: string[];
  appliedPromo: AppliedPromo | null;
  tip: number;
  scheduled: ScheduledSlot | null;
  deliveryNote: string;
  /** Currently bound userId for persistence scoping. Empty string = not yet bound. */
  _boundUserId: string;
};

type Actions = {
  addItem: (product: Product, shop: Shop, qty?: number) => AddItemResult;
  setItemQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  forceReplaceWith: (product: Product, shop: Shop, qty?: number) => void;
  toggleFavorite: (shopId: string) => void;
  toggleNotify: (productId: string) => boolean;
  replaceWith: (items: CartItem[]) => void;
  setAppliedPromo: (promo: AppliedPromo | null) => void;
  setTip: (tip: number) => void;
  setScheduled: (slot: ScheduledSlot | null) => void;
  setDeliveryNote: (note: string) => void;
  /**
   * Load cart for a specific user from AsyncStorage.
   * Called on auth.session-started and role-switch back to customer.
   */
  hydrateForUser: (userId: string) => Promise<void>;
  /**
   * Clear in-memory cart state without deleting from storage.
   * Called on auth.session-ended and role-switch to merchant.
   */
  clearInMemory: () => void;
};

const EMPTY_CART_STATE = {
  items: [] as CartItem[],
  favorites: ['abuhassan', 'noor'],
  notifyList: [] as string[],
  appliedPromo: null as AppliedPromo | null,
  tip: 0,
  scheduled: null as ScheduledSlot | null,
  deliveryNote: '',
};

function cartStorageKey(userId: string): string {
  return userId ? `delgato.cart.${userId}` : 'delgato.cart';
}

function pushItem(items: CartItem[], product: Product, shop: Shop, qty: number): CartItem[] {
  const existing = items.findIndex((i) => i.id === product.id);
  if (existing !== -1) {
    const next = [...items];
    next[existing] = { ...next[existing]!, qty: next[existing]!.qty + qty };
    return next;
  }
  return [
    ...items,
    {
      id: product.id,
      name: product.name,
      sub: product.sub,
      price: product.price,
      qty,
      hue: product.hue,
      shop: shop.name,
      shopId: shop.id,
    },
  ];
}

export const useCartStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...EMPTY_CART_STATE,
      _boundUserId: '',
      addItem: (product, shop, qty = 1) => {
        const current = get().items;
        if (current.length > 0 && current[0]!.shopId && current[0]!.shopId !== shop.id) {
          return {
            ok: false,
            reason: 'conflict',
            existingShop: current[0]!.shop,
            existingShopId: current[0]!.shopId,
          };
        }
        set({ items: pushItem(current, product, shop, qty) });
        return { ok: true };
      },
      forceReplaceWith: (product, shop, qty = 1) =>
        set({
          items: pushItem([], product, shop, qty),
          appliedPromo: null,
        }),
      setItemQty: (id, qty) =>
        set((s) => {
          if (qty <= 0) return { items: s.items.filter((i) => i.id !== id) };
          return {
            items: s.items.map((i) => (i.id === id ? { ...i, qty } : i)),
          };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () =>
        set({ items: [], appliedPromo: null, tip: 0, scheduled: null, deliveryNote: '' }),
      toggleFavorite: (shopId) =>
        set((s) => ({
          favorites: s.favorites.includes(shopId)
            ? s.favorites.filter((x) => x !== shopId)
            : [...s.favorites, shopId],
        })),
      toggleNotify: (productId) => {
        const subscribed = get().notifyList.includes(productId);
        set((s) => ({
          notifyList: subscribed
            ? s.notifyList.filter((x) => x !== productId)
            : [...s.notifyList, productId],
        }));
        return !subscribed;
      },
      replaceWith: (items) => set({ items }),
      setAppliedPromo: (promo) => set({ appliedPromo: promo }),
      setTip: (tip) => set({ tip }),
      setScheduled: (scheduled) => set({ scheduled }),
      setDeliveryNote: (deliveryNote) => set({ deliveryNote }),

      hydrateForUser: async (userId: string) => {
        const key = cartStorageKey(userId);
        try {
          const raw = await zustandAsyncStorage.getItem(key);
          if (raw) {
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            const state = parsed?.state ?? parsed;
            set({
              items: state?.items ?? [],
              favorites: state?.favorites ?? ['abuhassan', 'noor'],
              notifyList: state?.notifyList ?? [],
              appliedPromo: state?.appliedPromo ?? null,
              tip: state?.tip ?? 0,
              scheduled: state?.scheduled ?? null,
              deliveryNote: state?.deliveryNote ?? '',
              _boundUserId: userId,
            });
          } else {
            set({ ...EMPTY_CART_STATE, _boundUserId: userId });
          }
        } catch {
          // Corrupt storage — start fresh for this user
          set({ ...EMPTY_CART_STATE, _boundUserId: userId });
        }
      },

      clearInMemory: () => {
        set({ ...EMPTY_CART_STATE, _boundUserId: '' });
      },
    }),
    {
      name: 'delgato.cart',
      storage: createJSONStorage(() => zustandAsyncStorage),
      // Dynamic key: persist under the bound userId
      // The middleware uses `name` for the key. We override the storage to scope by userId.
      partialize: (s) => ({
        items: s.items,
        favorites: s.favorites,
        notifyList: s.notifyList,
        appliedPromo: s.appliedPromo,
        tip: s.tip,
        scheduled: s.scheduled,
        deliveryNote: s.deliveryNote,
      }),
    },
  ),
);

// Subscribe to persist cart changes under the userId-scoped key
useCartStore.subscribe(
  (state) => {
    if (state._boundUserId) {
      const key = cartStorageKey(state._boundUserId);
      const data = {
        items: state.items,
        favorites: state.favorites,
        notifyList: state.notifyList,
        appliedPromo: state.appliedPromo,
        tip: state.tip,
        scheduled: state.scheduled,
        deliveryNote: state.deliveryNote,
      };
      zustandAsyncStorage.setItem(key, JSON.stringify({ state: data }));
    }
  },
);

export const useCartSubtotal = () =>
  useCartStore((s) => s.items.reduce((acc, i) => acc + i.qty * i.price, 0));
export const useCartCount = () =>
  useCartStore((s) => s.items.reduce((acc, i) => acc + i.qty, 0));
export const useNotifySubscribed = (productId: string) =>
  useCartStore((s) => s.notifyList.includes(productId));
