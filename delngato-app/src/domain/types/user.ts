import type { Audit, Id, Role } from './common';

/**
 * Identity primitives.
 *
 * A real human may hold both a Customer and a Merchant identity — they are
 * separate domain records with independent sessions and KYC paths.
 */

export type User = Audit & {
  readonly id: Id;
  readonly name: string;
  readonly phone: string;
  readonly email?: string;
  readonly avatar?: string;
  readonly roles: readonly Role[]; // which sides this user has registered on
};

export type Customer = User & {
  readonly walletId: Id;
  readonly addressIds: readonly Id[];
  readonly loyaltyTier?: 'bronze' | 'silver' | 'gold';
};

export type MerchantKycStatus = 'pending' | 'verified' | 'rejected';

export type Merchant = User & {
  readonly storeId: Id;
  readonly kycStatus: MerchantKycStatus;
  readonly payoutAccountId?: Id;
};
