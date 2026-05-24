import type { WalletRepository } from '@/domain/repositories';
import type { Id, Money, TopUpInput, Wallet, WalletTx } from '@/domain/types';
import { NotFoundError, ValidationError } from '@/domain/errors';
import { usePlatformStore } from '@/domain/stores/platform';

import type { LatencyEngine } from '@/infrastructure/seed/LatencyEngine';
import { bus } from '@/infrastructure/events';
import { bumpAudit, genId, nowISO } from './_support';

export class MockWalletRepository implements WalletRepository {
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
}
