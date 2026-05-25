/**
 * Discovery hooks — customer-facing data access via platform store selectors.
 *
 * These hooks replace all direct imports of `features/catalog/data` constants
 * (SHOPS, PRODUCTS, CATEGORIES, etc.) with reactive reads from the seeded
 * platform store. The underlying data is identical; only the access pattern
 * changes.
 *
 * Domain types (`Store`, `Product`, `Promotion`, `Review`) are used throughout.
 * UI screens must adapt from the legacy `Shop` / catalog types to these domain
 * shapes during migration.
 */

import { useMemo } from 'react';
import { usePlatformStore } from '@/domain/stores/platform';
import type { Id, Product, Promotion, Review, Store } from '@/domain/types';

// ─── Store hooks ────────────────────────────────────────────────────────────

/** All stores (open + closed). */
export function useAllStores(): readonly Store[] {
  const storesMap = usePlatformStore((s) => s.stores);
  return useMemo(() => Object.values(storesMap), [storesMap]);
}

/** Only stores that are open, accepting orders, and not temp-closed. */
export function useOpenStores(): readonly Store[] {
  const storesMap = usePlatformStore((s) => s.stores);
  return useMemo(
    () => Object.values(storesMap).filter((st) => st.open && st.acceptingOrders && !st.tempClose),
    [storesMap],
  );
}

/** Filter stores by catKey. Returns all if catKey is 'all'. */
export function useStoresByCategory(catKey: string): readonly Store[] {
  const storesMap = usePlatformStore((s) => s.stores);
  return useMemo(() => {
    const all = Object.values(storesMap);
    return catKey === 'all' ? all : all.filter((s) => s.catKey === catKey);
  }, [storesMap, catKey]);
}

/** Featured stores (tagged 'عرض اليوم' or 'الأكثر طلباً'). */
export function useFeaturedStores(): readonly Store[] {
  const storesMap = usePlatformStore((s) => s.stores);
  return useMemo(() => {
    const all = Object.values(storesMap);
    return all.filter((s) => s.tags.length > 0);
  }, [storesMap]);
}

/** Single store by ID. */
export function useStoreDetail(id: Id | undefined): Store | null {
  const storesMap = usePlatformStore((s) => s.stores);
  return useMemo(() => (id ? storesMap[id] ?? null : null), [storesMap, id]);
}

// ─── Product hooks ──────────────────────────────────────────────────────────

/** All products for a given store. */
export function useProductsByStore(storeId: Id | undefined): readonly Product[] {
  const productsMap = usePlatformStore((s) => s.products);
  return useMemo(() => {
    if (!storeId) return [];
    return Object.values(productsMap).filter((p) => p.storeId === storeId);
  }, [productsMap, storeId]);
}

/** Available products for a store (excludes archived + out of stock). */
export function useAvailableProducts(storeId: Id | undefined): readonly Product[] {
  const productsMap = usePlatformStore((s) => s.products);
  return useMemo(() => {
    if (!storeId) return [];
    return Object.values(productsMap).filter(
      (p) => p.storeId === storeId && p.availability !== 'archived' && p.availability !== 'out'
    );
  }, [productsMap, storeId]);
}

/** Single product by ID. */
export function useProductDetail(id: Id | undefined): Product | null {
  const productsMap = usePlatformStore((s) => s.products);
  return useMemo(() => (id ? productsMap[id] ?? null : null), [productsMap, id]);
}

/** All products across all stores (for search). */
export function useAllProducts(): readonly Product[] {
  const productsMap = usePlatformStore((s) => s.products);
  return useMemo(() => Object.values(productsMap), [productsMap]);
}

// ─── Promotion / Deal hooks ─────────────────────────────────────────────────

/** All active promotions across all stores. */
export function useActivePromotions(): readonly Promotion[] {
  const promosMap = usePlatformStore((s) => s.promotions);
  return useMemo(() => Object.values(promosMap).filter((p) => p.status === 'active'), [promosMap]);
}

/** Promotions for a specific store. */
export function usePromotionsByStore(storeId: Id | undefined): readonly Promotion[] {
  const promosMap = usePlatformStore((s) => s.promotions);
  return useMemo(() => {
    if (!storeId) return [];
    return Object.values(promosMap).filter((p) => p.storeId === storeId);
  }, [promosMap, storeId]);
}

// ─── Review hooks ───────────────────────────────────────────────────────────

/** Reviews for a specific store, sorted newest first. */
export function useReviewsByStore(storeId: Id | undefined): readonly Review[] {
  const reviewsMap = usePlatformStore((s) => s.reviews);
  return useMemo(() => {
    if (!storeId) return [];
    return Object.values(reviewsMap)
      .filter((r) => r.storeId === storeId)
      .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  }, [reviewsMap, storeId]);
}

// ─── Category helpers ───────────────────────────────────────────────────────

/**
 * Customer-facing category list.
 *
 * Categories in the domain model are store-scoped (for merchant catalog
 * management). For the customer home screen, we derive a flat list from the
 * unique `catKey` values across all stores, preserving the design-reference
 * ordering.
 */
export type CustomerCategory = {
  readonly key: string;
  readonly label: string;
  readonly icon?: 'store' | 'pill' | 'utensils' | 'cookie' | 'leaf';
};

const CATEGORY_MAP: Record<string, CustomerCategory> = {
  all: { key: 'all', label: 'الكل' },
  grocery: { key: 'grocery', label: 'بقالة', icon: 'store' },
  pharmacy: { key: 'pharmacy', label: 'صيدلية', icon: 'pill' },
  food: { key: 'food', label: 'أكل', icon: 'utensils' },
  sweets: { key: 'sweets', label: 'حلويات', icon: 'cookie' },
  produce: { key: 'produce', label: 'خضار وفاكهة', icon: 'leaf' },
};

const CUSTOMER_CATEGORIES: readonly CustomerCategory[] = Object.values(CATEGORY_MAP);

/** Static customer-facing category list (matches design reference). */
export function useCustomerCategories(): readonly CustomerCategory[] {
  return CUSTOMER_CATEGORIES;
}

// ─── Search helpers ─────────────────────────────────────────────────────────

/** Search stores + products by query string. */
export function useSearch(query: string) {
  const storesMap = usePlatformStore((s) => s.stores);
  const productsMap = usePlatformStore((s) => s.products);

  return useMemo(() => {
    if (!query || query.length < 2) return { stores: [] as Store[], products: [] as Product[] };
    const q = query.toLowerCase();
    const stores = Object.values(storesMap);
    const products = Object.values(productsMap);
    return {
      stores: stores.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)),
      ),
      products: products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sub.toLowerCase().includes(q),
      ),
    };
  }, [storesMap, productsMap, query]);
}
