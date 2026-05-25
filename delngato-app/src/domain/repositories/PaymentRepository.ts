/**
 * PaymentRepository — domain contract for the payment gateway / PSP.
 *
 * Card payments follow an authorize-then-capture model: place a hold at order
 * placement, capture on `order.delivered`, release on `order.cancelled` or
 * `order.rejected`. Refunds operate on a previously captured payment.
 *
 * Wallet payments use `WalletRepository.hold/capture/releaseHold` directly —
 * they do not pass through this repository.
 */

import type { Id, Money } from '@/domain/types';
import type { RequestContext } from './common';

export type PaymentAuthRef = string;

export type PaymentAuth = {
  readonly ref: PaymentAuthRef;
  readonly amount: Money;
  /** The order or order-draft this authorization is reserved for. */
  readonly orderRef: Id;
  readonly createdAt: string;
  readonly capturedAt?: string;
  readonly releasedAt?: string;
  readonly refundedAt?: string;
  readonly status: 'authorized' | 'captured' | 'released' | 'failed' | 'refunded';
};

export type CardTokenizedInput = {
  /**
   * Opaque token returned by the card form / PSP SDK. The card form NEVER
   * passes raw PAN/CVV/expiry through this interface — those go to the PSP
   * tokenization endpoint directly.
   */
  readonly cardToken: string;
};

export interface PaymentRepository {
  /**
   * Authorize and hold funds. The implementation may decline; on decline the
   * promise rejects with a `ValidationError` carrying `{ payment: <reason> }`.
   *
   * Mock: configurable success/decline via `MOCK_PAYMENT_FAIL_RATE`. Returns a
   * deterministic ref derived from `(orderRef, amount)` so retries within the
   * same place-order attempt are idempotent.
   */
  authorize(
    input: CardTokenizedInput,
    amount: Money,
    orderRef: Id,
    ctx?: RequestContext,
  ): Promise<PaymentAuth>;

  /** Settle a previously authorized payment. Called by the system on delivery. */
  capture(ref: PaymentAuthRef, ctx?: RequestContext): Promise<PaymentAuth>;

  /** Reverse a hold without charging. Idempotent. */
  release(ref: PaymentAuthRef, ctx?: RequestContext): Promise<void>;

  /**
   * Refund a captured payment. Amount must be ≤ original captured amount.
   * Partial refunds are allowed (multiple refunds against the same ref sum
   * to ≤ original).
   */
  refund(ref: PaymentAuthRef, amount: Money, ctx?: RequestContext): Promise<PaymentAuth>;
}
