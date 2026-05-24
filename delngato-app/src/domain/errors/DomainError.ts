/**
 * Base class for all errors thrown from the domain or its adapters.
 *
 * Repositories throw `DomainError` subtypes. Application code maps them to
 * UI states (toasts, banners, form-field errors). The mock and HTTP layers
 * MUST throw the same concrete subtypes for the same conditions so that
 * UI handling is identical regardless of transport.
 */
export class DomainError extends Error {
  override readonly name: string = 'DomainError';
  /** Optional opaque code for telemetry / i18n lookup. */
  readonly code?: string;
  /** Original error if this wraps a lower-layer exception. */
  readonly cause?: unknown;

  constructor(message: string, opts: { code?: string; cause?: unknown } = {}) {
    super(message);
    if (opts.code !== undefined) this.code = opts.code;
    if (opts.cause !== undefined) this.cause = opts.cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
