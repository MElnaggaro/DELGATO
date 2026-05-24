import type { Audit, Id } from './common';

export type StaffPerm =
  | 'orders'
  | 'products'
  | 'analytics'
  | 'staff'
  | 'settings';

export type Staff = Audit & {
  readonly id: Id;
  readonly storeId: Id;
  readonly name: string;
  readonly phone: string;
  readonly role: string; // "Manager", "Cashier", "Prep lead", "Stock manager"
  readonly perms: readonly StaffPerm[];
  readonly active: boolean;
  readonly isOwner: boolean;
};

export type UpsertStaffInput = Omit<
  Staff,
  'id' | 'createdAt' | 'updatedAt' | 'version'
> & {
  readonly id?: Id;
};
