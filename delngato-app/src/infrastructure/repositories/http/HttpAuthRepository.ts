import type { AuthRepository } from '@/domain/repositories';
import type { AuthSession, OtpChallenge, RegisterInput, Role } from '@/domain/types';
import { unimplemented } from './_stub';

export class HttpAuthRepository implements AuthRepository {
  constructor(private readonly _api: unknown) {
    void this._api;
  }
  requestOtp(_input: { phone: string; role: Role }): Promise<OtpChallenge> {
    return unimplemented('HttpAuthRepository.requestOtp');
  }
  verifyOtp(_input: { phone: string; code: string; role: Role }): Promise<AuthSession> {
    return unimplemented('HttpAuthRepository.verifyOtp');
  }
  register(_input: RegisterInput): Promise<AuthSession> {
    return unimplemented('HttpAuthRepository.register');
  }
  signOut(_role: Role): Promise<void> {
    return unimplemented('HttpAuthRepository.signOut');
  }
  refresh(_role: Role): Promise<AuthSession> {
    return unimplemented('HttpAuthRepository.refresh');
  }
  currentSession(_role: Role): Promise<AuthSession | null> {
    return unimplemented('HttpAuthRepository.currentSession');
  }
}
