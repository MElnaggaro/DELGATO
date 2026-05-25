import type { State } from '../stores/platform';
import type { Id, Wallet, WalletTx } from '../types';

export function selectWalletForUser(s: State, userId: Id): Wallet | null {
  return Object.values(s.wallets).find((w: Wallet) => w.userId === userId) ?? null;
}

export function selectWalletTxsForUser(s: State, userId: Id): readonly WalletTx[] {
  return Object.values(s.walletTx)
    .filter((t: WalletTx) => t.userId === userId)
    .sort((a: WalletTx, b: WalletTx) => (b.ts > a.ts ? 1 : -1));
}
