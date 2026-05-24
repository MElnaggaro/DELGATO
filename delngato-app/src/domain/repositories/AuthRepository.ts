import type { AuthSession, OtpChallenge, RegisterInput, Role } from '@/domain/types';

export interface AuthRepository {
  requestOtp(input: { phone: string; role: Role }): Promise<OtpChallenge>;
  verifyOtp(input: { phone: string; code: string; role: Role }): Promise<AuthSession>;
  register(input: RegisterInput): Promise<AuthSession>;
  signOut(role: Role): Promise<void>;
  refresh(role: Role): Promise<AuthSession>;
  /** Returns the persisted session for the given role, or null if absent. */
  currentSession(role: Role): Promise<AuthSession | null>;
}
