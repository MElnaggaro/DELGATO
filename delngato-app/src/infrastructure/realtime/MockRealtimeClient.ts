/**
 * In-process realtime simulator.
 *
 * Mirrors what the production `WebSocketRealtimeClient` will provide:
 *  - `subscribe(channel, handler)` — register a listener.
 *  - `publish(channel, payload)` — send a message (mock-only convenience).
 *  - `status()` — connection health.
 *
 * In addition, the mock owns a private 1s tick driver that simulates time-
 * driven server behaviour (order countdown, SLA auto-rejection, scheduled
 * promotion activation, driver ETA progression). Tick is invisible to the
 * rest of the app: repositories subscribe to the same channels they would
 * subscribe to against a real WebSocket.
 */

import { AppState, type AppStateStatus } from 'react-native';

import type { Channel, Unsubscribe } from '@/domain/repositories/common';
import type { RealtimeClient, RealtimeStatus } from '@/domain/repositories/RealtimeClient';

type Handler = (msg: unknown) => void;
type TickHook = (now: number) => void;

const TICK_MS = 1000;

export class MockRealtimeClient implements RealtimeClient {
  private handlers: Map<Channel, Set<Handler>> = new Map();
  private tickHooks: Set<TickHook> = new Set();
  private timer: ReturnType<typeof setInterval> | null = null;
  private lastTickTs: number = Date.now();
  private appStateSub: { remove(): void } | null = null;

  start(): void {
    if (this.timer) return;
    this.lastTickTs = Date.now();
    this.timer = setInterval(this.tickOnce, TICK_MS);
    this.appStateSub = AppState.addEventListener('change', this.onAppStateChange);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.appStateSub?.remove();
    this.appStateSub = null;
  }

  subscribe<T = unknown>(channel: Channel, handler: (msg: T) => void): Unsubscribe {
    let set = this.handlers.get(channel);
    if (!set) {
      set = new Set();
      this.handlers.set(channel, set);
    }
    set.add(handler as Handler);
    return () => {
      set?.delete(handler as Handler);
      if (set?.size === 0) this.handlers.delete(channel);
    };
  }

  publish(channel: Channel, payload: unknown): void {
    const set = this.handlers.get(channel);
    if (!set) return;
    for (const h of set) {
      try {
        h(payload);
      } catch (e) {
        if (__DEV__) console.warn('[MockRealtimeClient] handler threw:', e);
      }
    }
  }

  status(): RealtimeStatus {
    return this.timer ? 'connected' : 'offline';
  }

  /**
   * Repositories register tick hooks so the mock can drive countdowns and
   * auto-transitions. The OrderRepository decrements `Order.timerSec`; the
   * PromotionRepository activates scheduled promos here; etc.
   */
  registerTickHook(hook: TickHook): Unsubscribe {
    this.tickHooks.add(hook);
    return () => {
      this.tickHooks.delete(hook);
    };
  }

  private tickOnce = (): void => {
    const now = Date.now();
    this.lastTickTs = now;
    for (const hook of this.tickHooks) {
      try {
        hook(now);
      } catch (e) {
        if (__DEV__) console.warn('[MockRealtimeClient] tick hook threw:', e);
      }
    }
  };

  private onAppStateChange = (status: AppStateStatus): void => {
    if (status === 'active') {
      // Catch up: run a tick now so timers don't appear frozen.
      const now = Date.now();
      const missedSec = Math.floor((now - this.lastTickTs) / TICK_MS);
      if (missedSec > 0 && missedSec < 60 * 60) {
        // Replay up to one hour of missed ticks; longer than that, just one.
        const replays = Math.min(missedSec, 60);
        for (let i = 0; i < replays; i++) this.tickOnce();
      } else {
        this.tickOnce();
      }
      this.start();
    } else if (status === 'background' || status === 'inactive') {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }
  };
}
