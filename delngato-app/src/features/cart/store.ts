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
  appliedPromo: AppliedPromo | null;
  tip: number;
  scheduled: ScheduledSlot | null;
  deliveryNote: string;
};

type Actions = {
  addItem: (product: Product, shop: Shop, qty?: number) => AddItemResult;
  setItemQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  forceReplaceWith: (product: Product, shop: Shop, qty?: number) => void;
  toggleFavorite: (shopId: string) => void;
  replaceWith: (items: CartItem[]) => void;
  setAppliedPromo: (promo: AppliedPromo | null) => void;
  setTip: (tip: number) => void;
  setScheduled: (slot: ScheduledSlot | null) => void;
  setDeliveryNote: (note: string) => void;
};

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
      items: [],
      favorites: ['abuhassan', 'noor'],
      appliedPromo: null,
      tip: 0,
      scheduled: null,
      deliveryNote: '',
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
      replaceWith: (items) => set({ items }),
      setAppliedPromo: (promo) => set({ appliedPromo: promo }),
      setTip: (tip) => set({ tip }),
      setScheduled: (scheduled) => set({ scheduled }),
      setDeliveryNote: (deliveryNote) => set({ deliveryNote }),
    }),
    {
      name: 'delngato.cart',
      storage: createJSONStorage(() => zustandAsyncStorage),
    },
  ),
);

export const useCartSubtotal = () =>
  useCartStore((s) => s.items.reduce((acc, i) => acc + i.qty * i.price, 0));
export const useCartCount = () =>
  useCartStore((s) => s.items.reduce((acc, i) => acc + i.qty, 0));
