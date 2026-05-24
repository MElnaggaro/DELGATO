import type { Id, ModifierGroup, ModifierKind, ModifierOption } from '@/domain/types';
import type { RequestContext } from './common';

export type UpsertModifierGroupInput = {
  readonly id?: Id;
  readonly storeId: Id;
  readonly name: string;
  readonly kind: ModifierKind;
  readonly required: boolean;
  readonly options: ReadonlyArray<Omit<ModifierOption, 'id'> & { readonly id?: Id }>;
};

export interface ModifierRepository {
  byStore(storeId: Id, ctx?: RequestContext): Promise<readonly ModifierGroup[]>;
  upsert(input: UpsertModifierGroupInput, ctx?: RequestContext): Promise<ModifierGroup>;
  delete(id: Id, ctx?: RequestContext): Promise<void>;
}
