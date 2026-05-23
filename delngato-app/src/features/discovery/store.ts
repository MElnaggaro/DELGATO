import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { zustandAsyncStorage } from '@/services/storage';
import { RECENT_SEARCHES } from '@/features/catalog/data';
import { RECENTLY_VIEWED_INITIAL } from './data';

type State = {
  recentlyViewed: string[];
  recentSearches: string[];
};

type Actions = {
  pushRecent: (productId: string) => void;
  pushSearch: (query: string) => void;
  clearSearches: () => void;
  clearRecent: () => void;
};

export const useDiscoveryStore = create<State & Actions>()(
  persist(
    (set) => ({
      recentlyViewed: RECENTLY_VIEWED_INITIAL,
      recentSearches: RECENT_SEARCHES,
      pushRecent: (id) =>
        set((s) => ({
          recentlyViewed: [id, ...s.recentlyViewed.filter((x) => x !== id)].slice(0, 8),
        })),
      pushSearch: (q) => {
        const query = q.trim();
        if (!query) return;
        set((s) => ({
          recentSearches: [query, ...s.recentSearches.filter((x) => x !== query)].slice(0, 6),
        }));
      },
      clearSearches: () => set({ recentSearches: [] }),
      clearRecent: () => set({ recentlyViewed: [] }),
    }),
    {
      name: 'delngato.discovery',
      storage: createJSONStorage(() => zustandAsyncStorage),
    },
  ),
);
