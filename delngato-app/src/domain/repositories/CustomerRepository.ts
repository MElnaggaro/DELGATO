import type { Customer } from '@/domain/types';

export interface CustomerRepository {
  me(): Promise<Customer>;
  update(patch: Partial<Customer>): Promise<Customer>;
  delete(): Promise<void>;
}
