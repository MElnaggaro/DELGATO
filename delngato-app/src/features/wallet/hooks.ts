import { useMemo } from 'react';
import { usePlatformStore } from '@/domain/stores/platform';
import type { Id, Wallet, WalletTx } from '@/domain/types';

export function useWallet(userId: Id | undefined): Wallet | null {
  const walletsMap = usePlatformStore((s) => s.wallets);
  return useMemo(() => {
    if (!userId) return null;
    return Object.values(walletsMap).find((w) => w.userId === userId) ?? null;
  }, [walletsMap, userId]);
}

export function useWalletTxs(userId: Id | undefined): readonly WalletTx[] {
  const txsMap = usePlatformStore((s) => s.walletTx);
  return useMemo(() => {
    if (!userId) return [];
    return Object.values(txsMap)
      .filter((tx: WalletTx) => tx.userId === userId)
      .sort((a: WalletTx, b: WalletTx) => (b.ts > a.ts ? 1 : -1));
  }, [txsMap, userId]);
}
