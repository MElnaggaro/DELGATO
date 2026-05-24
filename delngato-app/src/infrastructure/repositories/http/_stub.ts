/**
 * Shared stub helper for HTTP repository implementations during Phase 0.
 *
 * Each Http*Repository class implements the full interface but every method
 * throws NotImplementedError. This locks the interface shape (CI runs
 * `tsc --noEmit` with API_MODE=http to catch drift) without forcing us to
 * implement the backend before it exists. Per § 17 of the blueprint, each
 * repository is migrated to a real HTTP implementation independently.
 */

import { NotImplementedError } from '@/domain/errors';

export function unimplemented(name: string): never {
  throw new NotImplementedError(name);
}
