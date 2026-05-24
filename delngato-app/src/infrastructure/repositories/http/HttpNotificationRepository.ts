import type { NotificationRepository } from '@/domain/repositories';
import type { CreateNotificationInput, Id, Notification, Role } from '@/domain/types';
import type { Unsubscribe } from '@/domain/repositories/common';
import { unimplemented } from './_stub';

export class HttpNotificationRepository implements NotificationRepository {
  constructor(private readonly _api: unknown) { void this._api; }
  list(_u: Id, _r: Role): Promise<readonly Notification[]> { return unimplemented('HttpNotificationRepository.list'); }
  markAllRead(_u: Id, _r: Role): Promise<void> { return unimplemented('HttpNotificationRepository.markAllRead'); }
  markRead(_id: Id): Promise<void> { return unimplemented('HttpNotificationRepository.markRead'); }
  create(_i: CreateNotificationInput): Promise<Notification> { return unimplemented('HttpNotificationRepository.create'); }
  subscribe(_u: Id, _r: Role, _h: (n: readonly Notification[]) => void): Unsubscribe {
    unimplemented('HttpNotificationRepository.subscribe');
  }
}
