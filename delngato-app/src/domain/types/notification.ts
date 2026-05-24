import type { Audit, Id, ISODateTime, Role } from './common';

export type NotificationIcon =
  | 'bike'
  | 'tag'
  | 'check'
  | 'store'
  | 'info'
  | 'package'
  | 'wallet'
  | 'star'
  | 'alert';

export type NotificationAccent = 'olive' | 'gold' | 'issue';

export type NotificationKind =
  | 'order'
  | 'stock'
  | 'review'
  | 'campaign'
  | 'ops'
  | 'payout'
  | 'wallet'
  | 'support';

export type Notification = Audit & {
  readonly id: Id;
  readonly userId: Id;
  readonly role: Role;
  readonly icon: NotificationIcon;
  readonly title: string;
  readonly body: string;
  readonly ts: ISODateTime;
  readonly read: boolean;
  readonly accent: NotificationAccent;
  readonly kind: NotificationKind;
  readonly deepLink?: string;
  readonly payload?: Readonly<Record<string, unknown>>;
};

export type CreateNotificationInput = Omit<
  Notification,
  'id' | 'createdAt' | 'updatedAt' | 'version' | 'read'
> & {
  readonly read?: boolean;
};
