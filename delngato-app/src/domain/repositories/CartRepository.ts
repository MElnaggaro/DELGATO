/**
 * CartRepository — re-checks an in-memory cart against current product /
 * store / promo state before checkout.
 *
 * The cart itself lives in the customer's local Zustand store (it's a UI
 * artefact, not a server entity for MVP). This repository only validates
 * that the cart is still placeable: prices unchanged, items still available,
 * shop still open / accepting orders, applied promo still valid.
 *
 * Use case: customer adds items, the merchant edits a price or marks an item
 * unavailable, the customer hits "Place order" 30 minutes later. We need to
 * surface a diff before committing.
 */

import type { Id, Money } from '@/domain/types';
import type { CartItem } from '@/domain/types';
import type { RequestContext } from './common';

export type CartLineDiff =
  | {
      readonly kind: 'price-changed';
      readonly productId: Id;
      readonly previousPrice: Money;
      readonly currentPrice: Money;
    }
  | {
      readonly kind: 'unavailable';
      readonly productId: Id;
      readonly productName: string;
    }
  | {
      readonly kind: 'stock-insufficient';
      readonly productId: Id;
      readonly available: number;
      readonly requested: number;
    };

export type CartRevalidationResult = {
  /** True iff no diffs were detected and the shop is currently placeable. */
  readonly ok: boolean;
  readonly diffs: readonly CartLineDiff[];
  /** Populated when the shop is closed / not accepting orders. */
  readonly shopBlock?:
    | { readonly kind: 'shop-closed' }
    | { readonly kind: 'not-accepting' }
    | { readonly kind: 'shop-not-found' };
  /** Populated when the previously applied promo is no longer valid. */
  readonly promoBlock?:
    | { readonly kind: 'promo-expired'; readonly code: string }
    | { readonly kind: 'promo-invalid'; readonly code: string };
};

export type RevalidateCartInput = {
  readonly storeId: Id;
  readonly items: readonly CartItem[];
  readonly appliedPromoCode?: string;
};

export interface CartRepository {
  revalidate(input: RevalidateCartInput, ctx?: RequestContext): Promise<CartRevalidationResult>;
}
