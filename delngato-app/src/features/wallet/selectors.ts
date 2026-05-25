/**
 * Wallet selectors over the canonical platform store.
 *
 * `userId` is optional because some surfaces (e.g. the profile header) want
 * the active user's balance without threading the id; passing `undefined`
 * falls back to the auth store's current user.
 */

import { usePlatformStore } from '@/domain/stores/platform';
import { useAuthStore } from '@/features/auth/store';
import type { Id, Money, Wallet, WalletTx } from '@/domain/types';

function resolveUserId(explicit?: Id): Id | null {
  if (explicit) return explicit;
  return useAuthStore.getState().user?.id ?? null;
}

export function useWalletForUser(userId?: Id): Wallet | null {
  return usePlatformStore((s) => {
    const id = resolveUserId(userId);
    if (!id) return null;
    return Object.values(s.wallets).find((w) => w.userId === id) ?? null;
  });
}

export function useWalletBalance(userId?: Id): Money {
  return usePlatformStore((s) => {
    const id = resolveUserId(userId);
    if (!id) return 0;
    const wallet = Object.values(s.wallets).find((w) => w.userId === id);
    return wallet?.balance ?? 0;
  });
}

export function useWalletHistory(userId?: Id): readonly WalletTx[] {
  return usePlatformStore((s) => {
    const id = resolveUserId(userId);
    if (!id) return [];
    return Object.values(s.walletTx)
      .filter((t) => t.userId === id)
      .sort((a, b) => (a.ts < b.ts ? 1 : -1));
  });
}
