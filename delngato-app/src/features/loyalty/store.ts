import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { zustandAsyncStorage } from '@/services/storage';
import {
  CASHBACK_THIS_MONTH,
  POINTS_BALANCE_INITIAL,
  WALLET_BALANCE_INITIAL,
  WALLET_TX_INITIAL,
  type TopupMethod,
  type WalletTx,
} from './data';

type State = {
  walletBalance: number;
  points: number;
  cashbackThisMonth: number;
  walletTx: WalletTx[];
};

type Actions = {
  setWalletBalance: (n: number) => void;
  topUp: (amount: number, method: TopupMethod) => void;
  chargeWallet: (amount: number, orderId: string) => void;
  setPoints: (n: number) => void;
  redeem: (cost: number, title: string) => void;
};

export const useLoyaltyStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      walletBalance: WALLET_BALANCE_INITIAL,
      points: POINTS_BALANCE_INITIAL,
      cashbackThisMonth: CASHBACK_THIS_MONTH,
      walletTx: WALLET_TX_INITIAL,
      setWalletBalance: (n) => set({ walletBalance: n }),
      topUp: (amount, method) => {
        if (!Number.isFinite(amount) || amount <= 0) return;
        set((s) => ({
          walletBalance: s.walletBalance + amount,
          walletTx: [
            {
              id: 'tx' + Date.now(),
              kind: 'in',
              title: `شحن من ${method.label}`,
              date: 'دلوقتي',
              amount,
            },
            ...s.walletTx,
          ],
        }));
      },
      chargeWallet: (amount, orderId) => {
        const balance = get().walletBalance;
        if (balance < amount) return;
        set((s) => ({
          walletBalance: s.walletBalance - amount,
          walletTx: [
            {
              id: 'tx' + Date.now(),
              kind: 'out',
              title: `دفع طلب ${orderId}`,
              date: 'دلوقتي',
              amount: -amount,
            },
            ...s.walletTx,
          ],
        }));
      },
      setPoints: (n) => set({ points: n }),
      redeem: (cost, _title) => set((s) => ({ points: Math.max(0, s.points - cost) })),
    }),
    {
      name: 'delngato.loyalty',
      storage: createJSONStorage(() => zustandAsyncStorage),
    },
  ),
);
