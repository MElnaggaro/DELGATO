/**
 * Production realtime client. Stub in Phase 0 — activated alongside HTTP
 * repositories per § 17 of the blueprint.
 */

import type { Channel, Unsubscribe } from '@/domain/repositories/common';
import type { RealtimeClient, RealtimeStatus } from '@/domain/repositories/RealtimeClient';
import { NotImplementedError } from '@/domain/errors';

export class WebSocketRealtimeClient implements RealtimeClient {
  constructor(private readonly url: string) {
    void this.url;
  }

  subscribe<T = unknown>(_channel: Channel, _handler: (msg: T) => void): Unsubscribe {
    throw new NotImplementedError('WebSocketRealtimeClient.subscribe');
  }

  publish(_channel: Channel, _payload: unknown): void {
    throw new NotImplementedError('WebSocketRealtimeClient.publish');
  }

  status(): RealtimeStatus {
    return 'offline';
  }
}
