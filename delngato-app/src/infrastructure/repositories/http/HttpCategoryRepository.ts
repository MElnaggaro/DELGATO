import type { CategoryRepository, UpsertCategoryInput } from '@/domain/repositories';
import type { Category, Id } from '@/domain/types';
import { unimplemented } from './_stub';

export class HttpCategoryRepository implements CategoryRepository {
  constructor(private readonly _api: unknown) { void this._api; }
  byStore(_s: Id): Promise<readonly Category[]> { return unimplemented('HttpCategoryRepository.byStore'); }
  upsert(_i: UpsertCategoryInput): Promise<Category> { return unimplemented('HttpCategoryRepository.upsert'); }
  reorder(_s: Id, _o: readonly Id[]): Promise<readonly Category[]> { return unimplemented('HttpCategoryRepository.reorder'); }
  toggleVisibility(_id: Id, _v: boolean): Promise<Category> { return unimplemented('HttpCategoryRepository.toggleVisibility'); }
  delete(_id: Id): Promise<void> { return unimplemented('HttpCategoryRepository.delete'); }
}
