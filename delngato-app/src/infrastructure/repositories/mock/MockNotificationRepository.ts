import type { NotificationRepository } from '@/domain/repositories';
import type { CreateNotificationInput, Id, Notification, Role } from '@/domain/types';
import { usePlatformStore } from '@/domain/stores/platform';
import { selectNotificationsByUser } from '@/domain/selectors';
import type { Unsubscribe } from '@/domain/repositories/common';

import type { LatencyEngine } from '@/infrastructure/seed/LatencyEngine';
import type { MockRealtimeClient } from '@/infrastructure/realtime/MockRealtimeClient';
import { channels } from '@/infrastructure/realtime/channels';
import { bus } from '@/infrastructure/events';
import { bumpAudit, genId, newAudit } from './_support';

export class MockNotificationRepository implements NotificationRepository {
  constructor(
    private readonly latency: LatencyEngine,
    private readonly realtime: MockRealtimeClient,
  ) {}

  async list(userId: Id, role: Role): Promise<readonly Notification[]> {
    await this.latency.sleep('read');
    return selectNotificationsByUser(usePlatformStore.getState(), userId, role);
  }

  async markAllRead(userId: Id, role: Role): Promise<void> {
    await this.latency.sleep('write');
    const state = usePlatformStore.getState();
    for (const n of selectNotificationsByUser(state, userId, role)) {
      if (!n.read) state.applyNotification({ ...n, read: true, ...bumpAudit(n) });
    }
  }

  async markRead(id: Id): Promise<void> {
    await this.latency.sleep('write');
    const state = usePlatformStore.getState();
    const n = state.notifications[id];
    if (n && !n.read) state.applyNotification({ ...n, read: true, ...bumpAudit(n) });
  }

  async create(input: CreateNotificationInput): Promise<Notification> {
    await this.latency.sleep('write');
    const id = genId('notif');
    const n: Notification = {
      ...newAudit(),
      id,
      userId: input.userId,
      role: input.role,
      icon: input.icon,
      title: input.title,
      body: input.body,
      ts: input.ts,
      read: input.read ?? false,
      accent: input.accent,
      kind: input.kind,
      ...(input.deepLink ? { deepLink: input.deepLink } : {}),
      ...(input.payload ? { payload: input.payload } : {}),
    };
    usePlatformStore.getState().applyNotification(n);
    bus.emit({ type: 'notification.created', notificationId: id, userId: input.userId });
    return n;
  }

  subscribe(
    userId: Id,
    role: Role,
    onChange: (n: readonly Notification[]) => void,
  ): Unsubscribe {
    const stopStore = usePlatformStore.subscribe(
      (s) => s.notifications,
      () => onChange(selectNotificationsByUser(usePlatformStore.getState(), userId, role)),
      { fireImmediately: true },
    );
    const stopChannel = this.realtime.subscribe(
      channels.notificationsByUser(userId, role),
      () => onChange(selectNotificationsByUser(usePlatformStore.getState(), userId, role)),
    );
    return () => {
      stopStore();
      stopChannel();
    };
  }
}
