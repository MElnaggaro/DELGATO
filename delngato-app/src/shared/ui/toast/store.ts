import { create } from 'zustand';
import type { ReactNode } from 'react';

export type ToastEntry = {
  id: string;
  msg: string;
  icon?: ReactNode;
};

type State = {
  current: ToastEntry | null;
  queue: ToastEntry[];
};

type Actions = {
  show: (msg: string, icon?: ReactNode) => void;
  dismiss: () => void;
};

export const useToastStore = create<State & Actions>((set, get) => ({
  current: null,
  queue: [],
  show: (msg, icon) => {
    const entry: ToastEntry = { id: 't' + Date.now() + Math.random().toString(36).slice(2, 6), msg, icon };
    const { current } = get();
    if (current) {
      set((s) => ({ queue: [...s.queue, entry] }));
    } else {
      set({ current: entry });
    }
  },
  dismiss: () => {
    const { queue } = get();
    if (queue.length > 0) {
      set({ current: queue[0]!, queue: queue.slice(1) });
    } else {
      set({ current: null });
    }
  },
}));

/** Imperative helper for use outside React. */
export const showToast = (msg: string, icon?: ReactNode) => {
  useToastStore.getState().show(msg, icon);
};
