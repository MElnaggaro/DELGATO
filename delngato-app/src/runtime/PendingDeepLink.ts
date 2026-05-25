/**
 * PendingDeepLink — single-slot queue for deep links captured before the app
 * is in a state that can act on them.
 *
 * Phase 1 ships the API; Phase 9 wires `Linking.addEventListener` and
 * `Notifications.addNotificationResponseReceivedListener` to feed this queue
 * and consume on `READY`.
 *
 * Single-slot is intentional: a user tap is a single intent. If a second link
 * arrives before the first is consumed, the latest one wins (the older one is
 * stale by definition). If we need a true FIFO later we can swap the impl
 * without breaking callers.
 */

export type PendingLink = {
  /** Canonical `/_dl/...` path. The DeepLinkRouter (Phase 9) parses it. */
  readonly path: string;
  /** Wall-clock millis when the link was captured (for staleness diagnostics). */
  readonly capturedAt: number;
  /** Optional role hint used to gate consumption on the right shell. */
  readonly requireRole?: 'customer' | 'merchant';
};

let slot: PendingLink | null = null;

export function push(link: PendingLink): void {
  slot = link;
}

export function peek(): PendingLink | null {
  return slot;
}

export function drain(): PendingLink | null {
  const out = slot;
  slot = null;
  return out;
}

/** Test-only. */
export function _clearForTests(): void {
  slot = null;
}
