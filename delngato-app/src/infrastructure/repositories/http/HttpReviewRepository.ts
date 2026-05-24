import type { ReviewRepository } from '@/domain/repositories';
import type { CreateReviewInput, Id, Review, ReviewFilter } from '@/domain/types';
import { unimplemented } from './_stub';

export class HttpReviewRepository implements ReviewRepository {
  constructor(private readonly _api: unknown) { void this._api; }
  byStore(_s: Id, _f?: ReviewFilter): Promise<readonly Review[]> { return unimplemented('HttpReviewRepository.byStore'); }
  create(_i: CreateReviewInput): Promise<Review> { return unimplemented('HttpReviewRepository.create'); }
  respond(_id: Id, _b: string): Promise<Review> { return unimplemented('HttpReviewRepository.respond'); }
}
