import type { Id, ISODateTime, Role } from './common';

export type AuthSession = {
  readonly role: Role;
  readonly userId: Id;
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly issuedAt: ISODateTime;
  readonly expiresAt?: ISODateTime;
};

export type OtpChallenge = {
  readonly phone: string;
  readonly role: Role;
  /** Resend cooldown in seconds. */
  readonly resendInSec: number;
};

export type RegisterInput = {
  readonly role: Role;
  readonly phone: string;
  readonly name: string;
  readonly email?: string;
  readonly password?: string;
};
