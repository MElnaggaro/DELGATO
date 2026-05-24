import type { Id, Notification, Role } from '@/domain/types';
import type { usePlatformStore } from '@/domain/stores/platform';

type State = ReturnType<typeof usePlatformStore.getState>;

export const selectNotificationsByUser = (
  s: State,
  userId: Id,
  role: Role,
): readonly Notification[] =>
  Object.values(s.notifications)
    .filter((n) => n.userId === userId && n.role === role)
    .sort((a, b) => (a.ts < b.ts ? 1 : -1));

export const selectUnreadCount = (s: State, userId: Id, role: Role): number =>
  selectNotificationsByUser(s, userId, role).reduce((n, x) => n + (x.read ? 0 : 1), 0);
