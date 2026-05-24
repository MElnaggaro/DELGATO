import type { Category, Id } from '@/domain/types';
import type { RequestContext } from './common';

export type UpsertCategoryInput = {
  readonly id?: Id;
  readonly storeId: Id;
  readonly name: string;
  readonly icon?: string;
  readonly visible?: boolean;
};

export interface CategoryRepository {
  byStore(storeId: Id, ctx?: RequestContext): Promise<readonly Category[]>;
  upsert(input: UpsertCategoryInput, ctx?: RequestContext): Promise<Category>;
  reorder(storeId: Id, orderedIds: readonly Id[], ctx?: RequestContext): Promise<readonly Category[]>;
  toggleVisibility(id: Id, visible: boolean, ctx?: RequestContext): Promise<Category>;
  delete(id: Id, ctx?: RequestContext): Promise<void>;
}
