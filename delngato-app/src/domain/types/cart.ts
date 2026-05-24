import type { Id, ISODateTime, Money, Quantity } from './common';

export type CartItemModifierSelection = {
  readonly groupId: Id;
  readonly optionIds: readonly Id[];
};

export type CartItem = {
  readonly productId: Id;
  readonly qty: Quantity;
  readonly modifiers?: readonly CartItemModifierSelection[];
  readonly note?: string;
  /**
   * The product price at the moment it was added to the cart. Used by
   * `useCartLineStatus` to detect merchant-side price changes after add.
   */
  readonly capturedPrice: Money;
  /**
   * The product version at add-time. Compared against live product version
   * to detect any meaningful change.
   */
  readonly capturedVersion: number;
};

export type ScheduledSlot = {
  readonly date: string; // ISODate
  readonly slot: string; // human label, e.g. "٧–٩ م"
};

export type Cart = {
  readonly customerId: Id;
  readonly storeId: Id | null;
  readonly items: readonly CartItem[];
  readonly appliedPromoCode?: string;
  readonly tip: Money;
  readonly scheduled: ScheduledSlot | null;
  readonly deliveryNote: string;
  readonly updatedAt: ISODateTime;
};
