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
  /**
   * Register the device's push token with the backend. Called once on
   * app boot after permission is granted. The backend uses this to target
   * push notifications to this specific device.
   *
   * Phase 9: added for push token registration.
   */
  registerDevice(userId: Id, token: string, platform: 'ios' | 'android' | 'web'): Promise<void>;
}
