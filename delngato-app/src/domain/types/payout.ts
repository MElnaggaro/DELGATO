import type { Audit, Id, ISODateTime, Money } from './common';

export type PayoutStatus = 'pending' | 'paid' | 'failed';

export type Payout = Audit & {
  readonly id: Id;
  readonly storeId: Id;
  readonly ts: ISODateTime;
  readonly amount: Money;
  readonly bank: string;
  readonly accountMask: string;
  readonly status: PayoutStatus;
  readonly reference?: string;
};

export type NextPayout = {
  readonly storeId: Id;
  readonly amount: Money;
  readonly date: ISODateTime;
  readonly bank: string;
  readonly accountMask: string;
};
