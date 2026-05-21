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

type State = {
  items: CartItem[];
  favorites: string[];
};

type Actions = {
  addItem: (product: Product, shop: Shop, qty?: number) => void;
  setItemQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  toggleFavorite: (shopId: string) => void;
  replaceWith: (items: CartItem[]) => void;
};

export const useCartStore = create<State & Actions>()(
  persist(
    (set) => ({
      items: [],
      favorites: ['abuhassan', 'noor'],
      addItem: (product, shop, qty = 1) =>
        set((s) => {
          const existing = s.items.findIndex((i) => i.id === product.id);
          if (existing !== -1) {
            const next = [...s.items];
            next[existing] = { ...next[existing]!, qty: next[existing]!.qty + qty };
            return { items: next };
          }
          return {
            items: [
              ...s.items,
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
            ],
          };
        }),
      setItemQty: (id, qty) =>
        set((s) => {
          if (qty <= 0) return { items: s.items.filter((i) => i.id !== id) };
          return {
            items: s.items.map((i) => (i.id === id ? { ...i, qty } : i)),
          };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      toggleFavorite: (shopId) =>
        set((s) => ({
          favorites: s.favorites.includes(shopId)
            ? s.favorites.filter((x) => x !== shopId)
            : [...s.favorites, shopId],
        })),
      replaceWith: (items) => set({ items }),
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
