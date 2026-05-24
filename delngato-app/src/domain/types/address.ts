import type { Audit, Id } from './common';

export type Address = Audit & {
  readonly id: Id;
  readonly userId: Id;
  readonly label: string;
  readonly icon: string;
  readonly street: string;
  readonly detail: string;
  readonly lat?: number;
  readonly lng?: number;
  readonly isDefault: boolean;
};

export type AddAddressInput = Omit<
  Address,
  'id' | 'createdAt' | 'updatedAt' | 'version'
>;
