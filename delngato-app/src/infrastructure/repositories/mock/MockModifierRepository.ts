import type {
  ModifierRepository,
  UpsertModifierGroupInput,
} from '@/domain/repositories';
import type { Id, ModifierGroup, ModifierOption } from '@/domain/types';
import { NotFoundError, ValidationError } from '@/domain/errors';
import { usePlatformStore } from '@/domain/stores/platform';

import type { LatencyEngine } from '@/infrastructure/seed/LatencyEngine';
import { bumpAudit, genId, newAudit } from './_support';

export class MockModifierRepository implements ModifierRepository {
  constructor(private readonly latency: LatencyEngine) {}

  async byStore(storeId: Id): Promise<readonly ModifierGroup[]> {
    await this.latency.sleep('read');
    return Object.values(usePlatformStore.getState().modifiers).filter((m) => m.storeId === storeId);
  }

  async upsert(input: UpsertModifierGroupInput): Promise<ModifierGroup> {
    await this.latency.sleep('write');
    if (input.name.trim().length < 2) {
      throw new ValidationError({ name: 'الاسم لازم ٢ حرف على الأقل' });
    }
    if (input.options.length === 0) {
      throw new ValidationError({ options: 'لازم تضيف اختيار واحد على الأقل' });
    }

    const options: readonly ModifierOption[] = input.options.map((o) => ({
      id: o.id ?? genId('opt'),
      name: o.name,
      priceDelta: o.priceDelta,
    }));

    const state = usePlatformStore.getState();
    if (input.id) {
      const prev = state.modifiers[input.id];
      if (!prev) throw new NotFoundError('ModifierGroup', input.id);
      const next: ModifierGroup = {
        ...prev,
        name: input.name,
        kind: input.kind,
        required: input.required,
        options,
        ...bumpAudit(prev),
      };
      state.applyModifier(next);
      return next;
    }
    const id = genId('mod');
    const created: ModifierGroup = {
      ...newAudit(),
      id,
      storeId: input.storeId,
      name: input.name,
      kind: input.kind,
      required: input.required,
      options,
    };
    state.applyModifier(created);
    return created;
  }

  async delete(id: Id): Promise<void> {
    await this.latency.sleep('write');
    if (!usePlatformStore.getState().modifiers[id]) throw new NotFoundError('ModifierGroup', id);
    usePlatformStore.getState().remove('modifier', id);
  }
}
