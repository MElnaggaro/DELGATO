/**
 * Common primitives shared by every entity.
 *
 * Conventions (per blueprint § 6.1):
 *  - Every entity carries audit fields (`createdAt`, `updatedAt`, `version`).
 *  - `version` is monotonically incremented on every mutation. Used today by
 *    selectors (cart staleness); used later by the HTTP backend for optimistic
 *    concurrency control. The mock layer increments it; HTTP layer reads it
 *    from the server response.
 *  - IDs are opaque strings (UUID v4 today, server-assigned later). The domain
 *    treats them as opaque — never parses or assumes structure.
 */

export type Id = string;
export type ISODateTime = string; // e.g. "2026-05-23T18:42:11.000Z"
export type ISODate = string; // e.g. "2026-05-23"

export type Role = 'customer' | 'merchant';

export type Money = number; // EGP, integer or decimal — domain stays unit-agnostic
export type Quantity = number;
export type Percent = number; // 0–100

export type Audit = {
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
  readonly version: number;
};

/**
 * Optional per-request hints. Backend uses idempotencyKey for safe retries;
 * mocks ignore it but accept it for interface symmetry.
 */
export type RequestContext = {
  readonly idempotencyKey?: string;
  readonly signal?: AbortSignal;
  /**
   * If true, repositories may apply state changes optimistically. The UI does
   * not need to await the promise to see the new state. On failure, the
   * implementation rolls back automatically and rejects the promise.
   */
  readonly optimistic?: boolean;
};

export type Paginated<T> = {
  readonly items: readonly T[];
  readonly nextCursor?: string;
};

export type DateRange = {
  readonly from: ISODate;
  readonly to: ISODate;
};
