import type { ReviewRepository } from '@/domain/repositories';
import type { CreateReviewInput, Id, Review, ReviewFilter } from '@/domain/types';
import { NotFoundError, ValidationError } from '@/domain/errors';
import { usePlatformStore } from '@/domain/stores/platform';
import { selectReviewsByStore } from '@/domain/selectors';

import type { LatencyEngine } from '@/infrastructure/seed/LatencyEngine';
import { bus } from '@/infrastructure/events';
import { bumpAudit, genId, newAudit, nowISO } from './_support';

export class MockReviewRepository implements ReviewRepository {
  constructor(private readonly latency: LatencyEngine) {}

  async byStore(storeId: Id, filter?: ReviewFilter): Promise<readonly Review[]> {
    await this.latency.sleep('read');
    let rows = selectReviewsByStore(usePlatformStore.getState(), storeId);
    if (filter?.unrespondedOnly) rows = rows.filter((r) => r.response === null);
    if (filter?.maxStars !== undefined) rows = rows.filter((r) => r.stars <= filter.maxStars!);
    return rows;
  }

  async create(input: CreateReviewInput): Promise<Review> {
    await this.latency.sleep('write');
    if (input.body.trim().length < 1) {
      throw new ValidationError({ body: 'لازم تكتب تعليق' });
    }
    const id = genId('rev');
    const review: Review = { ...newAudit(), id, ...input, response: null };
    usePlatformStore.getState().applyReview(review);
    bus.emit({ type: 'review.created', reviewId: id, storeId: input.storeId });
    return review;
  }

  async respond(id: Id, body: string): Promise<Review> {
    await this.latency.sleep('write');
    if (body.trim().length < 5) {
      throw new ValidationError({ body: 'الرد قصير أوي' });
    }
    const state = usePlatformStore.getState();
    const prev = state.reviews[id];
    if (!prev) throw new NotFoundError('Review', id);
    const next: Review = {
      ...prev,
      response: { body, respondedAt: nowISO(), respondedByUserId: 'merchant-owner-abuhassan' },
      ...bumpAudit(prev),
    };
    state.applyReview(next);
    bus.emit({ type: 'review.responded', reviewId: id });
    return next;
  }
}
