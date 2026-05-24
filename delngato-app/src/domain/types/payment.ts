import type { Audit, Id, Money } from './common';
import type { PaymentMethod } from './store';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type Payment = Audit & {
  readonly id: Id;
  readonly orderId: Id;
  readonly method: PaymentMethod;
  readonly amount: Money;
  readonly status: PaymentStatus;
  readonly txRef?: string;
};
