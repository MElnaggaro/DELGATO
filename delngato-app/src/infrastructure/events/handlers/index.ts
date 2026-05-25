import type { Container } from '@/infrastructure/container';
import { installToastHandlers } from './toasts';
import { installHapticHandlers } from './haptics';
import { installAnalyticsHandlers } from './analytics';
import { installPushHandlers } from './push';
import { installNotificationHandlers } from './notifications';
import { installPaymentLifecycleHandler } from './paymentLifecycle';
import { installCartSyncHandler } from './cartSync';

/**
 * Idempotent one-shot installer. Call once at app boot (after the container
 * has been built and the platform store has hydrated).
 */
export function installEventHandlers(container: Container): void {
  installToastHandlers();
  installHapticHandlers();
  installAnalyticsHandlers();
  installPushHandlers();
  installNotificationHandlers(container);
  installPaymentLifecycleHandler();
  installCartSyncHandler();
}
