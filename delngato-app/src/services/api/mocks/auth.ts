import type { RequestOtpResponse, User, VerifyOtpResponse } from '../schemas/auth';

/**
 * Mock OTP semantics for the dev/demo build:
 *   - Any phone passing regex (E.164 EG: +20 1[0-2,5] xxxxxxxx) "succeeds".
 *   - Code "123456" is intentionally treated as INVALID so the error state is testable.
 *   - Any other 6-digit code "succeeds".
 *
 * Real backend will replace this — the contract (Zod schemas) stays identical.
 */

export const MOCK_DEMO_INVALID_CODE = '123456';

export function mockRequestOtp(phone: string): RequestOtpResponse {
  return {
    requestId: `mock-req-${phone.slice(-4)}-${Date.now()}`,
    expiresIn: 30,
  };
}

export function mockVerifyOtp(phone: string, code: string): VerifyOtpResponse | null {
  if (code === MOCK_DEMO_INVALID_CODE) return null;
  const user: User = { id: `mock-user-${phone.slice(-4)}`, phone, roles: ['customer', 'merchant'] };
  return {
    sessionToken: `mock-token-${user.id}-${Date.now()}`,
    user,
  };
}
