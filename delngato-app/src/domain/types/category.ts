import type { Audit, Id } from './common';

export type Category = Audit & {
  readonly id: Id;
  readonly storeId: Id;
  readonly name: string;
  readonly count: number;
  readonly icon?: string;
  readonly visible: boolean;
  readonly order: number;
};
