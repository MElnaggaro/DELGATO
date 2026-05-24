import type { CategoryRepository, UpsertCategoryInput } from '@/domain/repositories';
import type { Category, Id } from '@/domain/types';
import { NotFoundError } from '@/domain/errors';
import { usePlatformStore } from '@/domain/stores/platform';

import type { LatencyEngine } from '@/infrastructure/seed/LatencyEngine';
import { bumpAudit, genId, newAudit } from './_support';

export class MockCategoryRepository implements CategoryRepository {
  constructor(private readonly latency: LatencyEngine) {}

  async byStore(storeId: Id): Promise<readonly Category[]> {
    await this.latency.sleep('read');
    return Object.values(usePlatformStore.getState().categories)
      .filter((c) => c.storeId === storeId)
      .sort((a, b) => a.order - b.order);
  }

  async upsert(input: UpsertCategoryInput): Promise<Category> {
    await this.latency.sleep('write');
    const state = usePlatformStore.getState();
    if (input.id) {
      const prev = state.categories[input.id];
      if (!prev) throw new NotFoundError('Category', input.id);
      const next: Category = {
        ...prev,
        name: input.name,
        ...(input.icon !== undefined ? { icon: input.icon } : {}),
        ...(input.visible !== undefined ? { visible: input.visible } : {}),
        ...bumpAudit(prev),
      };
      state.applyCategory(next);
      return next;
    }
    const id = genId('cat');
    const lastOrder = (await this.byStore(input.storeId)).reduce((m, c) => Math.max(m, c.order), -1);
    const created: Category = {
      ...newAudit(),
      id,
      storeId: input.storeId,
      name: input.name,
      count: 0,
      ...(input.icon !== undefined ? { icon: input.icon } : {}),
      visible: input.visible ?? true,
      order: lastOrder + 1,
    };
    state.applyCategory(created);
    return created;
  }

  async reorder(storeId: Id, orderedIds: readonly Id[]): Promise<readonly Category[]> {
    await this.latency.sleep('write');
    const state = usePlatformStore.getState();
    const updated: Category[] = [];
    orderedIds.forEach((id, i) => {
      const c = state.categories[id];
      if (c && c.storeId === storeId) {
        const next: Category = { ...c, order: i, ...bumpAudit(c) };
        state.applyCategory(next);
        updated.push(next);
      }
    });
    return updated;
  }

  async toggleVisibility(id: Id, visible: boolean): Promise<Category> {
    await this.latency.sleep('write');
    const c = usePlatformStore.getState().categories[id];
    if (!c) throw new NotFoundError('Category', id);
    const next: Category = { ...c, visible, ...bumpAudit(c) };
    usePlatformStore.getState().applyCategory(next);
    return next;
  }

  async delete(id: Id): Promise<void> {
    await this.latency.sleep('write');
    if (!usePlatformStore.getState().categories[id]) throw new NotFoundError('Category', id);
    usePlatformStore.getState().remove('category', id);
  }
}
