/**
 * Channel name helpers. Mock and WebSocket clients use the identical
 * vocabulary so repository code is transport-agnostic.
 */

import type { Channel } from '@/domain/repositories/common';
import type { Id, Role } from '@/domain/types';

export const channels = {
  ordersByStore: (storeId: Id): Channel => `orders.byStore.${storeId}`,
  ordersByCustomer: (customerId: Id): Channel => `orders.byCustomer.${customerId}`,
  productsByStore: (storeId: Id): Channel => `products.byStore.${storeId}`,
  promotionsByStore: (storeId: Id): Channel => `promotions.byStore.${storeId}`,
  notificationsByUser: (userId: Id, role: Role): Channel =>
    `notifications.byUser.${role}.${userId}`,
  reviewsByStore: (storeId: Id): Channel => `reviews.byStore.${storeId}`,
  store: (storeId: Id): Channel => `stores.${storeId}`,
} as const;
