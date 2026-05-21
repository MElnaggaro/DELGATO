import { useMutation } from '@tanstack/react-query';

import { verifyOtp, InvalidOtpError } from '@/services/api/endpoints/authClient';

import { useAuthStore } from '../store';

/**
 * Verifies the OTP. On success, hydrates the auth store + writes the session
 * token to SecureStore. Throws InvalidOtpError on bad code so screens can
 * branch on `error instanceof InvalidOtpError`.
 */
export function useVerifyOtp() {
  const phone = useAuthStore((s) => s.phone);
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: async (code: string) => {
      const r = await verifyOtp(phone, code);
      await setSession(r.sessionToken, r.user);
      return r;
    },
  });
}

export { InvalidOtpError };
