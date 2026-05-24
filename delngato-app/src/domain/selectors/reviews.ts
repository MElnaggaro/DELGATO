import type { Id, Review } from '@/domain/types';
import type { usePlatformStore } from '@/domain/stores/platform';

type State = ReturnType<typeof usePlatformStore.getState>;

export const selectReviewsByStore = (s: State, storeId: Id): readonly Review[] =>
  Object.values(s.reviews)
    .filter((r) => r.storeId === storeId)
    .sort((a, b) => (a.ts < b.ts ? 1 : -1));

export const selectUnrespondedReviews = (s: State, storeId: Id): readonly Review[] =>
  selectReviewsByStore(s, storeId).filter((r) => r.response === null);
