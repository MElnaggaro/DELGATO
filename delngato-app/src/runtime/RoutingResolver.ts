/**
 * RoutingResolver — pure function from AppState (+ context) to a route.
 *
 * This is the single source of routing truth once `featureFlags.runtimeV2`
 * flips ON. Screens MUST NOT call `router.replace` based on their own derived
 * logic; they emit events to the AppStateMachine instead.
 *
 * Phase 1 ships this dormant (RouteGuard does not act when the flag is OFF).
 * The initial resolver is intentionally **bit-identical** to the existing
 * splash flag tree in `app/index.tsx` so the eventual flag flip in Phase 3 is
 * a no-op for end users. TODO comments mark where the canonical UX from
 * `DELGATO_CANONICAL_FLOW_SPEC.md` § 5.2 diverges (welcome-for-all-unauthed,
 * unified merchant/customer welcome, etc.) and will be reconciled in later
 * phases once the supporting screens land.
 */

import type { AppState } from './AppStateMachine';

/**
 * Inputs the resolver needs that aren't carried in AppState itself. These
 * come from the existing feature stores (addresses, settings, auth) at the
 * call site so the resolver remains pure.
 */
export type ResolverContext = {
  readonly hasAuthenticatedBefore: boolean;
  readonly hasCompletedOnboarding: boolean;
  readonly hasAddresses: boolean;
};

/**
 * Route shape. `path` matches Expo Router's typed Href surface; we keep it as
 * a plain string here to avoid coupling the runtime to expo-router types.
 * The caller (`RouteGuard`) does the actual `router.replace(path)`.
 */
export type Route = {
  readonly path: string;
  /** Optional modal flag — Phase 9 (session-expired) uses this. */
  readonly presentation?: 'modal' | 'card';
};

const SPLASH: Route = { path: '/' };
const INTRO: Route = { path: '/(onboarding)/intro' };
const WELCOME: Route = { path: '/(onboarding)/welcome' };
const AUTH: Route = { path: '/(onboarding)/auth' };
const OTP: Route = { path: '/(onboarding)/otp' };
const LOCATION_PERMISSION: Route = { path: '/(onboarding)/location-permission' };
const HOME: Route = { path: '/(tabs)/home' };

export function resolve(state: AppState, ctx: ResolverContext): Route {
  switch (state.tag) {
    case 'UNKNOWN':
    case 'BOOTING':
    case 'HYDRATING':
      return SPLASH;

    case 'FIRST_RUN':
      return INTRO;

    case 'UNAUTHENTICATED':
      // Returning user: route straight to auth. First-time user past intro: welcome.
      if (ctx.hasAuthenticatedBefore || ctx.hasCompletedOnboarding) {
        return AUTH;
      }
      return WELCOME;

    case 'AUTH_OTP_PENDING':
      return OTP;


    case 'ROLE_SELECTION_REQUIRED':
      // Phase 8 ships /(auth)/role.tsx. Until then, the resolver should never
      // see this state in production (no UI emits role.switch_requested yet).
      return { path: '/(auth)/role' };

    case 'ADDRESS_SETUP_REQUIRED':
      // Mirrors current behaviour: the splash routes authed-no-address users
      // to location-permission, which leads into address-setup on grant.
      return LOCATION_PERMISSION;

    case 'PROFILE_SETUP_REQUIRED':
      // Phase 8 surface — no equivalent today (registration collects name in-line).
      // Fallback to auth so we never strand the user on an unknown route.
      return AUTH;

    case 'MERCHANT_SETUP_REQUIRED':
      return { path: '/(onboarding)/merchant-setup' };

    case 'MERCHANT_KYC_PENDING':
      return { path: '/(merchant)/kyc-pending' };

    case 'MERCHANT_SUSPENDED':
      return { path: '/(merchant)/suspended' };

    case 'READY':
      if (state.role === 'merchant') return { path: '/(merchant)/(tabs)/dashboard' };
      // Customer ready: per current behaviour, route to home tabs. Address
      // and biometric gating happens BEFORE READY (see hydrate resolution).
      return HOME;

    case 'SESSION_EXPIRED':
      return { path: '/_modals/session-expired', presentation: 'modal' as const };

    case 'OFFLINE_DEGRADED':
      // Don't navigate; OFFLINE shows a banner over the previous route.
      return resolve(state.previous, ctx);

    case 'FATAL':
      return { path: '/_error' };
  }
}

/**
 * Helper used by BootSequence: derive the post-hydration AppState from the
 * current values of the existing feature stores. Mirrors today's splash tree
 * decisions exactly so v2-on and v2-off produce the same target route.
 */
export function resolveHydratedState(input: {
  readonly authed: boolean;
  readonly hasAuthenticatedBefore: boolean;
  readonly hasCompletedOnboarding: boolean;
  readonly hasAddresses: boolean;
  readonly activeRole: 'customer' | 'merchant';
}): AppState {
  if (input.authed) {
    // Merchants bypass address gate — they operate from a fixed location.
    if (input.activeRole === 'customer' && !input.hasAddresses) {
      return { tag: 'ADDRESS_SETUP_REQUIRED' };
    }
    return { tag: 'READY', role: input.activeRole };
  }
  if (input.hasAuthenticatedBefore || input.hasCompletedOnboarding) {
    return { tag: 'UNAUTHENTICATED' };
  }
  return { tag: 'FIRST_RUN' };
}
