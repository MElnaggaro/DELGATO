import type { Audit, Id, ISODateTime, Money, Quantity, Role } from './common';
import type { PaymentMethod } from './store';
import type { CartItemModifierSelection } from './cart';

/**
 * Canonical order lifecycle.
 *
 * `payment_pending` — pre-merchant state. The customer placed the order with a
 * non-cash payment that is being authorized/held. On success the order moves
 * to `new` (with-merchant); on failure to `cancelled`. Cash orders skip this
 * state entirely and start at `new`.
 *
 * NOTE: the canonical spec uses `pending` for the with-merchant state; this
 * codebase predates the spec and uses `new`. Names left unreconciled
 * deliberately — renaming `new` would require touching every selector,
 * mock seed entry, and UI label. The semantic distinction is preserved by
 * the new `payment_pending` value.
 */
export type OrderStatus =
  | 'payment_pending'
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'picked'
  | 'delivered'
  | 'rejected'
  | 'cancelled';

export type OrderItem = {
  readonly productId: Id;
  readonly name: string;
  readonly sub?: string;
  readonly qty: Quantity;
  readonly unitPrice: Money;
  readonly modifiers?: readonly CartItemModifierSelection[];
  readonly subtotal: Money;
};

export type TimelineEntry = {
  readonly ts: ISODateTime;
  readonly status: OrderStatus;
  readonly byRole: Role | 'system';
  readonly byUserId?: Id;
  readonly note?: string;
};

export type Order = Audit & {
  readonly id: Id;
  readonly storeId: Id;
  readonly customerId: Id;
  readonly placedAt: ISODateTime;
  readonly status: OrderStatus;
  readonly items: readonly OrderItem[];
  readonly subtotal: Money;
  readonly deliveryFee: Money;
  readonly tip: Money;
  readonly discount: Money;
  readonly total: Money;
  readonly merchantShare: Money;
  readonly payment: PaymentMethod;
  readonly paymentRef?: string;
  readonly address: string;
  readonly distanceKm: number;
  readonly customerName: string;
  readonly customerPhone: string;
  readonly driverId?: Id;
  readonly driverName?: string;
  readonly note?: string;
  /**
   * Countdown in seconds. Owned by the realtime client (decrements during
   * `new`, `accepted`, and `preparing`). Not authoritative as wall-clock time
   * elapsed — the realtime layer is the source.
   */
  readonly timerSec: number;
  readonly rejectionReason?: string;
  readonly cancellationReason?: string;
  readonly timeline: readonly TimelineEntry[];
};

export type OrderFilter = {
  readonly status?: readonly OrderStatus[];
  readonly from?: ISODateTime;
  readonly to?: ISODateTime;
  readonly search?: string;
};

export type PlaceOrderInput = {
  readonly storeId: Id;
  readonly customerId: Id;
  readonly items: readonly OrderItem[];
  readonly subtotal: Money;
  readonly deliveryFee: Money;
  readonly tip: Money;
  readonly discount: Money;
  readonly payment: PaymentMethod;
  readonly paymentRef?: string;
  readonly address: string;
  readonly distanceKm: number;
  readonly customerName: string;
  readonly customerPhone: string;
  readonly note?: string;
  readonly promoCode?: string;
  readonly idempotencyKey?: string;
};

export type IssueReportCategory =
  | 'item-out'
  | 'wrong-address'
  | 'customer-unreachable'
  | 'delay'
  | 'damage'
  | 'other';

export type IssueReport = {
  readonly category: IssueReportCategory;
  readonly description: string;
};
