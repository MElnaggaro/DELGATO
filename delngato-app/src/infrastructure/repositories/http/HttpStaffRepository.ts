import type { StaffRepository } from '@/domain/repositories';
import type { Id, Staff, UpsertStaffInput } from '@/domain/types';
import { unimplemented } from './_stub';

export class HttpStaffRepository implements StaffRepository {
  constructor(private readonly _api: unknown) { void this._api; }
  byStore(_s: Id): Promise<readonly Staff[]> { return unimplemented('HttpStaffRepository.byStore'); }
  upsert(_i: UpsertStaffInput): Promise<Staff> { return unimplemented('HttpStaffRepository.upsert'); }
  delete(_id: Id): Promise<void> { return unimplemented('HttpStaffRepository.delete'); }
  toggleActive(_id: Id, _a: boolean): Promise<Staff> { return unimplemented('HttpStaffRepository.toggleActive'); }
}
