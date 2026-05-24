import type { CustomerRepository } from '@/domain/repositories';
import type { Customer } from '@/domain/types';
import { NotFoundError } from '@/domain/errors';

import type { LatencyEngine } from '@/infrastructure/seed/LatencyEngine';
import { DEMO_CUSTOMER } from '@/infrastructure/seed/seedData';
import { bumpAudit } from './_support';

/**
 * Single-customer demo today. In production this is keyed by the active
 * customer session.
 */
export class MockCustomerRepository implements CustomerRepository {
  private current: Customer = DEMO_CUSTOMER;

  constructor(private readonly latency: LatencyEngine) {}

  async me(): Promise<Customer> {
    await this.latency.sleep('read');
    return this.current;
  }

  async update(patch: Partial<Customer>): Promise<Customer> {
    await this.latency.sleep('write');
    this.current = { ...this.current, ...patch, ...bumpAudit(this.current) };
    return this.current;
  }

  async delete(): Promise<void> {
    await this.latency.sleep('write');
    throw new NotFoundError('delete-account-flow', 'not-wired-in-phase-0');
  }
}
