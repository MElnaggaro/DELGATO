import { Platform } from 'react-native';

/**
 * Thin wrapper. Only used for genuinely sensitive bits: session token,
 * card tokenization IDs. NEVER store PAN, CVV, or expiry locally — those
 * are tokenized at the gateway and never leave there.
 *
 * On web, falls back to sessionStorage (non-persistent, tab-scoped).
 */

const SESSION_KEY = 'delngato.sessionToken';

export async function getSessionToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return globalThis.sessionStorage?.getItem(SESSION_KEY) ?? null;
    }
    const SecureStore = await import('expo-secure-store');
    return await SecureStore.getItemAsync(SESSION_KEY);
  } catch {
    return null;
  }
}

export async function setSessionToken(token: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      globalThis.sessionStorage?.setItem(SESSION_KEY, token);
      return;
    }
    const SecureStore = await import('expo-secure-store');
    await SecureStore.setItemAsync(SESSION_KEY, token);
  } catch {
    // SecureStore can fail on some Android variants — degrade gracefully.
  }
}

export async function clearSessionToken(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      globalThis.sessionStorage?.removeItem(SESSION_KEY);
      return;
    }
    const SecureStore = await import('expo-secure-store');
    await SecureStore.deleteItemAsync(SESSION_KEY);
  } catch {
    /* noop */
  }
}
