import type { Id, Money, Percent, Product, Quantity } from '@/domain/types';
import type { RequestContext, Unsubscribe } from './common';

export type ProductFilter = {
  readonly availability?: ReadonlyArray<Product['availability']>;
  readonly categoryId?: Id | null;
  readonly search?: string;
};

export type UpsertProductInput = {
  readonly id?: Id;
  readonly storeId: Id;
  readonly name: string;
  readonly sub: string;
  readonly categoryId: Id | null;
  readonly price: Money;
  readonly cost?: Money;
  readonly stock: Quantity;
  readonly hue: string;
  readonly modifierGroupIds?: readonly Id[];
  readonly tag?: string;
  readonly section?: string;
};

export type BulkPriceDirection = 'up' | 'down';
export type BulkPriceMode = 'percent' | 'flat';

export type BulkPriceInput = {
  readonly storeId: Id;
  readonly direction: BulkPriceDirection;
  readonly mode: BulkPriceMode;
  readonly value: Money | Percent;
  readonly scope: { readonly kind: 'all' } | { readonly kind: 'category'; readonly categoryId: Id };
};

export type AvailabilityCheckItem = {
  readonly productId: Id;
  readonly available: boolean;
  readonly reason?: 'out_of_stock' | 'archived' | 'store_closed';
};

export interface ProductRepository {
  list(filter?: ProductFilter, ctx?: RequestContext): Promise<readonly Product[]>;
  byId(id: Id, ctx?: RequestContext): Promise<Product | null>;
  byStore(storeId: Id, filter?: ProductFilter, ctx?: RequestContext): Promise<readonly Product[]>;
  upsert(input: UpsertProductInput, ctx?: RequestContext): Promise<Product>;
  archive(id: Id, ctx?: RequestContext): Promise<Product>;
  duplicate(id: Id, ctx?: RequestContext): Promise<Product>;
  setStock(id: Id, n: Quantity, ctx?: RequestContext): Promise<Product>;
  bulkAdjustPrice(input: BulkPriceInput, ctx?: RequestContext): Promise<readonly Product[]>;
  subscribeByStore(storeId: Id, onChange: (products: readonly Product[]) => void): Unsubscribe;
  /** POST /api/v1/products/check-availability — lightweight batch check */
  checkAvailability(
    productIds: readonly Id[],
    ctx?: RequestContext,
  ): Promise<readonly AvailabilityCheckItem[]>;
}
