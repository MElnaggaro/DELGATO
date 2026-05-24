import type {
  Cart,
  Id,
  ISODateTime,
  Money,
  Percent,
  Promotion,
  PromotionKind,
  PromoValidation,
} from '@/domain/types';
import type { RequestContext } from './common';

export type PromotionFilter = {
  readonly status?: ReadonlyArray<Promotion['status']>;
};

export type UpsertPromotionInput = {
  readonly id?: Id;
  readonly storeId: Id;
  readonly code: string;
  readonly kind: PromotionKind;
  readonly value: Percent | Money;
  readonly title: string;
  readonly sub: string;
  readonly startsAt: ISODateTime;
  readonly endsAt: ISODateTime;
  readonly cap?: number;
};

export interface PromotionRepository {
  list(filter?: PromotionFilter, ctx?: RequestContext): Promise<readonly Promotion[]>;
  byCode(code: string, ctx?: RequestContext): Promise<Promotion | null>;
  byStore(storeId: Id, ctx?: RequestContext): Promise<readonly Promotion[]>;
  upsert(input: UpsertPromotionInput, ctx?: RequestContext): Promise<Promotion>;
  toggle(id: Id, active: boolean, ctx?: RequestContext): Promise<Promotion>;
  delete(id: Id, ctx?: RequestContext): Promise<void>;
  validate(
    code: string,
    ctx: { readonly cart: Cart; readonly storeId: Id },
  ): Promise<PromoValidation>;
}
