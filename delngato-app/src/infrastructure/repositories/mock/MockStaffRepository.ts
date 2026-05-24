import type { StaffRepository } from '@/domain/repositories';
import type { Id, Staff, UpsertStaffInput } from '@/domain/types';
import { ConflictError, NotFoundError, ValidationError } from '@/domain/errors';
import { usePlatformStore } from '@/domain/stores/platform';

import type { LatencyEngine } from '@/infrastructure/seed/LatencyEngine';
import { bumpAudit, genId, newAudit } from './_support';

export class MockStaffRepository implements StaffRepository {
  constructor(private readonly latency: LatencyEngine) {}

  async byStore(storeId: Id): Promise<readonly Staff[]> {
    await this.latency.sleep('read');
    return Object.values(usePlatformStore.getState().staff).filter((s) => s.storeId === storeId);
  }

  async upsert(input: UpsertStaffInput): Promise<Staff> {
    await this.latency.sleep('write');
    if (input.name.trim().length < 2) throw new ValidationError({ name: 'لازم ٢ حرف' });
    if (input.phone.trim().length < 10) throw new ValidationError({ phone: 'رقم تليفون غير صالح' });
    const state = usePlatformStore.getState();
    if (input.id) {
      const prev = state.staff[input.id];
      if (!prev) throw new NotFoundError('Staff', input.id);
      const next: Staff = { ...prev, ...input, ...bumpAudit(prev) };
      state.applyStaff(next);
      return next;
    }
    const id = genId('staff');
    const created: Staff = { ...newAudit(), ...input, id };
    state.applyStaff(created);
    return created;
  }

  async delete(id: Id): Promise<void> {
    await this.latency.sleep('write');
    const s = usePlatformStore.getState().staff[id];
    if (!s) throw new NotFoundError('Staff', id);
    if (s.isOwner) throw new ConflictError('owner-protected', 'لا يمكن حذف صاحب المحل');
    usePlatformStore.getState().remove('staff', id);
  }

  async toggleActive(id: Id, active: boolean): Promise<Staff> {
    await this.latency.sleep('write');
    const s = usePlatformStore.getState().staff[id];
    if (!s) throw new NotFoundError('Staff', id);
    if (s.isOwner && !active) {
      throw new ConflictError('owner-protected', 'لا يمكن تعطيل صاحب المحل');
    }
    const next: Staff = { ...s, active, ...bumpAudit(s) };
    usePlatformStore.getState().applyStaff(next);
    return next;
  }
}
