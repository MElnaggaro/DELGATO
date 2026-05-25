/**
 * RouteGuard — mounts at the app root, subscribes to AppState, and routes via
 * the RoutingResolver.
 *
 * Uses segment-based boundary compatibility: checks if the current route GROUP
 * (e.g. `(tabs)`, `(merchant)`, `(onboarding)`) is compatible with the resolved
 * state tag. This allows free tab/sub-screen navigation while preventing
 * unauthorized boundary crossings.
 */

import { useEffect } from 'react';
import { useSegments, useRouter, type Href } from 'expo-router';

import { useAppState } from './useAppState';
import { resolve, type ResolverContext } from './RoutingResolver';
import { useAuthStore } from '@/features/auth/store';
import { useSettingsStore } from '@/features/settings';
import { useAddressStore } from '@/features/addresses/store';

/**
 * Determines whether the user's current route is compatible with the resolved
 * state. If the user is browsing within an allowed route boundary, the guard
 * does NOT redirect — this prevents getting "trapped" on a single page when
 * the user navigates between tabs or sub-screens.
 */
function isRouteCompatible(stateTag: string, segments: string[]): boolean {
  const firstSegment = segments[0] ?? '';

  switch (stateTag) {
    case 'UNKNOWN':
    case 'BOOTING':
    case 'HYDRATING':
      // During boot, the splash index is the only valid location
      return firstSegment === '' || firstSegment === 'index';

    case 'FIRST_RUN':
    case 'UNAUTHENTICATED':
    case 'AUTH_OTP_PENDING':
      // Onboarding group is the valid boundary
      return firstSegment === '(onboarding)';

    case 'ROLE_SELECTION_REQUIRED':
      return firstSegment === '(auth)' || firstSegment === '(onboarding)';

    case 'ADDRESS_SETUP_REQUIRED':
    case 'PROFILE_SETUP_REQUIRED':
      return firstSegment === '(onboarding)';

    case 'MERCHANT_SETUP_REQUIRED':
    case 'MERCHANT_KYC_PENDING':
    case 'MERCHANT_SUSPENDED':
      return firstSegment === '(merchant)';

    case 'READY':
      // When READY, the user can freely browse tabs, merchant tabs, or any
      // non-onboarding screen.
      return firstSegment !== '(onboarding)';

    case 'SESSION_EXPIRED':
      // Allow modals and current position
      return firstSegment === '_modals' || firstSegment === '(tabs)' || firstSegment === '(merchant)';

    default:
      return false;
  }
}

export function RouteGuard(): null {
  const state = useAppState();
  const router = useRouter();
  const segments = useSegments();

  const hasAuthenticatedBefore = useAuthStore((s) => s.hasAuthenticatedBefore);
  const hasCompletedOnboarding = useSettingsStore((s) => s.hasCompletedOnboarding);
  const hasAddresses = useAddressStore((s) => s.list.length > 0);

  useEffect(() => {
    const ctx: ResolverContext = {
      hasAuthenticatedBefore,
      hasCompletedOnboarding,
      hasAddresses,
    };

    // Only redirect if the current route boundary is incompatible
    if (isRouteCompatible(state.tag, segments)) return;

    const route = resolve(state, ctx);

    const href = route.path as Href;
    if (route.presentation === 'modal') {
      router.push(href);
    } else {
      router.replace(href);
    }
  }, [
    state,
    router,
    segments,
    hasAuthenticatedBefore,
    hasCompletedOnboarding,
    hasAddresses,
  ]);

  return null;
}
