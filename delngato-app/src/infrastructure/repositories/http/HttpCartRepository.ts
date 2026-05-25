import type {
  CartRepository,
  CartRevalidationResult,
  RevalidateCartInput,
} from '@/domain/repositories';
import { unimplemented } from './_stub';

export class HttpCartRepository implements CartRepository {
  constructor(private readonly _api: unknown) { void this._api; }
  revalidate(_i: RevalidateCartInput): Promise<CartRevalidationResult> {
    return unimplemented('HttpCartRepository.revalidate');
  }
}
