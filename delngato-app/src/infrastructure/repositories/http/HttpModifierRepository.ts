import type {
  ModifierRepository,
  UpsertModifierGroupInput,
} from '@/domain/repositories';
import type { Id, ModifierGroup } from '@/domain/types';
import { unimplemented } from './_stub';

export class HttpModifierRepository implements ModifierRepository {
  constructor(private readonly _api: unknown) { void this._api; }
  byStore(_s: Id): Promise<readonly ModifierGroup[]> { return unimplemented('HttpModifierRepository.byStore'); }
  upsert(_i: UpsertModifierGroupInput): Promise<ModifierGroup> { return unimplemented('HttpModifierRepository.upsert'); }
  delete(_id: Id): Promise<void> { return unimplemented('HttpModifierRepository.delete'); }
}
