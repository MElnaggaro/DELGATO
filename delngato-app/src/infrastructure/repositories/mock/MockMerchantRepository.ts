import type { MerchantRepository } from '@/domain/repositories';
import type {
  HoursWeek,
  Merchant,
  PaymentMethodPrefs,
  Store,
  StoreBrand,
  TaxConfig,
  TempCloseInput,
} from '@/domain/types';
import { NotFoundError } from '@/domain/errors';
import { usePlatformStore } from '@/domain/stores/platform';
import { selectStoreById } from '@/domain/selectors';

import type { LatencyEngine } from '@/infrastructure/seed/LatencyEngine';
import { DEMO_MERCHANT_ID, SEED_MERCHANTS } from '@/infrastructure/seed/seedData';
import { bus } from '@/infrastructure/events';
import { bumpAudit } from './_support';

export class MockMerchantRepository implements MerchantRepository {
  constructor(private readonly latency: LatencyEngine) {}

  async me(): Promise<Merchant> {
    await this.latency.sleep('read');
    const owner = SEED_MERCHANTS.find((m) => m.storeId === DEMO_MERCHANT_ID);
    if (!owner) throw new NotFoundError('Merchant');
    return owner;
  }

  async myStore(): Promise<Store> {
    await this.latency.sleep('read');
    return this.requireStore();
  }

  async updateStore(patch: Partial<Store>): Promise<Store> {
    await this.latency.sleep('write');
    return this.patchStore(patch);
  }

  async toggleAcceptingOrders(accepting: boolean): Promise<Store> {
    await this.latency.sleep('write');
    const next = this.patchStore({ acceptingOrders: accepting });
    bus.emit({ type: 'store.accepting-toggled', storeId: next.id, accepting });
    return next;
  }

  async setHours(hours: HoursWeek): Promise<Store> {
    await this.latency.sleep('write');
    const next = this.patchStore({ hours });
    bus.emit({ type: 'store.hours-changed', storeId: next.id });
    return next;
  }

  async setTempClose(input: TempCloseInput | null): Promise<Store> {
    await this.latency.sleep('write');
    const next = this.patchStore({ tempClose: input });
    if (input) bus.emit({ type: 'store.temp-closed', storeId: next.id, reason: input.reason, ...(input.until ? { until: input.until } : {}) });
    else bus.emit({ type: 'store.temp-reopened', storeId: next.id });
    return next;
  }

  async setDeliveryRadius(km: number): Promise<Store> {
    await this.latency.sleep('write');
    const next = this.patchStore({ deliveryRadiusKm: km });
    bus.emit({ type: 'store.delivery-radius', storeId: next.id, radiusKm: km });
    return next;
  }

  async setPrepTime(min: number): Promise<Store> {
    await this.latency.sleep('write');
    const next = this.patchStore({ prepTimeMin: min });
    bus.emit({ type: 'store.prep-time-changed', storeId: next.id, prepTimeMin: min });
    return next;
  }

  async setPaymentMethods(methods: PaymentMethodPrefs): Promise<Store> {
    await this.latency.sleep('write');
    return this.patchStore({ paymentMethods: methods });
  }

  async setTax(input: TaxConfig): Promise<Store> {
    await this.latency.sleep('write');
    return this.patchStore({ taxConfig: input });
  }

  async setBrand(brand: StoreBrand): Promise<Store> {
    await this.latency.sleep('write');
    return this.patchStore({ bg: brand });
  }

  private requireStore(): Store {
    const s = selectStoreById(usePlatformStore.getState(), DEMO_MERCHANT_ID);
    if (!s) throw new NotFoundError('Store', DEMO_MERCHANT_ID);
    return s;
  }

  private patchStore(patch: Partial<Store>): Store {
    const prev = this.requireStore();
    const next: Store = { ...prev, ...patch, ...bumpAudit(prev) };
    usePlatformStore.getState().applyStore(next);
    return next;
  }
}
