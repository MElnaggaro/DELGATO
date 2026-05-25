import { bus } from '@/infrastructure/events';
import { getContainer } from '@/infrastructure/container';

/**
 * Payment Lifecycle Handler
 * 
 * Enforces the authorize-then-capture-on-delivery pattern:
 * - On `order.delivered`: Capture the funds from the wallet hold.
 * - On `order.cancelled` or `order.rejected`: Release the wallet hold.
 * 
 * Card payments would follow a similar pattern through PaymentRepository,
 * but for the MVP, the wallet hold is our primary stateful payment simulation.
 */
export function installPaymentLifecycleHandler(): void {
  bus.on('order.delivered', async (event: any) => {
    try {
      const container = getContainer();
      const order = await container.orderRepo.byId(event.orderId);
      if (order?.payment === 'wallet' && order.paymentRef) {
        await container.walletRepo.capture(order.paymentRef);
      }
    } catch (e) {
      if (__DEV__) console.warn('[paymentLifecycle] failed to capture wallet hold on delivery', e);
    }
  });

  const releaseHold = async (event: any) => {
    try {
      const container = getContainer();
      const order = await container.orderRepo.byId(event.orderId);
      if (order?.payment === 'wallet' && order.paymentRef) {
        await container.walletRepo.releaseHold(order.paymentRef);
      }
    } catch (e) {
      if (__DEV__) console.warn('[paymentLifecycle] failed to release wallet hold', e);
    }
  };

  bus.on('order.cancelled', releaseHold);
  bus.on('order.rejected', releaseHold);
}
