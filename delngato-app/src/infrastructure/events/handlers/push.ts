/**
 * Push handler.
 *
 * Phase 0 / dev: no-op stub. Production wires `expo-notifications` here.
 * Kept as a separate file so the swap is a single import change later.
 */

import { bus } from '../EventBus';

let installed = false;

export function installPushHandlers(): void {
  if (installed) return;
  installed = true;

  bus.on('order.placed', (e) => {
    if (__DEV__) console.log('[push:stub] order.placed', e.orderId);
  });
  bus.on('order.accepted', (e) => {
    if (__DEV__) console.log('[push:stub] order.accepted', e.orderId);
  });
}
