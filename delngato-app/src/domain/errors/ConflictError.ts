import { DomainError } from './DomainError';

/**
 * Maps to HTTP 409. Used for:
 *  - Optimistic concurrency failures (`version` mismatch)
 *  - Domain rule violations that the caller could resolve and retry
 *    (e.g. adding a product from a different store to a non-empty cart)
 */
export class ConflictError extends DomainError {
  override readonly name = 'ConflictError';
  readonly reason: string;

  constructor(reason: string, message?: string) {
    super(message ?? `Conflict: ${reason}`, { code: 'CONFLICT' });
    this.reason = reason;
  }
}
