/**
 * Notification selectors over the canonical platform store.
 *
 * Phase 5 introduces these as the new read path. The existing
 * `useOrdersStore.notifications` array continues to work for screens that
 * haven't migrated yet — Phase 9 wires the realtime subscription that fills
 * the platform store's notifications slice and swaps consumers over.
 */

import { usePlatformStore } from '@/domain/stores/platform';
import { useAuthStore } from '@/features/auth/store';
import type { Id, Notification } from '@/domain/types';

function resolveUserId(explicit?: Id): Id | null {
  if (explicit) return explicit;
  return useAuthStore.getState().user?.id ?? null;
}

export function useNotificationsForUser(userId?: Id): readonly Notification[] {
  return usePlatformStore((s) => {
    const id = resolveUserId(userId);
    if (!id) return [];
    return Object.values(s.notifications)
      .filter((n) => n.userId === id)
      .sort((a, b) => (a.ts < b.ts ? 1 : -1));
  });
}

export function useUnreadCount(userId?: Id): number {
  return usePlatformStore((s) => {
    const id = resolveUserId(userId);
    if (!id) return 0;
    let n = 0;
    for (const note of Object.values(s.notifications)) {
      if (note.userId === id && !note.read) n += 1;
    }
    return n;
  });
}
