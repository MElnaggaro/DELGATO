import type { AddAddressInput, Address, Id } from '@/domain/types';
import type { RequestContext } from './common';

export interface AddressRepository {
  list(userId: Id, ctx?: RequestContext): Promise<readonly Address[]>;
  add(input: AddAddressInput, ctx?: RequestContext): Promise<Address>;
  update(id: Id, patch: Partial<Address>, ctx?: RequestContext): Promise<Address>;
  remove(id: Id, ctx?: RequestContext): Promise<void>;
  setDefault(id: Id, ctx?: RequestContext): Promise<void>;
}
