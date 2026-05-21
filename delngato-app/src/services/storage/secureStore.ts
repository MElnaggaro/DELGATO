import * as SecureStore from 'expo-secure-store';

/**
 * Thin wrapper. Only used for genuinely sensitive bits: session token,
 * card tokenization IDs. NEVER store PAN, CVV, or expiry locally — those
 * are tokenized at the gateway and never leave there.
 */

const SESSION_KEY = 'delngato.sessionToken';

export async function getSessionToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SESSION_KEY);
  } catch {
    return null;
  }
}

export async function setSessionToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(SESSION_KEY, token);
  } catch {
    // SecureStore can fail on some Android variants — degrade gracefully.
  }
}

export async function clearSessionToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  } catch {
    /* noop */
  }
}
