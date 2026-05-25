/**
 * NotificationBootstrap — DISABLED for prototype mode.
 *
 * Notification listeners are fully stubbed out to prevent unstable startup
 * crashes in the prototype. Will be re-enabled for production backend integration.
 */

export async function initNotificationListeners(): Promise<void> {
  // Prototype mode: notification bootstrap disabled entirely.
  if (__DEV__) console.log('[NotificationBootstrap] Disabled in prototype mode');
}
