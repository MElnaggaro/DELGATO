import type { Channel, Unsubscribe } from './common';

export type RealtimeStatus = 'connected' | 'connecting' | 'offline';

/**
 * The realtime port. Mock and WebSocket implementations both satisfy this
 * interface. Repositories — not UI — subscribe to channels and forward
 * incoming state into the platform store.
 */
export interface RealtimeClient {
  subscribe<T = unknown>(channel: Channel, handler: (msg: T) => void): Unsubscribe;
  /** Mock convenience; HTTP impl is a no-op. */
  publish?(channel: Channel, payload: unknown): void;
  status(): RealtimeStatus;
}
