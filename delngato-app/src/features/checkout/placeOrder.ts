/**
 * placeOrder — single helper used by checkout.tsx, payment.tsx, and
 * wallet-pay.tsx to commit an order.
 *
 * Phase 6: eliminated the hardcoded `DLN-٢٠٤٧` order ID and the
 * destructive side-effects previously living in `order-success.tsx`.
 * Phase 6.b (this revision): now drives the canonical pipeline. Calls
 * `OrderRepository.place(...)` which:
 *   - inserts the Order into the platform store (with a real ID + timeline)
 *   - emits `order.placed` on the bus
 *   - exercises the SLA timer + auto-reject path in `MockOrderRepository.tick`
 *
 * The legacy `useOrdersStore.addOrder` is still invoked so the customer's
 * orders tab keeps rendering during the migration window — Phase 7+ will
 * remove that mirror once tabs/orders.tsx reads from the platform store.
 *
 * The mock layer takes ~400-1200ms simulated latency; callers should show
 * a loading state.
 */

import { getContainer } from '@/infrastructure/container';
import { useAuthStore } from '@/features/auth/store';
import { useCartStore } from '@/features/cart/store';
import { useAddressStore } from '@/features/addresses/store';
import type { Id, Money, Order, OrderItem, PaymentMethod } from '@/domain/types';
import { DEMO_CUSTOMER } from '@/infrastructure/seed/seedData';

const DELIVERY_FEE = 10;

export type PlaceOrderInput = {
  readonly paymentMethod: PaymentMethod;
};

export type PlaceOrderResult = {
  readonly orderId: string;
};

export type PlaceOrderWithCardInput = {
  /** Opaque card token from the card form / PSP SDK. */
  readonly cardToken: string;
};

type PlacementContext = {
  readonly customerId: Id;
  readonly storeId: Id;
  readonly orderItems: readonly OrderItem[];
  readonly subtotal: Money;
  readonly total: Money;
  readonly address: string;
  readonly customerName: string;
  readonly customerPhone: string;
  readonly tip: Money;
  readonly note?: string;
  readonly promoCode?: string;
  readonly itemCount: number;
  readonly firstShopName: string;
};

function buildContext(): PlacementContext | null {
  const cart = useCartStore.getState();
  if (cart.items.length === 0) return null;
  const first = cart.items[0]!;
  const auth = useAuthStore.getState();
  const addresses = useAddressStore.getState();
  const selected =
    addresses.list.find((a) => a.id === addresses.selectedId) ?? addresses.list[0] ?? null;
  const orderItems: OrderItem[] = cart.items.map((it) => ({
    productId: it.id,
    name: it.name,
    sub: it.sub,
    qty: it.qty,
    unitPrice: it.price,
    subtotal: it.qty * it.price,
  }));
  const subtotal = orderItems.reduce((acc, i) => acc + i.subtotal, 0);
  const total = subtotal + DELIVERY_FEE + cart.tip;
  return {
    customerId: auth.user?.id ?? DEMO_CUSTOMER.id,
    storeId: first.shopId,
    orderItems,
    subtotal,
    total,
    address: selected
      ? `${selected.street}${selected.detail ? ` · ${selected.detail}` : ''}`
      : '—',
    customerName: auth.user?.displayName ?? DEMO_CUSTOMER.name,
    customerPhone: auth.user?.phone ?? DEMO_CUSTOMER.phone,
    tip: cart.tip,
    ...(cart.deliveryNote ? { note: cart.deliveryNote } : {}),
    ...(cart.appliedPromo ? { promoCode: cart.appliedPromo.code } : {}),
    itemCount: cart.items.reduce((acc, i) => acc + i.qty, 0),
    firstShopName: first.shop,
  };
}

async function validateAvailability(ctx: PlacementContext) {
  const container = getContainer();
  const productIds = ctx.orderItems.map((i) => i.productId);
  const checks = await container.productRepo.checkAvailability(productIds);
  const unavailable = checks.filter((c: { productId: string; available: boolean }) => !c.available);
  if (unavailable.length > 0) {
    throw new Error('Some items are no longer available: ' + unavailable.map((u: { productId: string; available: boolean }) => u.productId).join(', '));
  }
}

async function commit(
  ctx: PlacementContext,
  payment: PaymentMethod,
  idempotencyKey: string,
  paymentRef?: string,
): Promise<Order> {
  await validateAvailability(ctx);
  const container = getContainer();
  return container.orderRepo.place({
    storeId: ctx.storeId,
    customerId: ctx.customerId,
    items: ctx.orderItems,
    subtotal: ctx.subtotal,
    deliveryFee: DELIVERY_FEE,
    tip: ctx.tip,
    discount: 0,
    payment,
    ...(paymentRef ? { paymentRef } : {}),
    address: ctx.address,
    distanceKm: 2.4,
    customerName: ctx.customerName,
    customerPhone: ctx.customerPhone,
    ...(ctx.note ? { note: ctx.note } : {}),
    ...(ctx.promoCode ? { promoCode: ctx.promoCode } : {}),
    idempotencyKey,
  });
}

/**
 * Commit the current cart as an order. Async — caller awaits while the
 * repository runs (mock latency 400-1200ms; real backend tbd).
 *
 * Returns `null` if the cart is empty (caller should not navigate to
 * `/order-success`). Throws if the repository rejects — caller should
 * surface the error and let the user retry without forcing a re-place.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult | null> {
  const ctx = buildContext();
  if (!ctx) return null;
  const idempotencyKey = `draft-${ctx.customerId}-${ctx.subtotal}-${ctx.itemCount}-${Date.now()}`;
  const order = await commit(ctx, input.paymentMethod, idempotencyKey);
  useCartStore.getState().clear();
  return { orderId: order.id };
}

/**
 * Card path: authorize the payment first, then place the order with the auth
 * ref attached. If authorization is declined, no order is created — the user
 * stays on the payment screen and sees the PSP error.
 */
export async function placeOrderWithCard(
  input: PlaceOrderWithCardInput,
): Promise<PlaceOrderResult | null> {
  const ctx = buildContext();
  if (!ctx) return null;
  const container = getContainer();
  // Synthetic draft order ref so PaymentRepository.authorize's idempotency
  // key is stable across a single attempt (deterministic from cart hash).
  const draftRef = `draft-${ctx.customerId}-${ctx.subtotal}-${ctx.itemCount}`;
  await container.paymentRepo.authorize({ cardToken: input.cardToken }, ctx.total, draftRef);
  const order = await commit(ctx, 'card', draftRef, draftRef);
  useCartStore.getState().clear();
  return { orderId: order.id };
}

/**
 * Wallet path: hold the funds, then place the order. If the place call
 * fails for any reason, release the hold so we don't leave reserved funds
 * dangling on the user's balance.
 */
export async function placeOrderWithWallet(): Promise<PlaceOrderResult | null> {
  const ctx = buildContext();
  if (!ctx) return null;
  const container = getContainer();
  const hold = await container.walletRepo.hold(ctx.customerId, ctx.total);
  try {
    const draftRef = `draft-wallet-${ctx.customerId}-${ctx.subtotal}-${ctx.itemCount}-${Date.now()}`;
    const order = await commit(ctx, 'wallet', draftRef, hold.id);
    useCartStore.getState().clear();
    return { orderId: order.id };
  } catch (e) {
    await container.walletRepo.releaseHold(hold.id).catch(() => {
      /* best-effort */
    });
    throw e;
  }
}
