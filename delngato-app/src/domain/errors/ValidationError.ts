import { DomainError } from './DomainError';

export type FieldErrors = Readonly<Record<string, string>>;

/**
 * Maps to HTTP 422. Caller passed input that violates the entity's invariants.
 * `fieldErrors` may be surfaced directly to a form via react-hook-form.
 */
export class ValidationError extends DomainError {
  override readonly name = 'ValidationError';
  readonly fieldErrors: FieldErrors;

  constructor(fieldErrors: FieldErrors, message = 'Validation failed') {
    super(message, { code: 'VALIDATION' });
    this.fieldErrors = fieldErrors;
  }
}
