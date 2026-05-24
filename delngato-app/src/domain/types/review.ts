import type { Audit, Id, ISODateTime } from './common';

export type ReviewResponse = {
  readonly body: string;
  readonly respondedAt: ISODateTime;
  readonly respondedByUserId: Id;
};

export type Review = Audit & {
  readonly id: Id;
  readonly storeId: Id;
  readonly customerId: Id;
  readonly customerName: string;
  readonly avatar: string;
  readonly stars: number; // 1..5
  readonly ts: ISODateTime;
  readonly orderId: Id;
  readonly body: string;
  readonly tags: readonly string[];
  readonly response: ReviewResponse | null;
};

export type CreateReviewInput = Omit<
  Review,
  'id' | 'createdAt' | 'updatedAt' | 'version' | 'response'
>;

export type ReviewFilter = {
  readonly unrespondedOnly?: boolean;
  readonly maxStars?: number;
};
