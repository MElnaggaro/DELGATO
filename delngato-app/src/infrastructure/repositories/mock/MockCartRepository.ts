/**
 * In-memory mock of the CartRepository.
 *
 * Reads the platform store directly: product current price + availability,
 * store open + accepting orders, promotion still active by code.
 *
 * Stock is intentionally not modelled here (the mock Product entity has a
 * `stock` field but the customer-side flow currently treats it as ≥items).
 * A `stock-insufficient` diff is only emitted when product.stock is defined
 * and lower than the requested quantity.
 */

import type {
  CartLineDiff,
  CartRepository,
  CartRevalidationResult,
  RevalidateCartInput,
} from '@/domain/repositories';
import { usePlatformStore } from '@/domain/stores/platform';

import type { LatencyEngine } from '@/infrastructure/seed/LatencyEngine';

export class MockCartRepository implements CartRepository {
  constructor(private readonly latency: LatencyEngine) {}

  async revalidate(input: RevalidateCartInput): Promise<CartRevalidationResult> {
    await this.latency.sleep('read');
    const state = usePlatformStore.getState();
    const store = state.stores[input.storeId];
    const diffs: CartLineDiff[] = [];

    if (!store) {
      return { ok: false, diffs, shopBlock: { kind: 'shop-not-found' } };
    }
    if (store.tempClose !== null || !store.open) {
      return { ok: false, diffs, shopBlock: { kind: 'shop-closed' } };
    }
    if (!store.acceptingOrders) {
      return { ok: false, diffs, shopBlock: { kind: 'not-accepting' } };
    }

    for (const line of input.items) {
      const product = state.products[line.productId];
      if (!product || product.availability === 'archived' || product.availability === 'out') {
        diffs.push({
          kind: 'unavailable',
          productId: line.productId,
          productName: product?.name ?? '—',
        });
        continue;
      }
      if (product.price !== line.capturedPrice) {
        diffs.push({
          kind: 'price-changed',
          productId: line.productId,
          previousPrice: line.capturedPrice,
          currentPrice: product.price,
        });
      }
      // Stock is tracked but customer cart treats only positive numbers as a
      // hard limit; the merchant marks `availability` to drive UX-level
      // unavailability for soft limits.
      if (product.stock > 0 && product.stock < line.qty) {
        diffs.push({
          kind: 'stock-insufficient',
          productId: line.productId,
          available: product.stock,
          requested: line.qty,
        });
      }
    }

    let promoBlock: CartRevalidationResult['promoBlock'];
    if (input.appliedPromoCode) {
      const code = input.appliedPromoCode;
      const promo = Object.values(state.promotions).find(
        (p) => p.code.toLowerCase() === code.toLowerCase(),
      );
      const now = Date.now();
      if (!promo) {
        promoBlock = { kind: 'promo-invalid', code };
      } else if (promo.status !== 'active') {
        promoBlock = { kind: 'promo-expired', code };
      } else if (new Date(promo.endsAt).getTime() < now) {
        promoBlock = { kind: 'promo-expired', code };
      } else if (new Date(promo.startsAt).getTime() > now) {
        promoBlock = { kind: 'promo-invalid', code };
      }
    }

    const ok = diffs.length === 0 && !promoBlock;
    const out: CartRevalidationResult = {
      ok,
      diffs,
      ...(promoBlock ? { promoBlock } : {}),
    };
    return out;
  }
}
