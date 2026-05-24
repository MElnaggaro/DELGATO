import type {
  CreateReviewInput,
  Id,
  Review,
  ReviewFilter,
} from '@/domain/types';
import type { RequestContext } from './common';

export interface ReviewRepository {
  byStore(
    storeId: Id,
    filter?: ReviewFilter,
    ctx?: RequestContext,
  ): Promise<readonly Review[]>;
  create(input: CreateReviewInput, ctx?: RequestContext): Promise<Review>;
  respond(id: Id, body: string, ctx?: RequestContext): Promise<Review>;
}
