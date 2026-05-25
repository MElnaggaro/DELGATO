import type { Id, Money, TopUpInput, Wallet, WalletTx } from '@/domain/types';
import type { RequestContext } from './common';

/**
 * Opaque hold identifier returned by `hold()` and consumed by `capture()` /
 * `releaseHold()`. Caller stores it on the draft order so the wallet impl can
 * find it later without needing the (userId, amount) tuple.
 */
export type WalletHoldId = string;

export type WalletHold = {
  readonly id: WalletHoldId;
  readonly userId: Id;
  readonly amount: Money;
  /** Optional reference (typically an orderId). */
  readonly ref?: Id;
  readonly createdAt: string;
};

export interface WalletRepository {
  forUser(userId: Id, ctx?: RequestContext): Promise<Wallet>;
  history(userId: Id, ctx?: RequestContext): Promise<readonly WalletTx[]>;
  topUp(input: TopUpInput, ctx?: RequestContext): Promise<WalletTx>;
  charge(userId: Id, amount: Money, orderId?: Id, ctx?: RequestContext): Promise<WalletTx>;

  /**
   * Reserve funds for a pending order. Reduces available balance (but not raw
   * balance) until `capture()` settles it or `releaseHold()` reverses it.
   * Throws ValidationError if available balance is insufficient.
   */
  hold(userId: Id, amount: Money, ref?: Id, ctx?: RequestContext): Promise<WalletHold>;

  /** Settle a hold into a charge transaction. Used on `order.delivered`. */
  capture(holdId: WalletHoldId, ctx?: RequestContext): Promise<WalletTx>;

  /** Reverse a hold (no charge). Used on `order.cancelled` / `order.rejected`. */
  releaseHold(holdId: WalletHoldId, ctx?: RequestContext): Promise<void>;

  /**
   * Available balance = `balance - sum(active holds)`. Used by checkout to
   * disable the wallet method when funds are reserved for another in-flight
   * order. Returns 0 if the wallet does not exist (vs. throwing).
   */
  availableBalance(userId: Id, ctx?: RequestContext): Promise<Money>;
}
