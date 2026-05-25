import { Platform } from 'react-native';

/**
 * Thin wrapper. Only used for genuinely sensitive bits: session token,
 * card tokenization IDs. NEVER store PAN, CVV, or expiry locally — those
 * are tokenized at the gateway and never leave there.
 *
 * On web, falls back to sessionStorage (non-persistent, tab-scoped).
 *
 * Per-role variants below support the merchant role landing alongside
 * customer. The legacy `getSessionToken/setSessionToken/clearSessionToken`
 * functions still target the customer slot for backwards compatibility.
 */

const SESSION_KEY = 'delngato.sessionToken';
const SESSION_V2_KEY = 'delngato.session.v2';

export type SessionRole = 'customer' | 'merchant';
const ROLE_KEYS: Record<SessionRole, string> = {
  customer: SESSION_KEY,
  merchant: 'delngato.sessionToken.merchant',
};

/**
 * Unified session blob persisted under a single SecureStore key. Holds the
 * tokens for both roles plus context the runtime needs at boot. Phase 2
 * introduces this alongside the legacy per-role keys; legacy keys are read on
 * boot (migration) and cleared after one successful v2 write.
 *
 * Persist this blob with `setSessionV2` and read it back with `getSessionV2`.
 */
export type SessionV2 = {
  readonly userId: string;
  readonly activeRole: SessionRole;
  readonly lastActiveRole?: SessionRole;
  /**
   * Per-role tokens. A user with both roles has both keys set; single-role
   * users have only their own.
   */
  readonly tokens: {
    readonly customer?: string;
    readonly merchant?: string;
  };
  readonly refreshToken?: string;
  readonly issuedAt: string;
  readonly expiresAt?: string;
};

async function _get(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return globalThis.sessionStorage?.getItem(key) ?? null;
    }
    const SecureStore = await import('expo-secure-store');
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function _set(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      globalThis.sessionStorage?.setItem(key, value);
      return;
    }
    const SecureStore = await import('expo-secure-store');
    await SecureStore.setItemAsync(key, value);
  } catch {
    // SecureStore can fail on some Android variants — degrade gracefully.
  }
}

async function _clear(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      globalThis.sessionStorage?.removeItem(key);
      return;
    }
    const SecureStore = await import('expo-secure-store');
    await SecureStore.deleteItemAsync(key);
  } catch {
    /* noop */
  }
}

// ---- Legacy customer-only API (preserved for the existing auth store) ----

export async function getSessionToken(key: string = SESSION_KEY): Promise<string | null> {
  return _get(key);
}

export async function setSessionToken(
  token: string,
  key: string = SESSION_KEY,
): Promise<void> {
  return _set(key, token);
}

export async function clearSessionToken(key: string = SESSION_KEY): Promise<void> {
  return _clear(key);
}

// ---- Per-role API (used by merchant repos and future per-role customer auth) ----

export async function getRoleSessionToken(role: SessionRole): Promise<string | null> {
  return _get(ROLE_KEYS[role]);
}

export async function setRoleSessionToken(role: SessionRole, token: string): Promise<void> {
  return _set(ROLE_KEYS[role], token);
}

export async function clearRoleSessionToken(role: SessionRole): Promise<void> {
  return _clear(ROLE_KEYS[role]);
}

// ---- Unified session blob (Phase 2+) ----

export async function getSessionV2(): Promise<SessionV2 | null> {
  const raw = await _get(SESSION_V2_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionV2;
  } catch {
    return null;
  }
}

export async function setSessionV2(session: SessionV2): Promise<void> {
  await _set(SESSION_V2_KEY, JSON.stringify(session));
}

export async function clearSessionV2(): Promise<void> {
  await _clear(SESSION_V2_KEY);
}

/**
 * One-time migration from the legacy split-key model (customer in
 * `delngato.sessionToken`, merchant in `delngato.sessionToken.merchant`) to
 * the unified v2 blob.
 *
 * Idempotent: returns the v2 session if it already exists; otherwise wraps
 * whatever legacy tokens are present into a v2 blob and persists it. Legacy
 * keys are NOT deleted on first run — they live for one release as a rollback
 * safety net (per migration plan § 4).
 *
 * Returns `null` only when no session exists in any form.
 */
export async function migrateSessionV1ToV2(): Promise<SessionV2 | null> {
  const existing = await getSessionV2();
  if (existing) return existing;

  const [customerTok, merchantTok] = await Promise.all([
    _get(ROLE_KEYS.customer),
    _get(ROLE_KEYS.merchant),
  ]);
  if (!customerTok && !merchantTok) return null;

  const activeRole: SessionRole = customerTok ? 'customer' : 'merchant';
  const tokens: SessionV2['tokens'] = {
    ...(customerTok ? { customer: customerTok } : {}),
    ...(merchantTok ? { merchant: merchantTok } : {}),
  };
  const session: SessionV2 = {
    // Pre-migration the userId is unknown locally; the unified session is
    // authoritative from this point on, so we backfill with a placeholder
    // that auth.hydrateSession can replace once it calls AuthRepository.me().
    userId: 'unknown',
    activeRole,
    tokens,
    issuedAt: new Date().toISOString(),
  };
  await setSessionV2(session);
  return session;
}
