/**
 * DeepLinkRouter — parses canonical `/_dl/...` paths into route descriptors.
 *
 * Per `DELGATO_CANONICAL_FLOW_SPEC.md` § 13.4. The router is pure: given a
 * URL string it returns a `ParsedDeepLink` (or `null` for unrecognized).
 * The actual navigation (and role-mismatch prompting) happens in
 * `ResponseListener` consuming the parsed result.
 *
 * Supported paths (Phase 9 surface — additional links land alongside the
 * screens that resolve them):
 *   /_dl/order/{id}         — customer→tracking, merchant→orders detail
 *   /_dl/wallet             — customer wallet
 *   /_dl/promo/{code}       — customer cart with promo
 *   /_dl/r/{ref}            — register with referral code
 *   /_dl/merchant/orders    — merchant orders tab
 *   /_dl/merchant/payouts   — merchant payouts (Phase 9.b)
 */

import type { Role } from '@/domain/types/common';

export type ParsedDeepLink = {
  /** Canonical app path. Caller passes this to `router.push/replace`. */
  readonly path: string;
  /** Optional role this link targets; ResponseListener prompts on mismatch. */
  readonly requireRole?: Role;
  /** Whether the user must be authed for this link. */
  readonly requireAuth: boolean;
  /** Optional query params to pass alongside the path. */
  readonly params?: Readonly<Record<string, string>>;
};

const DL_PREFIX = '/_dl/';

/**
 * Parse a raw URL (push tap, deep-link, Linking.getInitialURL) into a
 * canonical link descriptor, or null if it's not a recognized deep link.
 *
 * Accepts both absolute URLs (`delgato://_dl/order/123`,
 * `https://delgato.app/_dl/order/123`) and bare app paths (`/_dl/order/123`).
 */
export function parseDeepLink(rawUrl: string): ParsedDeepLink | null {
  if (!rawUrl) return null;

  // Extract path component, handling scheme-prefixed URLs and bare paths.
  let path: string;
  try {
    if (rawUrl.startsWith('/')) {
      path = rawUrl;
    } else {
      const url = new URL(rawUrl);
      path = url.pathname || '/';
    }
  } catch {
    return null;
  }

  if (!path.startsWith(DL_PREFIX)) return null;
  const rest = path.slice(DL_PREFIX.length);
  const segments = rest.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const [head, ...tail] = segments;
  switch (head) {
    case 'order': {
      const id = tail[0];
      if (!id) return null;
      // Customer side. Merchant side gets a separate `/_dl/merchant/orders/{id}` link.
      return {
        path: '/tracking',
        requireAuth: true,
        requireRole: 'customer',
        params: { orderId: id },
      };
    }
    case 'wallet':
      return { path: '/wallet', requireAuth: true, requireRole: 'customer' };
    case 'promo': {
      const code = tail[0];
      if (!code) return null;
      return {
        path: '/cart',
        requireAuth: true,
        requireRole: 'customer',
        params: { promo: code },
      };
    }
    case 'r': {
      const ref = tail[0];
      if (!ref) return null;
      return {
        path: '/(onboarding)/register',
        requireAuth: false,
        params: { ref },
      };
    }
    case 'merchant': {
      const sub = tail[0];
      if (sub === 'orders') {
        const id = tail[1];
        return id
          ? {
              path: '/(merchant)/(tabs)/orders',
              requireAuth: true,
              requireRole: 'merchant',
              params: { orderId: id },
            }
          : {
              path: '/(merchant)/(tabs)/orders',
              requireAuth: true,
              requireRole: 'merchant',
            };
      }
      if (sub === 'payouts') {
        return {
          path: '/(merchant)/payouts',
          requireAuth: true,
          requireRole: 'merchant',
        };
      }
      if (sub === 'dashboard') {
        return {
          path: '/(merchant)/(tabs)/dashboard',
          requireAuth: true,
          requireRole: 'merchant',
        };
      }
      return null;
    }
    default:
      return null;
  }
}
