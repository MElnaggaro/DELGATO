import type {
  PromotionFilter,
  PromotionRepository,
  UpsertPromotionInput,
} from '@/domain/repositories';
import type { Cart, Id, Promotion, PromoValidation } from '@/domain/types';
import { unimplemented } from './_stub';

export class HttpPromotionRepository implements PromotionRepository {
  constructor(private readonly _api: unknown) { void this._api; }
  list(_f?: PromotionFilter): Promise<readonly Promotion[]> { return unimplemented('HttpPromotionRepository.list'); }
  byCode(_c: string): Promise<Promotion | null> { return unimplemented('HttpPromotionRepository.byCode'); }
  byStore(_s: Id): Promise<readonly Promotion[]> { return unimplemented('HttpPromotionRepository.byStore'); }
  upsert(_i: UpsertPromotionInput): Promise<Promotion> { return unimplemented('HttpPromotionRepository.upsert'); }
  toggle(_id: Id, _a: boolean): Promise<Promotion> { return unimplemented('HttpPromotionRepository.toggle'); }
  delete(_id: Id): Promise<void> { return unimplemented('HttpPromotionRepository.delete'); }
  validate(_c: string, _ctx: { cart: Cart; storeId: Id }): Promise<PromoValidation> {
    return unimplemented('HttpPromotionRepository.validate');
  }
}
