import type { Id, Product } from '@/domain/types';
import type { usePlatformStore } from '@/domain/stores/platform';

type State = ReturnType<typeof usePlatformStore.getState>;

export const selectProductById = (s: State, id: Id): Product | null =>
  s.products[id] ?? null;

export const selectProductsByStore = (s: State, storeId: Id): readonly Product[] =>
  Object.values(s.products).filter((p) => p.storeId === storeId);

export const selectAvailableProductsByStore = (
  s: State,
  storeId: Id,
): readonly Product[] =>
  Object.values(s.products).filter(
    (p) => p.storeId === storeId && p.availability !== 'archived' && p.availability !== 'out',
  );

export const selectAllProducts = (s: State): readonly Product[] => Object.values(s.products);
