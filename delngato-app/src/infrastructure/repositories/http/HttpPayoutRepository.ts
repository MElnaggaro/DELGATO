import type { PayoutRepository } from '@/domain/repositories';
import type { Id, NextPayout, Payout } from '@/domain/types';
import { unimplemented } from './_stub';

export class HttpPayoutRepository implements PayoutRepository {
  constructor(private readonly _api: unknown) { void this._api; }
  history(_s: Id): Promise<readonly Payout[]> { return unimplemented('HttpPayoutRepository.history'); }
  nextPayout(_s: Id): Promise<NextPayout> { return unimplemented('HttpPayoutRepository.nextPayout'); }
}
