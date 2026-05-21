import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { zustandAsyncStorage } from '@/services/storage';
import type { Address } from '@/services/api/schemas/address';

type State = {
  list: Address[];
  selectedId: string | null;
};

type Actions = {
  setList: (list: Address[]) => void;
  addLocal: (a: Address) => void;
  select: (id: string) => void;
  remove: (id: string) => void;
};

export const useAddressStore = create<State & Actions>()(
  persist(
    (set) => ({
      list: [],
      selectedId: null,
      setList: (list) =>
        set({
          list,
          selectedId: list[0]?.id ?? null,
        }),
      addLocal: (a) =>
        set((s) => ({ list: [a, ...s.list], selectedId: a.id })),
      select: (id) => set({ selectedId: id }),
      remove: (id) =>
        set((s) => {
          const next = s.list.filter((a) => a.id !== id);
          return {
            list: next,
            selectedId: s.selectedId === id ? (next[0]?.id ?? null) : s.selectedId,
          };
        }),
    }),
    {
      name: 'delngato.addresses',
      storage: createJSONStorage(() => zustandAsyncStorage),
    },
  ),
);

export function useSelectedAddress(): Address | null {
  return useAddressStore((s) => {
    if (!s.selectedId) return s.list[0] ?? null;
    return s.list.find((a) => a.id === s.selectedId) ?? s.list[0] ?? null;
  });
}
