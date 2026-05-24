import type { AddressRepository } from '@/domain/repositories';
import type { AddAddressInput, Address, Id } from '@/domain/types';
import { unimplemented } from './_stub';

export class HttpAddressRepository implements AddressRepository {
  constructor(private readonly _api: unknown) { void this._api; }
  list(_u: Id): Promise<readonly Address[]> { return unimplemented('HttpAddressRepository.list'); }
  add(_i: AddAddressInput): Promise<Address> { return unimplemented('HttpAddressRepository.add'); }
  update(_id: Id, _p: Partial<Address>): Promise<Address> { return unimplemented('HttpAddressRepository.update'); }
  remove(_id: Id): Promise<void> { return unimplemented('HttpAddressRepository.remove'); }
  setDefault(_id: Id): Promise<void> { return unimplemented('HttpAddressRepository.setDefault'); }
}
