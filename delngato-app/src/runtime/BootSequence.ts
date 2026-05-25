/**
 * BootSequence — orchestrates the AppStateMachine through cold-start.
 *
 * Biometric probing has been completely removed. The hydration sequence now
 * reads only auth, settings, addresses, and role stores to determine the
 * post-boot AppState.
 */

import { dispatchAppEvent, getAppState } from './AppStateMachine';
import { resolveHydratedState } from './RoutingResolver';
import { useAuthStore } from '@/features/auth/store';
import { useSettingsStore } from '@/features/settings';
import { useAddressStore } from '@/features/addresses/store';
import { useRoleStore } from '@/features/role/store';

/** Fire-once: enter BOOTING. Idempotent. */
export function startBootSequence(): void {
  if (getAppState().tag === 'UNKNOWN') {
    dispatchAppEvent({ type: 'boot.start' });
  }
}

/** Fire-once: enter HYDRATING. Idempotent. */
export function markHydratingStarted(): void {
  if (getAppState().tag === 'BOOTING') {
    dispatchAppEvent({ type: 'boot.hydrate' });
  }
}

/**
 * Called after the existing hydration finishes (fonts, i18n, session, container,
 * seed). Reads the current feature stores and dispatches `hydrate.complete`
 * with the state the resolver should land in.
 */
export async function finishHydration(): Promise<void> {
  if (getAppState().tag !== 'HYDRATING') return;

  const auth = useAuthStore.getState();
  const settings = useSettingsStore.getState();
  const addresses = useAddressStore.getState();
  const role = useRoleStore.getState();

  const resolved = resolveHydratedState({
    authed: auth.authed,
    hasAuthenticatedBefore: auth.hasAuthenticatedBefore,
    hasCompletedOnboarding: settings.hasCompletedOnboarding,
    hasAddresses: addresses.list.length > 0,
    activeRole: role.activeRole,
  });

  if (auth.user && role.activeRole === 'customer') {
    import('@/features/cart/store').then(({ useCartStore }) => {
      useCartStore.getState().hydrateForUser(auth.user!.id).catch(() => {});
    });
  }

  // Artificial delay to allow JS splash animations (app/index.tsx) to play
  // out their brand reveal sequence before RouteGuard routes away.
  await new Promise((r) => setTimeout(r, 1500));

  dispatchAppEvent({ type: 'hydrate.complete', resolved });
}
