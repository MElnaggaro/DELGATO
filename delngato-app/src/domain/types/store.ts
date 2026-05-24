import type { Audit, Id, Money, Percent } from './common';

export type HoursDay = {
  readonly closed: boolean;
  readonly open?: string; // "08:00"
  readonly close?: string; // "23:30"
};

export type HoursWeek = {
  readonly sun: HoursDay;
  readonly mon: HoursDay;
  readonly tue: HoursDay;
  readonly wed: HoursDay;
  readonly thu: HoursDay;
  readonly fri: HoursDay;
  readonly sat: HoursDay;
};

export type TempCloseReason =
  | 'no-staff'
  | 'maintenance'
  | 'family-event'
  | 'vacation'
  | 'other';

export type TempCloseInput = {
  readonly reason: TempCloseReason;
  readonly until?: string; // ISODateTime — undefined = indefinite
  readonly note?: string;
};

export type PaymentMethod = 'cash' | 'card' | 'wallet';

export type PaymentMethodPrefs = {
  readonly cash: boolean;
  readonly card: boolean;
  readonly wallet: boolean;
};

export type TaxConfig = {
  readonly enabled: boolean;
  readonly rate: Percent;
  /** true = tax included in displayed prices; false = tax added at checkout */
  readonly inclusive: boolean;
};

export type StoreBrand = {
  readonly bgFrom: string;
  readonly bgTo: string;
  readonly logoUrl?: string;
  readonly coverUrls?: readonly string[];
};

/**
 * A `Store` is the merchant's storefront — what customers browse and order
 * from. One store per merchant in the current product. Field names align with
 * the merchant design reference (`design-reference/app/merchant/data.jsx`).
 */
export type Store = Audit & {
  readonly id: Id;
  readonly merchantId: Id;
  readonly name: string;
  readonly letter: string;
  readonly category: string;
  readonly catKey: string;
  readonly phone: string;
  readonly address: string;
  readonly distance?: string;
  readonly rating: number;
  readonly reviewsCount: number;
  readonly tags: readonly string[];
  readonly bg: StoreBrand;
  readonly desc?: string;
  readonly open: boolean;
  readonly acceptingOrders: boolean;
  readonly prepTimeMin: number;
  readonly deliveryRadiusKm: number;
  readonly hours: HoursWeek;
  readonly tempClose: TempCloseInput | null;
  readonly paymentMethods: PaymentMethodPrefs;
  readonly taxConfig: TaxConfig;
  readonly deliveryFee: Money;
};
