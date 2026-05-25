import type {
  BulkPriceInput,
  ProductFilter,
  ProductRepository,
  UpsertProductInput,
} from '@/domain/repositories';
import type { Id, Product, Quantity } from '@/domain/types';
import { NotFoundError, ValidationError } from '@/domain/errors';
import { usePlatformStore } from '@/domain/stores/platform';
import { selectProductById, selectProductsByStore } from '@/domain/selectors';
import type { Unsubscribe } from '@/domain/repositories/common';

import type { LatencyEngine } from '@/infrastructure/seed/LatencyEngine';
import type { MockRealtimeClient } from '@/infrastructure/realtime/MockRealtimeClient';
import { channels } from '@/infrastructure/realtime/channels';
import { bus } from '@/infrastructure/events';
import { bumpAudit, genId, newAudit } from './_support';

function availabilityFor(stock: number, prev?: Product['availability']): Product['availability'] {
  if (prev === 'archived') return 'archived';
  if (stock <= 0) return 'out';
  if (stock < 5) return 'low';
  return 'available';
}

export class MockProductRepository implements ProductRepository {
  constructor(
    private readonly latency: LatencyEngine,
    private readonly realtime: MockRealtimeClient,
  ) {}

  async list(filter?: ProductFilter): Promise<readonly Product[]> {
    await this.latency.sleep('read');
    const all = Object.values(usePlatformStore.getState().products);
    return this.applyFilter(all, filter);
  }

  async byId(id: Id): Promise<Product | null> {
    await this.latency.sleep('read');
    return selectProductById(usePlatformStore.getState(), id);
  }

  async byStore(storeId: Id, filter?: ProductFilter): Promise<readonly Product[]> {
    await this.latency.sleep('read');
    const rows = selectProductsByStore(usePlatformStore.getState(), storeId);
    return this.applyFilter(rows, filter);
  }

  async upsert(input: UpsertProductInput): Promise<Product> {
    await this.latency.sleep('write');
    if (input.name.trim().length < 2) {
      throw new ValidationError({ name: 'الاسم لازم ٢ حرف على الأقل' });
    }
    if (input.price <= 0) {
      throw new ValidationError({ price: 'السعر لازم أكبر من صفر' });
    }
    const state = usePlatformStore.getState();
    const existing = input.id ? selectProductById(state, input.id) : null;

    if (existing) {
      const stock = input.stock;
      const next: Product = {
        ...existing,
        name: input.name,
        sub: input.sub,
        categoryId: input.categoryId,
        price: input.price,
        ...(input.cost !== undefined ? { cost: input.cost } : {}),
        stock,
        hue: input.hue,
        availability: availabilityFor(stock, existing.availability),
        modifierGroupIds: input.modifierGroupIds ?? existing.modifierGroupIds,
        ...(input.tag !== undefined ? { tag: input.tag } : {}),
        ...(input.section !== undefined ? { section: input.section } : {}),
        ...bumpAudit(existing),
      };
      state.applyProduct(next);
      bus.emit({ type: 'product.updated', productId: next.id, changedFields: ['name', 'price', 'stock'] });
      return next;
    }

    const id = genId('prod');
    const created: Product = {
      ...newAudit(),
      id,
      storeId: input.storeId,
      name: input.name,
      sub: input.sub,
      categoryId: input.categoryId,
      price: input.price,
      ...(input.cost !== undefined ? { cost: input.cost } : {}),
      stock: input.stock,
      hue: input.hue,
      availability: availabilityFor(input.stock),
      soldToday: 0,
      modifierGroupIds: input.modifierGroupIds ?? [],
      ...(input.tag !== undefined ? { tag: input.tag } : {}),
      ...(input.section !== undefined ? { section: input.section } : {}),
    };
    state.applyProduct(created);
    bus.emit({ type: 'product.created', productId: id, storeId: input.storeId });
    return created;
  }

