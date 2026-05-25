/**
 * Role store — runtime active role + last active role.
 *
 * Phase 1 ships this in-memory only. Phase 2 will persist `lastActiveRole`
 * inside the unified session blob (`delgato.session.v2`) so a multi-role user
 * lands in their last shell across cold starts.
 *
 * For now there is no UI consumer (no role-selection screen, no role-switch
 * tile); the store exists so the AppStateMachine + RoutingResolver can read
 * `activeRole` once Phase 8 adds the UI.
 */

import { create } from 'zustand';

import type { Role } from '@/domain/types/common';

type State = {
  activeRole: Role;
  lastActiveRole: Role | null;
};

type Actions = {
  switchRole: (role: Role) => void;
  /** Set on session restore. Phase 2 will call this from `hydrateSession`. */
  setFromSession: (role: Role) => void;
};

export const useRoleStore = create<State & Actions>((set) => ({
  activeRole: 'customer',
  lastActiveRole: null,
  switchRole: (role) =>
    set((s) => (s.activeRole === role ? s : { activeRole: role, lastActiveRole: s.activeRole })),
  setFromSession: (role) => set({ activeRole: role }),
}));

/** Selector helper for callers that only need the current role. */
export const useActiveRole = (): Role => useRoleStore((s) => s.activeRole);
