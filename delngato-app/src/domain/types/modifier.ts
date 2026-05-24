import type { Audit, Id, Money } from './common';

export type ModifierKind = 'one' | 'multi';

export type ModifierOption = {
  readonly id: Id;
  readonly name: string;
  readonly priceDelta: Money; // may be negative
};

export type ModifierGroup = Audit & {
  readonly id: Id;
  readonly storeId: Id;
  readonly name: string;
  readonly kind: ModifierKind;
  readonly required: boolean;
  readonly options: readonly ModifierOption[];
};
