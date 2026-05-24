import { DomainError } from './DomainError';

/**
 * Maps to transport-level failures (offline, DNS, 5xx). UI typically responds
 * with a retry-able toast and the OfflineBanner (already present in the app).
 */
export class NetworkError extends DomainError {
  override readonly name = 'NetworkError';
  readonly retryable: boolean;

  constructor(message = 'Network error', retryable = true) {
    super(message, { code: 'NETWORK' });
    this.retryable = retryable;
  }
}
