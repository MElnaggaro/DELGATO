import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { zustandAsyncStorage } from '@/services/storage';
import { NOTIFICATIONS, ORDERS_HISTORY, type Notification, type OrderHistory } from '@/features/catalog/data';

type State = {
  orders: OrderHistory[];
  notifications: Notification[];
  hydrated: boolean;
};

type Actions = {
  addOrder: (order: OrderHistory) => void;
  setOrders: (orders: OrderHistory[]) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
};

export const useOrdersStore = create<State & Actions>()(
  persist(
    (set) => ({
      orders: ORDERS_HISTORY,
      notifications: NOTIFICATIONS,
      hydrated: false,
      addOrder: (order) =>
        set((s) => ({ orders: [order, ...s.orders.filter((o) => o.id !== order.id)] })),
      setOrders: (orders) => set({ orders }),
      markAllNotificationsRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'delngato.orders',
      storage: createJSONStorage(() => zustandAsyncStorage),
    },
  ),
);
