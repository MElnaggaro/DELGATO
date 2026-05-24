import type { Id, Store } from '@/domain/types';
import type { usePlatformStore } from '@/domain/stores/platform';

type State = ReturnType<typeof usePlatformStore.getState>;

export const selectStoreById = (s: State, id: Id): Store | null => s.stores[id] ?? null;

export const selectAllStores = (s: State): readonly Store[] => Object.values(s.stores);

export const selectOpenStores = (s: State): readonly Store[] =>
  Object.values(s.stores).filter((st) => st.open && st.acceptingOrders && !st.tempClose);
