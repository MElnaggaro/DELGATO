import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { zustandAsyncStorage } from '@/services/storage';
import { NOTIFICATIONS, ORDERS_HISTORY, type Notification, type OrderHistory } from '@/features/catalog/data';

export type RefundRequest = {
  id: string;
  orderId: string;
  items: string[];
  reason: string;
  photos: number;
  date: string;
};

type State = {
  orders: OrderHistory[];
  notifications: Notification[];
  refundRequests: RefundRequest[];
  hydrated: boolean;
};

type Actions = {
  addOrder: (order: OrderHistory) => void;
  setOrders: (orders: OrderHistory[]) => void;
  cancelOrder: (id: string, reason?: string) => void;
  requestRefund: (
    orderId: string,
    items: string[],
    reason: string,
    photos: number,
  ) => RefundRequest;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
};

export const useOrdersStore = create<State & Actions>()(
  persist(
    (set) => ({
      orders: ORDERS_HISTORY,
      notifications: NOTIFICATIONS,
      refundRequests: [],
      hydrated: false,
      addOrder: (order) =>
        set((s) => ({ orders: [order, ...s.orders.filter((o) => o.id !== order.id)] })),
      setOrders: (orders) => set({ orders }),
      cancelOrder: (id, _reason) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, status: 'cancelled', statusText: 'متلغي', step: 0 } : o,
          ),
        })),
      requestRefund: (orderId, items, reason, photos) => {
        const refund: RefundRequest = {
          id: 'RFD-' + Math.floor(Math.random() * 9000 + 1000).toString().replace(/[0-9]/g, (n) => '٠١٢٣٤٥٦٧٨٩'[Number(n)]!),
          orderId,
          items,
          reason,
          photos,
          date: 'دلوقتي',
        };
        set((s) => ({ refundRequests: [refund, ...s.refundRequests] }));
        return refund;
      },
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
