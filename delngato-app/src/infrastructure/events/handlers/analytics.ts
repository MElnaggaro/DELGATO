/**
 * Analytics handler. No-op today; wired to an analytics SDK in production.
 * Kept as a closed observable list so the team can audit event names.
 */

import { bus } from '../EventBus';

let installed = false;

export function installAnalyticsHandlers(): void {
  if (installed) return;
  installed = true;

  bus.on('order.placed', (e: any) => {
    if (__DEV__) console.log('[analytics]', e.type, { orderId: e.orderId, storeId: e.storeId });
  });
  bus.on('role.switched', (e: any) => {
    if (__DEV__) console.log('[analytics]', e.type, { from: e.from, to: e.to });
  });
}
