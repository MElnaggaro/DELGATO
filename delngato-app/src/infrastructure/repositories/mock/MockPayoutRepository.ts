import type { PayoutRepository } from '@/domain/repositories';
import type { Id, NextPayout, Payout } from '@/domain/types';
import { usePlatformStore } from '@/domain/stores/platform';

import type { LatencyEngine } from '@/infrastructure/seed/LatencyEngine';

const DEFAULT_BANK = 'بنك الأهلي المصري';
const DEFAULT_ACCT_MASK = '**** 7421';

export class MockPayoutRepository implements PayoutRepository {
  constructor(private readonly latency: LatencyEngine) {}

  async history(storeId: Id): Promise<readonly Payout[]> {
    await this.latency.sleep('read');
    return Object.values(usePlatformStore.getState().payouts)
      .filter((p) => p.storeId === storeId)
      .sort((a, b) => (a.ts < b.ts ? 1 : -1));
  }

  async nextPayout(storeId: Id): Promise<NextPayout> {
    await this.latency.sleep('read');
    // Sum delivered orders this week. Real backend will compute and persist.
    const delivered = Object.values(usePlatformStore.getState().orders).filter(
      (o) => o.storeId === storeId && o.status === 'delivered',
    );
    const amount = delivered.reduce((n, o) => n + o.merchantShare, 0);

    // Next Friday ISO
    const now = new Date();
    const day = now.getDay(); // 0=Sun
    const daysUntilFri = (5 - day + 7) % 7 || 7;
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilFri);
    return {
      storeId,
      amount,
      date: next.toISOString(),
      bank: DEFAULT_BANK,
      accountMask: DEFAULT_ACCT_MASK,
    };
  }
}
