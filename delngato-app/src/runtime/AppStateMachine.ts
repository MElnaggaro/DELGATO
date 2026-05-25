/**
 * AppStateMachine — canonical runtime state of the app.
 *
 * Source of truth for the RoutingResolver. Pure module, no React. Subscribers
 * are notified after every transition; the routing layer translates the
 * current state into a route.
 *
 * Phase 1 introduces the machine but does not yet drive navigation in
 * production: `featureFlags.runtimeV2` gates whether RouteGuard acts on
 * transitions. Until the flag flips, the machine still receives boot events
 * (so its state stays meaningful for telemetry / future use), but the
 * existing flag tree in `app/index.tsx` retains routing authority.
 *
 * See `DELGATO_CANONICAL_FLOW_SPEC.md` § 2 for the canonical state model.
 */

import type { Role } from '@/domain/types/common';

// ─── State union ─────────────────────────────────────────────────────

export type AppStateTag =
  | 'UNKNOWN'
  | 'BOOTING'
  | 'HYDRATING'
  | 'FIRST_RUN'
  | 'UNAUTHENTICATED'
  | 'AUTH_OTP_PENDING'
  | 'ROLE_SELECTION_REQUIRED'
  | 'PROFILE_SETUP_REQUIRED'
  | 'ADDRESS_SETUP_REQUIRED'
  | 'MERCHANT_SETUP_REQUIRED'
  | 'MERCHANT_KYC_PENDING'
  | 'MERCHANT_SUSPENDED'
  | 'READY'
  | 'SESSION_EXPIRED'
  | 'OFFLINE_DEGRADED'
  | 'FATAL';

export type AppState =
  | { tag: 'UNKNOWN' }
  | { tag: 'BOOTING' }
  | { tag: 'HYDRATING' }
  | { tag: 'FIRST_RUN' }
  | { tag: 'UNAUTHENTICATED' }
  | { tag: 'AUTH_OTP_PENDING'; phone: string; role: Role; resendInSec: number }
  | { tag: 'ROLE_SELECTION_REQUIRED'; availableRoles: readonly Role[] }
  | { tag: 'PROFILE_SETUP_REQUIRED'; role: Role; missingFields: readonly string[] }
  | { tag: 'ADDRESS_SETUP_REQUIRED' }
  | { tag: 'MERCHANT_SETUP_REQUIRED'; missingFields: readonly string[] }
  | { tag: 'MERCHANT_KYC_PENDING' }
  | { tag: 'MERCHANT_SUSPENDED' }
  | { tag: 'READY'; role: Role }
  | { tag: 'SESSION_EXPIRED'; returnTo?: string }
  | { tag: 'OFFLINE_DEGRADED'; previous: AppState }
  | { tag: 'FATAL'; code: string; recoverable: boolean };

// ─── Events ──────────────────────────────────────────────────────────

export type AppEvent =
  | { type: 'boot.start' }
  | { type: 'boot.hydrate' }
  | { type: 'hydrate.complete'; resolved: AppState }
  | { type: 'onboarding.intro_dismissed' }
  | { type: 'auth.otp_requested'; phone: string; role: Role }
  | { type: 'auth.otp_verified'; resolved: AppState }
  | { type: 'auth.cancelled' }
  | { type: 'auth.signed_out' }
  | { type: 'role.selected'; role: Role; resolved: AppState }
  | { type: 'role.switch_requested' }
  | { type: 'address.completed' }
  | { type: 'profile.completed' }
  | { type: 'merchant.setup_completed' }
  | { type: 'session.expired'; returnTo?: string }
  | { type: 'network.offline' }
  | { type: 'network.online' }
  | { type: 'fatal'; code: string; recoverable: boolean };

// ─── Transition table ────────────────────────────────────────────────
//
// Conservative: any event not explicitly handled for the current state is
// ignored (returns null). This keeps the machine deterministic and easy to
// test, and lets BootSequence drive transitions without screens fighting it.