  async archive(id: Id): Promise<Product> {
    await this.latency.sleep('write');
    const prev = this.require(id);
    const next: Product = { ...prev, availability: 'archived', ...bumpAudit(prev) };
    usePlatformStore.getState().applyProduct(next);
    bus.emit({ type: 'product.archived', productId: id });
    return next;
  }

  async duplicate(id: Id): Promise<Product> {
    await this.latency.sleep('write');
    const prev = this.require(id);
    const newId = genId('prod');
    const dup: Product = { ...prev, id: newId, name: `${prev.name} (نسخة)`, ...newAudit() };
    usePlatformStore.getState().applyProduct(dup);
    bus.emit({ type: 'product.created', productId: newId, storeId: prev.storeId });
    return dup;
  }

  async setStock(id: Id, n: Quantity): Promise<Product> {
    await this.latency.sleep('write');
    if (n < 0) throw new ValidationError({ stock: 'لازم رقم موجب' });
    const prev = this.require(id);
    const next: Product = {
      ...prev,
      stock: n,
      availability: availabilityFor(n, prev.availability),
      ...bumpAudit(prev),
    };
    usePlatformStore.getState().applyProduct(next);
    bus.emit({ type: 'product.stock-changed', productId: id, from: prev.stock, to: n });
    if (prev.availability !== next.availability) {
      bus.emit({
        type: 'product.availability',
        productId: id,
        from: prev.availability,
        to: next.availability,
      });
    }
    return next;
  }

  async bulkAdjustPrice(input: BulkPriceInput): Promise<readonly Product[]> {
    await this.latency.sleep('write');
    const state = usePlatformStore.getState();
    const targets = selectProductsByStore(state, input.storeId).filter((p) =>
      input.scope.kind === 'all' ? true : p.categoryId === input.scope.categoryId,
    );
    const updated: Product[] = [];
    for (const p of targets) {
      const delta =
        input.mode === 'percent' ? Math.round((p.price * input.value) / 100) : input.value;
      const signed = input.direction === 'up' ? delta : -delta;
      const newPrice = Math.max(1, p.price + signed);
      const next: Product = { ...p, price: newPrice, ...bumpAudit(p) };
      state.applyProduct(next);
      updated.push(next);
      bus.emit({ type: 'product.updated', productId: p.id, changedFields: ['price'] });
    }
    return updated;
  }

  subscribeByStore(storeId: Id, onChange: (products: readonly Product[]) => void): Unsubscribe {
    const stop = usePlatformStore.subscribe(
      (s) => s.products,
      () =>
        onChange(selectProductsByStore(usePlatformStore.getState(), storeId)),
      { fireImmediately: true },
    );
    const stopChannel = this.realtime.subscribe(channels.productsByStore(storeId), () => {
      onChange(selectProductsByStore(usePlatformStore.getState(), storeId));
    });
    return () => {
      stop();
      stopChannel();
    };
  }

  private applyFilter(rows: readonly Product[], filter?: ProductFilter): readonly Product[] {
    if (!filter) return rows;
    return rows.filter((p) => {
      if (filter.availability && !filter.availability.includes(p.availability)) return false;
      if (filter.categoryId !== undefined && p.categoryId !== filter.categoryId) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.sub.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }

  private require(id: Id): Product {
    const p = selectProductById(usePlatformStore.getState(), id);
    if (!p) throw new NotFoundError('Product', id);
    return p;
  }

  /** POST /api/v1/products/check-availability */
  async checkAvailability(
    productIds: readonly Id[],
  ): Promise<readonly import('@/domain/repositories').AvailabilityCheckItem[]> {
    await this.latency.sleep('read');
    const state = usePlatformStore.getState();
    return productIds.map((productId) => {
      const p = state.products[productId];
      if (!p) return { productId, available: false, reason: 'archived' as const };
      if (p.availability === 'archived') return { productId, available: false, reason: 'archived' as const };
      if (p.availability === 'out' || p.stock <= 0) return { productId, available: false, reason: 'out_of_stock' as const };
      return { productId, available: true };
    });
  }
}
