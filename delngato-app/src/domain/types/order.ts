import type { Audit, Id, ISODateTime, Money, Quantity, Role } from './common';
import type { PaymentMethod } from './store';
import type { CartItemModifierSelection } from './cart';

export type OrderStatus =
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
  readonly address: string;
  readonly distanceKm: number;
  readonly customerName: string;
  readonly customerPhone: string;
  readonly note?: string;
  readonly promoCode?: string;
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
