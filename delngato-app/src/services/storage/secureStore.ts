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

export type SessionRole = 'customer' | 'merchant';
const ROLE_KEYS: Record<SessionRole, string> = {
  customer: SESSION_KEY,
  merchant: 'delngato.sessionToken.merchant',
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
