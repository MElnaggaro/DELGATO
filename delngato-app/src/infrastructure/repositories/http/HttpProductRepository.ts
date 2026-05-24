import type {
  BulkPriceInput,
  ProductFilter,
  ProductRepository,
  UpsertProductInput,
} from '@/domain/repositories';
import type { Id, Product, Quantity } from '@/domain/types';
import type { Unsubscribe } from '@/domain/repositories/common';
import { unimplemented } from './_stub';

export class HttpProductRepository implements ProductRepository {
  constructor(private readonly _api: unknown) { void this._api; }
  list(_f?: ProductFilter): Promise<readonly Product[]> { return unimplemented('HttpProductRepository.list'); }
  byId(_id: Id): Promise<Product | null> { return unimplemented('HttpProductRepository.byId'); }
  byStore(_s: Id, _f?: ProductFilter): Promise<readonly Product[]> { return unimplemented('HttpProductRepository.byStore'); }
  upsert(_i: UpsertProductInput): Promise<Product> { return unimplemented('HttpProductRepository.upsert'); }
  archive(_id: Id): Promise<Product> { return unimplemented('HttpProductRepository.archive'); }
  duplicate(_id: Id): Promise<Product> { return unimplemented('HttpProductRepository.duplicate'); }
  setStock(_id: Id, _n: Quantity): Promise<Product> { return unimplemented('HttpProductRepository.setStock'); }
  bulkAdjustPrice(_i: BulkPriceInput): Promise<readonly Product[]> { return unimplemented('HttpProductRepository.bulkAdjustPrice'); }
  subscribeByStore(_s: Id, _h: (p: readonly Product[]) => void): Unsubscribe {
    unimplemented('HttpProductRepository.subscribeByStore');
  }
}
