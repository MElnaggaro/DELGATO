import { DomainError } from './DomainError';

/**
 * Thrown by HTTP repository stubs in Phase 0. Used solely to lock interface
 * contracts and to power the CI swap-test that boots with API_MODE=http.
 */
export class NotImplementedError extends DomainError {
  override readonly name = 'NotImplementedError';
  constructor(operation: string) {
    super(`Not implemented: ${operation}`, { code: 'NOT_IMPLEMENTED' });
  }
}
