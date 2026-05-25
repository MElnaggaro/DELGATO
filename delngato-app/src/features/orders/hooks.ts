/**
 * Order & Notification hooks.
 *
 * Phase 2: replace legacy `useOrdersStore` with domain-backed reads from
 * the platform store.  Actions (cancel, refund) still go through the
 * order repository; only reads move to selectors.
 *
 * IMPORTANT: these hooks are the ONLY way UI screens should read orders and
 * notifications.  The legacy `useOrdersStore` is deprecated and will be
 * deleted once all consumers are migrated.
 */

import { useMemo, useCallback } from 'react';
import { usePlatformStore } from '@/domain/stores/platform';
import {
  selectOrdersByCustomer,
  selectLiveOrdersByCustomer,
  LIVE_STATUSES,
  DONE_STATUSES,
  FAILED_STATUSES,
} from '@/domain/selectors/orders';
import type { Id, Order, OrderStatus, Notification } from '@/domain/types';

// ─── Display adaptors ─────────────────────────────────────────────────

export type OrderDisplayStatus = 'live' | 'done' | 'cancelled';

/** Map domain OrderStatus to the 3-state display status the UI tabs use. */
export function toDisplayStatus(status: OrderStatus): OrderDisplayStatus {
  if (LIVE_STATUSES.includes(status)) return 'live';
  if (DONE_STATUSES.includes(status)) return 'done';
  return 'cancelled'; // rejected + cancelled
}

const STATUS_TEXT: Record<OrderStatus, string> = {
  payment_pending: 'في انتظار الدفع',
  new: 'في انتظار المحل',
  accepted: 'المحل قبل الطلب',
  preparing: 'يتم التحضير',
  ready: 'جاهز للاستلام',
  picked: 'في الطريق إليك',
  delivered: 'تم التوصيل',
  rejected: 'المحل رفض',
  cancelled: 'متلغي',
};

/** Human-readable Arabic status text. */
export function statusText(status: OrderStatus): string {
  return STATUS_TEXT[status] ?? status;
}

const STATUS_STEP: Record<OrderStatus, 0 | 1 | 2 | 3> = {
  payment_pending: 0,
  new: 0,
  accepted: 1,
  preparing: 1,
  ready: 2,
  picked: 2,
  delivered: 3,
  rejected: 0,
  cancelled: 0,
};

/** 0–3 step indicator for the order progress stepper. */
export function statusStep(status: OrderStatus): 0 | 1 | 2 | 3 {
  return STATUS_STEP[status] ?? 0;
}

// ─── Hooks ────────────────────────────────────────────────────────────

/** All orders for a customer, sorted newest-first. */
export function useCustomerOrders(customerId: Id | undefined) {
  const ordersMap = usePlatformStore((s) => s.orders);
  return useMemo(() => {
    if (!customerId) return [];
    return Object.values(ordersMap)
      .filter((o) => o.customerId === customerId)
      .sort((a, b) => (b.placedAt > a.placedAt ? 1 : -1));
  }, [ordersMap, customerId]);
}

/** Live (in-progress) orders for a customer. */
export function useLiveOrders(customerId: Id | undefined) {
  const ordersMap = usePlatformStore((s) => s.orders);
  return useMemo(() => {
    if (!customerId) return [];
    return Object.values(ordersMap).filter(
      (o) => o.customerId === customerId && LIVE_STATUSES.includes(o.status)
    );
  }, [ordersMap, customerId]);
}

/** Single order by ID from platform store. */
export function useOrderDetail(orderId: Id | undefined): Order | null {
  return usePlatformStore(
    useCallback((s) => (orderId ? s.orders[orderId] ?? null : null), [orderId]),
  );
}

/** Store name lookup helper — returns store name for a given storeId. */
export function useStoreName(storeId: Id | undefined): string {
  return usePlatformStore(
    useCallback((s) => (storeId ? s.stores[storeId]?.name ?? '' : ''), [storeId]),
  );
}

/** Store letter lookup helper. */
export function useStoreLetter(storeId: Id | undefined): string {
  return usePlatformStore(
    useCallback((s) => (storeId ? s.stores[storeId]?.letter ?? '' : ''), [storeId]),
  );
}

// ─── Notifications ────────────────────────────────────────────────────

/** All notifications for a user, sorted newest-first. */
export function useNotifications(userId: Id | undefined) {
  const notificationsMap = usePlatformStore((s) => s.notifications);
  return useMemo(() => {
    if (!userId) return [];
    return Object.values(notificationsMap)
      .filter((n) => n.userId === userId)
      .sort((a, b) => (b.ts > a.ts ? 1 : -1));
  }, [notificationsMap, userId]);
}

/** Unread notification count. */
export function useUnreadCount(userId: Id | undefined): number {
  const notificationsMap = usePlatformStore((s) => s.notifications);
  return useMemo(() => {
    if (!userId) return 0;
    return Object.values(notificationsMap).filter((n) => n.userId === userId && !n.read).length;
  }, [notificationsMap, userId]);
}

/** Mark a single notification as read (mutates platform store directly). */
export function useMarkNotificationRead() {
  const apply = usePlatformStore((s) => s.applyNotification);
  return useCallback(
    (n: Notification) => apply({ ...n, read: true }),
    [apply],
  );
}

/** Mark all notifications as read for a user. */
export function useMarkAllRead(userId: Id | undefined) {
  const applyBatch = usePlatformStore((s) => s.applyBatch);
  const notifications = useNotifications(userId);
  return useCallback(() => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    applyBatch({ notifications: unread.map((n) => ({ ...n, read: true })) });
  }, [notifications, applyBatch]);
}
