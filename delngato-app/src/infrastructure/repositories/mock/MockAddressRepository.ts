import type { AddressRepository } from '@/domain/repositories';
import type { AddAddressInput, Address, Id } from '@/domain/types';
import { NotFoundError } from '@/domain/errors';
import { usePlatformStore } from '@/domain/stores/platform';

import type { LatencyEngine } from '@/infrastructure/seed/LatencyEngine';
import { bumpAudit, genId, newAudit } from './_support';

export class MockAddressRepository implements AddressRepository {
  constructor(private readonly latency: LatencyEngine) {}

  async list(userId: Id): Promise<readonly Address[]> {
    await this.latency.sleep('read');
    return Object.values(usePlatformStore.getState().addresses).filter((a) => a.userId === userId);
  }

  async add(input: AddAddressInput): Promise<Address> {
    await this.latency.sleep('write');
    const id = genId('addr');
    const created: Address = { ...newAudit(), id, ...input };
    usePlatformStore.getState().applyAddress(created);
    return created;
  }

  async update(id: Id, patch: Partial<Address>): Promise<Address> {
    await this.latency.sleep('write');
    const prev = this.require(id);
    const next: Address = { ...prev, ...patch, ...bumpAudit(prev) };
    usePlatformStore.getState().applyAddress(next);
    return next;
  }

  async remove(id: Id): Promise<void> {
    await this.latency.sleep('write');
    this.require(id);
    usePlatformStore.getState().remove('address', id);
  }

  async setDefault(id: Id): Promise<void> {
    await this.latency.sleep('write');
    const state = usePlatformStore.getState();
    const target = this.require(id);
    for (const a of Object.values(state.addresses)) {
      if (a.userId === target.userId) {
        state.applyAddress({ ...a, isDefault: a.id === id, ...bumpAudit(a) });
      }
    }
  }

  private require(id: Id): Address {
    const a = usePlatformStore.getState().addresses[id];
    if (!a) throw new NotFoundError('Address', id);
    return a;
  }
}
