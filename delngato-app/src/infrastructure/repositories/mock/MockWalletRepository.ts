import type { WalletHold, WalletHoldId, WalletRepository } from '@/domain/repositories';
import type { Id, Money, TopUpInput, Wallet, WalletTx } from '@/domain/types';
import { ConflictError, NotFoundError, ValidationError } from '@/domain/errors';
import { usePlatformStore } from '@/domain/stores/platform';

import type { LatencyEngine } from '@/infrastructure/seed/LatencyEngine';
import { bus } from '@/infrastructure/events';
import { bumpAudit, genId, nowISO } from './_support';

export class MockWalletRepository implements WalletRepository {
  /**
   * In-memory hold ledger. Holds are intentionally NOT persisted across cold
   * starts: a real backend would, but a mock that survives reload would
   * happily drain mock balances over time. If the mock is reset, all holds
   * are gone — which matches typical local-dev expectations.
   */
  private readonly holds = new Map<WalletHoldId, WalletHold>();

  constructor(private readonly latency: LatencyEngine) {}

  async forUser(userId: Id): Promise<Wallet> {
    await this.latency.sleep('read');
    const w = Object.values(usePlatformStore.getState().wallets).find((x) => x.userId === userId);
    if (!w) throw new NotFoundError('Wallet', userId);
    return w;
  }

  async history(userId: Id): Promise<readonly WalletTx[]> {
    await this.latency.sleep('read');
    return Object.values(usePlatformStore.getState().walletTx)
      .filter((t) => t.userId === userId)
      .sort((a, b) => (a.ts < b.ts ? 1 : -1));
  }

  async topUp(input: TopUpInput): Promise<WalletTx> {
    await this.latency.sleep('write');
    if (input.amount <= 0) throw new ValidationError({ amount: 'لازم رقم موجب' });
    const wallet = await this.forUser(input.userId);
    const txId = genId('wtx');
    const tx: WalletTx = {
      id: txId,
      walletId: wallet.id,
      userId: input.userId,
      kind: 'in',
      title: `شحن محفظة (${input.method})`,
      ts: nowISO(),
      amount: input.amount,
      createdAt: nowISO(),
      version: 1,
    };
    const next: Wallet = { ...wallet, balance: wallet.balance + input.amount, ...bumpAudit(wallet) };
    const state = usePlatformStore.getState();
    state.applyWallet(next);
    state.applyWalletTx(tx);
    bus.emit({ type: 'wallet.topped-up', userId: input.userId, amount: input.amount });
    return tx;
  }

  async charge(userId: Id, amount: Money, orderId?: Id): Promise<WalletTx> {
    await this.latency.sleep('write');
    if (amount <= 0) throw new ValidationError({ amount: 'لازم رقم موجب' });
    const wallet = await this.forUser(userId);
    if (wallet.balance < amount) throw new ValidationError({ balance: 'الرصيد مش كافي' });
    const tx: WalletTx = {
      id: genId('wtx'),
      walletId: wallet.id,
      userId,
      kind: 'out',
      title: 'دفع طلب',
      ts: nowISO(),
      amount,
      ...(orderId ? { orderId } : {}),
      createdAt: nowISO(),
      version: 1,
    };
    const next: Wallet = { ...wallet, balance: wallet.balance - amount, ...bumpAudit(wallet) };
    const state = usePlatformStore.getState();
    state.applyWallet(next);
    state.applyWalletTx(tx);
    bus.emit({ type: 'wallet.charged', userId, amount, ...(orderId ? { orderId } : {}) });
    return tx;
  }

  async hold(userId: Id, amount: Money, ref?: Id): Promise<WalletHold> {
    await this.latency.sleep('write');
    if (amount <= 0) throw new ValidationError({ amount: 'لازم رقم موجب' });
    const wallet = await this.forUser(userId);
    const heldTotal = this.heldFor(userId);
    if (wallet.balance - heldTotal < amount) {
      throw new ValidationError({ balance: 'الرصيد المتاح مش كافي' });
    }
    const hold: WalletHold = {
      id: genId('whold'),
      userId,
      amount,
      ...(ref ? { ref } : {}),
      createdAt: nowISO(),
    };
    this.holds.set(hold.id, hold);
    return hold;
  }

  async capture(holdId: WalletHoldId): Promise<WalletTx> {
    await this.latency.sleep('write');
    const hold = this.holds.get(holdId);
    if (!hold) throw new NotFoundError('WalletHold', holdId);
    const wallet = await this.forUser(hold.userId);
    if (wallet.balance < hold.amount) {
      // Should be impossible given the hold guard, but covers concurrent debits.
      throw new ConflictError('hold-capture-balance', 'الرصيد تغير قبل إتمام الخصم');
    }
    const tx: WalletTx = {
      id: genId('wtx'),
      walletId: wallet.id,
      userId: hold.userId,
      kind: 'out',
      title: 'دفع طلب',
      ts: nowISO(),
      amount: hold.amount,
      ...(hold.ref ? { orderId: hold.ref } : {}),
      createdAt: nowISO(),
      version: 1,
    };
    const next: Wallet = {
      ...wallet,
      balance: wallet.balance - hold.amount,
      ...bumpAudit(wallet),
    };
    const state = usePlatformStore.getState();
    state.applyWallet(next);
    state.applyWalletTx(tx);
    this.holds.delete(holdId);
    bus.emit({
      type: 'wallet.charged',
      userId: hold.userId,
      amount: hold.amount,
      ...(hold.ref ? { orderId: hold.ref } : {}),
    });
    return tx;
  }

  async releaseHold(holdId: WalletHoldId): Promise<void> {
    await this.latency.sleep('write');
    // Idempotent: releasing an unknown hold is a no-op (already released).
    this.holds.delete(holdId);
  }

  async availableBalance(userId: Id): Promise<Money> {
    await this.latency.sleep('read');
    const wallet = Object.values(usePlatformStore.getState().wallets).find(
      (x) => x.userId === userId,
    );
    if (!wallet) return 0;
    return Math.max(0, wallet.balance - this.heldFor(userId));
  }

  private heldFor(userId: Id): Money {
    let total = 0;
    for (const h of this.holds.values()) {
      if (h.userId === userId) total += h.amount;
    }
    return total;
  }
}
