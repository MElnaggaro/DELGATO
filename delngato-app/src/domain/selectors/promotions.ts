import type { Id, Promotion } from '@/domain/types';
import type { usePlatformStore } from '@/domain/stores/platform';

type State = ReturnType<typeof usePlatformStore.getState>;

export const selectPromotionById = (s: State, id: Id): Promotion | null =>
  s.promotions[id] ?? null;

export const selectPromotionsByStore = (s: State, storeId: Id): readonly Promotion[] =>
  Object.values(s.promotions).filter((p) => p.storeId === storeId);

export const selectActivePromotions = (s: State): readonly Promotion[] =>
  Object.values(s.promotions).filter((p) => p.status === 'active');

export const selectPromotionByCode = (s: State, code: string): Promotion | null =>
  Object.values(s.promotions).find((p) => p.code.toUpperCase() === code.toUpperCase()) ?? null;
