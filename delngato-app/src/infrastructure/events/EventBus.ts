/**
 * Typed event bus. Side-effects only.
 *
 * Hard rule (lint-enforced): `bus.emit(...)` may only be called from
 * `src/infrastructure/**`. UI subscribes via `useEventBus` (in shared hooks).
 * Stores never subscribe to events — that would create cycles between the
 * canonical state and its derived reactions.
 */

import type { DomainEvent, EventHandler, EventType } from './types';

type Handlers = Map<EventType, Set<EventHandler>>;

const handlers: Handlers = new Map();

function on<E extends DomainEvent>(type: E['type'], handler: EventHandler<E>): () => void {
  let set = handlers.get(type);
  if (!set) {
    set = new Set();
    handlers.set(type, set);
  }
  set.add(handler as EventHandler);
  return () => {
    set?.delete(handler as EventHandler);
    if (set?.size === 0) handlers.delete(type);
  };
}

function emit(event: DomainEvent): void {
  const set = handlers.get(event.type);
  if (!set) return;
  for (const h of set) {
    try {
      void h(event);
    } catch (e) {
      if (__DEV__) console.warn('[EventBus] handler threw for', event.type, e);
    }
  }
}

function clear(): void {
  handlers.clear();
}

export const bus = { on, emit, clear };
