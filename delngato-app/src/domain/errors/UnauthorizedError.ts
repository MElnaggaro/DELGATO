import { DomainError } from './DomainError';

/**
 * Maps to HTTP 401/403. The HTTP client's interceptor surfaces this and may
 * trigger sign-out for the active role.
 */
export class UnauthorizedError extends DomainError {
  override readonly name = 'UnauthorizedError';
  constructor(message = 'Unauthorized') {
    super(message, { code: 'UNAUTHORIZED' });
  }
}
