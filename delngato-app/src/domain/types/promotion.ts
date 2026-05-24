import type { Audit, Id, ISODateTime, Money, Percent } from './common';

export type PromotionKind = 'percent' | 'flat' | 'bogo' | 'combo';

export type PromotionStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'ended';

export type Promotion = Audit & {
  readonly id: Id;
  readonly storeId: Id;
  readonly code: string; // unique per storeId, uppercase alphanumeric
  readonly kind: PromotionKind;
  /** Percent (0–100) for `percent`, Money for `flat`. Ignored for bogo/combo. */
  readonly value: Percent | Money;
  readonly title: string;
  readonly sub: string;
  readonly startsAt: ISODateTime;
  readonly endsAt: ISODateTime;
  readonly cap?: number; // max uses (undefined = unlimited)
  readonly uses: number;
  readonly status: PromotionStatus;
};

export type PromoValidation =
  | { readonly ok: true; readonly promo: Promotion; readonly discount: Money }
  | { readonly ok: false; readonly reason: PromoValidationFailure };

export type PromoValidationFailure =
  | 'not-found'
  | 'expired'
  | 'not-started'
  | 'cap-reached'
  | 'paused'
  | 'wrong-store'
  | 'minimum-not-met';
