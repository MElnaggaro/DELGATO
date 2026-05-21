import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { zustandAsyncStorage, clearSessionToken, setSessionToken, getSessionToken } from '@/services/storage';
import { setSignOutHandler, setTokenGetter } from '@/services/api/client';
import { signOut as signOutRemote } from '@/services/api/endpoints/authClient';
import type { User } from '@/services/api/schemas/auth';

type State = {
  authed: boolean;
  phone: string;
  user: User | null;
  /** In-memory mirror of the token in SecureStore — never persisted to AsyncStorage. */
  sessionToken: string | null;
};

type Actions = {
  setPhone: (phone: string) => void;
  setSession: (token: string, user: User) => Promise<void>;
  /** Restore in-memory mirror from SecureStore on app boot. */
  hydrateSession: () => Promise<void>;
  signOut: () => Promise<void>;
};

const initialState: State = {
  authed: false,
  phone: '',
  user: null,
  sessionToken: null,
};

export const useAuthStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initialState,
      setPhone: (phone) => set({ phone }),
      setSession: async (token, user) => {
        await setSessionToken(token);
        set({ authed: true, sessionToken: token, user });
      },
      hydrateSession: async () => {
        const token = await getSessionToken();
        if (token) set({ sessionToken: token, authed: true });
      },
      signOut: async () => {
        try {
          await signOutRemote();
        } catch {
          /* swallow — sign out should still clear local state */
        }
        await clearSessionToken();
        set({ ...initialState });
      },
    }),
    {
      name: 'delngato.auth',
      storage: createJSONStorage(() => zustandAsyncStorage),
      // Only persist non-sensitive fields. Token lives in SecureStore.
      partialize: (s) => ({ authed: s.authed, phone: s.phone, user: s.user }),
    },
  ),
);

/**
 * Wire the auth store into the axios client. Call once at app boot
 * (e.g. from app/_layout.tsx) so the client knows where to get the token
 * and how to react to 401/403.
 */
export function wireAuthIntoApiClient() {
  setTokenGetter(() => useAuthStore.getState().sessionToken);
  setSignOutHandler(() => {
    void useAuthStore.getState().signOut();
  });
}