function transition(current: AppState, event: AppEvent): AppState | null {
  // Universal transitions (apply from any state)
  switch (event.type) {
    case 'session.expired':
      return event.returnTo != null
        ? { tag: 'SESSION_EXPIRED', returnTo: event.returnTo }
        : { tag: 'SESSION_EXPIRED' };
    case 'network.offline':
      if (current.tag === 'OFFLINE_DEGRADED') return null;
      return { tag: 'OFFLINE_DEGRADED', previous: current };
    case 'network.online':
      if (current.tag === 'OFFLINE_DEGRADED') return current.previous;
      return null;
    case 'fatal':
      return { tag: 'FATAL', code: event.code, recoverable: event.recoverable };
    default:
      break;
  }

  // State-specific transitions
  switch (current.tag) {
    case 'UNKNOWN':
      if (event.type === 'boot.start') return { tag: 'BOOTING' };
      return null;

    case 'BOOTING':
      if (event.type === 'boot.hydrate') return { tag: 'HYDRATING' };
      return null;

    case 'HYDRATING':
      if (event.type === 'hydrate.complete') return event.resolved;
      return null;

    case 'FIRST_RUN':
      if (event.type === 'onboarding.intro_dismissed') {
        return { tag: 'ROLE_SELECTION_REQUIRED', availableRoles: ['customer', 'merchant'] };
      }
      return null;

    case 'UNAUTHENTICATED':
      if (event.type === 'auth.otp_requested') {
        return { tag: 'AUTH_OTP_PENDING', phone: event.phone, role: event.role, resendInSec: 60 };
      }
      return null;

    case 'AUTH_OTP_PENDING':
      if (event.type === 'auth.otp_verified') return event.resolved;
      if (event.type === 'auth.cancelled') return { tag: 'UNAUTHENTICATED' };
      return null;



    case 'ROLE_SELECTION_REQUIRED':
      if (event.type === 'role.selected') return event.resolved;
      return null;

    case 'ADDRESS_SETUP_REQUIRED':
      if (event.type === 'address.completed') return { tag: 'READY', role: 'customer' };
      return null;

    case 'PROFILE_SETUP_REQUIRED':
      if (event.type === 'profile.completed') return { tag: 'READY', role: current.role };
      return null;

    case 'MERCHANT_SETUP_REQUIRED':
      if (event.type === 'merchant.setup_completed') return { tag: 'READY', role: 'merchant' };
      return null;

    case 'READY':
      if (event.type === 'auth.signed_out') return { tag: 'UNAUTHENTICATED' };
      if (event.type === 'role.switch_requested') {
        return { tag: 'ROLE_SELECTION_REQUIRED', availableRoles: ['customer', 'merchant'] };
      }
      if (event.type === 'role.selected') return event.resolved;
      return null;

    case 'SESSION_EXPIRED':
      if (event.type === 'auth.otp_verified') return event.resolved;
      if (event.type === 'auth.signed_out') return { tag: 'UNAUTHENTICATED' };
      return null;

    default:
      return null;
  }
}

// ─── Singleton store ─────────────────────────────────────────────────

type Listener = (state: AppState) => void;

let current: AppState = { tag: 'UNKNOWN' };
const listeners = new Set<Listener>();

export function getAppState(): AppState {
  return current;
}

export function subscribeAppState(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function dispatchAppEvent(event: AppEvent): AppState {
  const next = transition(current, event);
  if (next == null) return current;
  if (next === current) return current;
  current = next;
  for (const l of listeners) {
    try {
      l(current);
    } catch (e) {
      if (__DEV__) console.warn('[AppStateMachine] listener threw:', e);
    }
  }
  return current;
}

/** Test-only: reset to UNKNOWN and clear listeners. */
export function _resetAppStateForTests(): void {
  current = { tag: 'UNKNOWN' };
  listeners.clear();
}
