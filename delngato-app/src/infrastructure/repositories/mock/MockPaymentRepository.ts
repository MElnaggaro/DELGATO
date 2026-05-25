/**
 * In-memory mock of the PaymentRepository.
 *
 * Behavior:
 *  - `authorize` returns a deterministic ref keyed on (orderRef, amount) so
 *    retries are idempotent inside a single place-order attempt.
 *  - `MOCK_PAYMENT_FAIL_RATE` (0..1, default 0) decides whether the mock
 *    rejects with a ValidationError. Set per env via
 *    `EXPO_PUBLIC_MOCK_PAYMENT_FAIL_RATE` to exercise the failure path.
 *  - State is held in-memory only; restarts the auth ledger on cold start.
 *  - Emits no domain events directly. The caller (checkout / order pipeline)
 *    sequences `PaymentRepository.authorize → OrderRepository.place` and
 *    interprets the auth ref as part of the order.
 */

import type {
  CardTokenizedInput,
  PaymentAuth,
  PaymentAuthRef,
  PaymentRepository,
} from '@/domain/repositories';
import type { Id, Money } from '@/domain/types';
import { ConflictError, NotFoundError, ValidationError } from '@/domain/errors';

import type { LatencyEngine } from '@/infrastructure/seed/LatencyEngine';
import { nowISO } from './_support';

export class MockPaymentRepository implements PaymentRepository {
  private readonly auths = new Map<PaymentAuthRef, PaymentAuth>();
  /** Sum of refunds already issued per ref, to enforce ≤ original. */
  private readonly refundedSums = new Map<PaymentAuthRef, Money>();

  constructor(
    private readonly latency: LatencyEngine,
    private readonly failRate: number = 0,
  ) {}

  async authorize(
    input: CardTokenizedInput,
    amount: Money,
    orderRef: Id,
  ): Promise<PaymentAuth> {
    await this.latency.sleep('auth');
    if (amount <= 0) throw new ValidationError({ amount: 'لازم رقم موجب' });
    if (!input.cardToken || input.cardToken.length < 6) {
      throw new ValidationError({ payment: 'بيانات البطاقة غير صالحة' });
    }

    // Deterministic ref keyed by (orderRef, amount). Reauth with the same
    // tuple returns the existing record so double-tap is idempotent.
    const ref: PaymentAuthRef = `auth-${orderRef}-${amount}`;
    const existing = this.auths.get(ref);
    if (existing) {
      if (existing.status === 'authorized' || existing.status === 'captured') return existing;
    }

    if (this.failRate > 0 && Math.random() < this.failRate) {
      throw new ValidationError({ payment: 'تم رفض الدفع — جرّب بطاقة تانية' });
    }

    const auth: PaymentAuth = {
      ref,
      amount,
      orderRef,
      createdAt: nowISO(),
      status: 'authorized',
    };
    this.auths.set(ref, auth);
    return auth;
  }

  async capture(ref: PaymentAuthRef): Promise<PaymentAuth> {
    await this.latency.sleep('write');
    const auth = this.auths.get(ref);
    if (!auth) throw new NotFoundError('PaymentAuth', ref);
    if (auth.status === 'captured') return auth;
    if (auth.status !== 'authorized') {
      throw new ConflictError('payment-not-capturable', `Cannot capture from ${auth.status}`);
    }
    const next: PaymentAuth = { ...auth, status: 'captured', capturedAt: nowISO() };
    this.auths.set(ref, next);
    return next;
  }

  async release(ref: PaymentAuthRef): Promise<void> {
    await this.latency.sleep('write');
    const auth = this.auths.get(ref);
    if (!auth) return; // idempotent
    if (auth.status === 'released' || auth.status === 'failed') return;
    if (auth.status === 'captured') {
      throw new ConflictError('payment-captured', 'Cannot release a captured payment — refund instead');
    }
    const next: PaymentAuth = { ...auth, status: 'released', releasedAt: nowISO() };
    this.auths.set(ref, next);
  }

  async refund(ref: PaymentAuthRef, amount: Money): Promise<PaymentAuth> {
    await this.latency.sleep('write');
    const auth = this.auths.get(ref);
    if (!auth) throw new NotFoundError('PaymentAuth', ref);
    if (auth.status !== 'captured' && auth.status !== 'refunded') {
      throw new ConflictError('payment-not-refundable', `Cannot refund from ${auth.status}`);
    }
    if (amount <= 0) throw new ValidationError({ amount: 'لازم رقم موجب' });
    const already = this.refundedSums.get(ref) ?? 0;
    if (already + amount > auth.amount) {
      throw new ValidationError({ amount: 'المبلغ يتجاوز قيمة الدفع' });
    }
    const nextTotal = already + amount;
    this.refundedSums.set(ref, nextTotal);
    const next: PaymentAuth = {
      ...auth,
      status: nextTotal === auth.amount ? 'refunded' : 'captured',
      refundedAt: nowISO(),
    };
    this.auths.set(ref, next);
    return next;
  }
}
