import type {
  CreateNotificationInput,
  Id,
  Notification,
  Role,
} from '@/domain/types';
import type { RequestContext, Unsubscribe } from './common';

export interface NotificationRepository {
  list(userId: Id, role: Role, ctx?: RequestContext): Promise<readonly Notification[]>;
  markAllRead(userId: Id, role: Role, ctx?: RequestContext): Promise<void>;
  markRead(id: Id, ctx?: RequestContext): Promise<void>;
  create(input: CreateNotificationInput, ctx?: RequestContext): Promise<Notification>;
  subscribe(
    userId: Id,
    role: Role,
    onChange: (n: readonly Notification[]) => void,
  ): Unsubscribe;
}
