import type { Audit, Id, ISODateTime, Money } from './common';
import type { PaymentMethod } from './store';

export type Wallet = Audit & {
  readonly id: Id;
  readonly userId: Id;
  readonly balance: Money;
  readonly points: number;
  readonly cashbackThisMonth: Money;
};

export type WalletTxKind = 'in' | 'out';

export type WalletTx = {
  readonly id: Id;
  readonly walletId: Id;
  readonly userId: Id;
  readonly kind: WalletTxKind;
  readonly title: string;
  readonly ts: ISODateTime;
  readonly amount: Money;
  readonly orderId?: Id;
  readonly createdAt: ISODateTime;
  readonly version: number;
};

export type TopUpInput = {
  readonly userId: Id;
  readonly amount: Money;
  readonly method: PaymentMethod;
};
