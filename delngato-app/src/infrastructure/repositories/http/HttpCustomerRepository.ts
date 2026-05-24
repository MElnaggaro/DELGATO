import type { CustomerRepository } from '@/domain/repositories';
import type { Customer } from '@/domain/types';
import { unimplemented } from './_stub';

export class HttpCustomerRepository implements CustomerRepository {
  constructor(private readonly _api: unknown) { void this._api; }
  me(): Promise<Customer> { return unimplemented('HttpCustomerRepository.me'); }
  update(_patch: Partial<Customer>): Promise<Customer> { return unimplemented('HttpCustomerRepository.update'); }
  delete(): Promise<void> { return unimplemented('HttpCustomerRepository.delete'); }
}
