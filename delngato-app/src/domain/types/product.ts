import type { Audit, Id, Money, Quantity } from './common';

export type ProductAvailability = 'available' | 'low' | 'out' | 'archived';

export type Product = Audit & {
  readonly id: Id;
  readonly storeId: Id;
  readonly name: string;
  readonly sub: string;
  readonly categoryId: Id | null;
  readonly price: Money;
  readonly cost?: Money;
  readonly stock: Quantity;
  readonly hue: string;
  readonly availability: ProductAvailability;
  readonly soldToday: number;
  readonly sku?: string;
  readonly tag?: string;
  readonly section?: string;
  readonly modifierGroupIds: readonly Id[];
};
