import type { Id, ISODateTime, Role } from './common';

export type SupportMessageFrom = 'user' | 'support';

export type SupportMessage = {
  readonly id: Id;
  readonly userId: Id;
  readonly role: Role;
  readonly from: SupportMessageFrom;
  readonly text: string;
  readonly ts: ISODateTime;
};

export type SupportMessageInput = {
  readonly userId: Id;
  readonly role: Role;
  readonly text: string;
};
