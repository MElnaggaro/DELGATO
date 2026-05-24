/**
 * Closed event vocabulary. Add events here when a new business situation
 * needs side-effects (toast, haptic, notification, analytics). Never use
 * events to carry canonical state — that's what the platformStore is for.
 */

import type { Id, Role } from '@/domain/types';

export type DomainEvent =
  // Orders
  | { type: 'order.placed'; orderId: Id; storeId: Id; customerId: Id }
  | { type: 'order.accepted'; orderId: Id }
  | { type: 'order.rejected'; orderId: Id; reason: string }
  | { type: 'order.preparing.started'; orderId: Id }
  | { type: 'order.ready'; orderId: Id }
  | { type: 'order.handed-over'; orderId: Id; driverId: Id; driverName: string }
  | { type: 'order.delivered'; orderId: Id }
  | { type: 'order.cancelled'; orderId: Id; reason: string; byRole: Role | 'system' }
  | { type: 'order.issue-reported'; orderId: Id; category: string; description: string }

  // Products
  | { type: 'product.created'; productId: Id; storeId: Id }
  | { type: 'product.updated'; productId: Id; changedFields: readonly string[] }
  | { type: 'product.availability'; productId: Id; from: string; to: string }
  | { type: 'product.archived'; productId: Id }
  | { type: 'product.stock-changed'; productId: Id; from: number; to: number }

  // Promotions
  | { type: 'promotion.created'; promoId: Id; storeId: Id }
  | { type: 'promotion.updated'; promoId: Id }
  | { type: 'promotion.activated'; promoId: Id }
  | { type: 'promotion.paused'; promoId: Id }
  | { type: 'promotion.ended'; promoId: Id }

  // Store ops
  | { type: 'store.open-toggled'; storeId: Id; open: boolean }
  | { type: 'store.accepting-toggled'; storeId: Id; accepting: boolean }
  | { type: 'store.hours-changed'; storeId: Id }
  | { type: 'store.prep-time-changed'; storeId: Id; prepTimeMin: number }
  | { type: 'store.delivery-radius'; storeId: Id; radiusKm: number }
  | { type: 'store.temp-closed'; storeId: Id; reason: string; until?: string }
  | { type: 'store.temp-reopened'; storeId: Id }

  // Reviews
  | { type: 'review.created'; reviewId: Id; storeId: Id }
  | { type: 'review.responded'; reviewId: Id }

  // Wallet
  | { type: 'wallet.topped-up'; userId: Id; amount: number }
  | { type: 'wallet.charged'; userId: Id; amount: number; orderId?: Id }

  // Notifications
  | { type: 'notification.created'; notificationId: Id; userId: Id }

  // Auth / role
  | { type: 'auth.session-started'; role: Role }
  | { type: 'auth.session-ended'; role: Role }
  | { type: 'role.switched'; from: Role | null; to: Role };

export type EventType = DomainEvent['type'];

export type EventHandler<E extends DomainEvent = DomainEvent> = (event: E) => void | Promise<void>;
