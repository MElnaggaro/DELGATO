import type { Id, Staff, UpsertStaffInput } from '@/domain/types';
import type { RequestContext } from './common';

export interface StaffRepository {
  byStore(storeId: Id, ctx?: RequestContext): Promise<readonly Staff[]>;
  upsert(input: UpsertStaffInput, ctx?: RequestContext): Promise<Staff>;
  delete(id: Id, ctx?: RequestContext): Promise<void>;
  toggleActive(id: Id, active: boolean, ctx?: RequestContext): Promise<Staff>;
}
