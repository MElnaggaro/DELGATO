import type { Id, NextPayout, Payout } from '@/domain/types';
import type { RequestContext } from './common';

export interface PayoutRepository {
  history(storeId: Id, ctx?: RequestContext): Promise<readonly Payout[]>;
  nextPayout(storeId: Id, ctx?: RequestContext): Promise<NextPayout>;
}
