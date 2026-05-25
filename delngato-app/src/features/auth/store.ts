import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import {
  clearRoleSessionToken,
  clearSessionToken,
  clearSessionV2,
  getSessionToken,
  getSessionV2,
  migrateSessionV1ToV2,
  setRoleSessionToken,
  setSessionToken,
  setSessionV2,
  zustandAsyncStorage,
  type SessionRole,
  type SessionV2,
} from '@/services/storage';
import { setSignOutHandler, setTokenGetter } from '@/services/api/client';
import { signOut as signOutRemote } from '@/services/api/endpoints/authClient';
import type { User } from '@/services/api/schemas/auth';
import { useRoleStore } from '@/features/role/store';
import { bus } from '@/infrastructure/events';
import { dispatchAppEvent } from '@/runtime/AppStateMachine';

type State = {
  authed: boolean;
  phone: string;
  user: User | null;
  /** In-memory mirror of the active-role's token from SecureStore. Never persisted to AsyncStorage. */
  sessionToken: string | null;
  /** Sticky flag: true once the user has ever successfully signed in. Survives sign-out. */
  hasAuthenticatedBefore: boolean;
  /** Active role. Mirrors `useRoleStore.activeRole`; auth store is the persistence layer. */
  activeRole: SessionRole;
};

type Actions = {
  setPhone: (phone: string) => void;
  setSession: (token: string, user: User, role?: SessionRole) => Promise<void>;
  /** Restore in-memory mirror from SecureStore on app boot. Idempotent. */
  hydrateSession: () => Promise<void>;
  signOut: () => Promise<void>;
  /**
   * Switch the active role for a multi-role user. Persists to the unified
   * session blob, mirrors into useRoleStore, and emits `role.switched`. The
   * caller is responsible for the actual route change (RoutingResolver
   * picks up the new role on next event tick).
   */
  setActiveRole: (role: SessionRole) => Promise<void>;
};

const initialState: State = {
  authed: false,
  phone: '',
  user: null,
  sessionToken: null,
  hasAuthenticatedBefore: false,
  activeRole: 'customer',
};

export const useAuthStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initialState,
      setPhone: (phone) => set({ phone }),
      setSession: async (token, user, role = 'customer') => {
        // Legacy slot: keep writing so any code that still reads it stays consistent.
        await setSessionToken(token);
        await setRoleSessionToken(role, token);
        // v2 blob: merge existing tokens (multi-role users) with the new one.
        const prev = await getSessionV2();
        const tokens = {
          ...(prev?.tokens ?? {}),
          [role]: token,
        };
        const v2: SessionV2 = {
          userId: user.id,
          activeRole: role,
          ...(prev?.lastActiveRole ? { lastActiveRole: prev.lastActiveRole } : {}),
          tokens,
          issuedAt: new Date().toISOString(),
        };
        await setSessionV2(v2);
        useRoleStore.getState().setFromSession(role);
        set({
          authed: true,
          sessionToken: token,
          user,
          hasAuthenticatedBefore: true,
          activeRole: role,
        });
      },
      hydrateSession: async () => {
        // 1) Migrate legacy split keys → v2 blob (idempotent, non-destructive).
        const v2 = await migrateSessionV1ToV2();
        if (v2) {
          const token = v2.tokens[v2.activeRole] ?? null;
          useRoleStore.getState().setFromSession(v2.activeRole);
          set({
            sessionToken: token,
            authed: token != null,
            activeRole: v2.activeRole,
            hasAuthenticatedBefore: token != null || get().hasAuthenticatedBefore,
          });
          return;
        }
        // 2) Fallback for very old builds: legacy single-token key, no v2 yet.
        const token = await getSessionToken();
        if (token) set({ sessionToken: token, authed: true });
      },
      signOut: async () => {
        try {
          await signOutRemote();
        } catch {
          /* swallow — sign out should still clear local state */
        }
        await Promise.all([
          clearSessionToken(),
          clearRoleSessionToken('customer'),
          clearRoleSessionToken('merchant'),
          clearSessionV2(),
        ]);
        // Preserve hasAuthenticatedBefore so the splash treats this as a returning user
        // and skips the first-time onboarding/welcome.
        useRoleStore.getState().setFromSession('customer');
        set((s) => ({
          ...initialState,
          hasAuthenticatedBefore: s.hasAuthenticatedBefore,
        }));
        dispatchAppEvent({ type: 'auth.signed_out' });
      },
      setActiveRole: async (role) => {
        const prevRole = get().activeRole;
        if (prevRole === role) return;
        const v2 = await getSessionV2();
        if (!v2) {
          // No session yet — record the preference in-memory but don't write
          // a half-baked session blob.
          useRoleStore.getState().switchRole(role);
          set({ activeRole: role });
          return;
        }
        if (!v2.tokens[role]) {
          // The caller asked to switch to a role this user doesn't hold a
          // token for. Surface as a no-op; UI should not offer the switch.
          if (__DEV__) console.warn(`[auth.setActiveRole] no token for role=${role}`);
          return;
        }
        const next: SessionV2 = {
          ...v2,
          activeRole: role,
          lastActiveRole: prevRole,
        };
        await setSessionV2(next);
        useRoleStore.getState().switchRole(role);
        set({ activeRole: role, sessionToken: v2.tokens[role] ?? null });
        bus.emit({ type: 'role.switched', from: prevRole, to: role });
        dispatchAppEvent({
          type: 'role.selected',
          role,
          resolved: { tag: 'READY', role },
        });
      },
    }),
    {
      name: 'delngato.auth',
      storage: createJSONStorage(() => zustandAsyncStorage),
      // Only persist non-sensitive fields. Tokens live in SecureStore.
      partialize: (s) => ({
        authed: s.authed,
        phone: s.phone,
        user: s.user,
        hasAuthenticatedBefore: s.hasAuthenticatedBefore,
        activeRole: s.activeRole,
      }),
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
