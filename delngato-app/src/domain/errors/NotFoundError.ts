import { DomainError } from './DomainError';

/** Maps to HTTP 404. The entity does not exist (or the caller cannot see it). */
export class NotFoundError extends DomainError {
  override readonly name = 'NotFoundError';
  readonly entity: string;
  readonly id?: string;

  constructor(entity: string, id?: string) {
    super(`${entity} not found${id ? ` (id=${id})` : ''}`, { code: 'NOT_FOUND' });
    this.entity = entity;
    if (id !== undefined) this.id = id;
  }
}
