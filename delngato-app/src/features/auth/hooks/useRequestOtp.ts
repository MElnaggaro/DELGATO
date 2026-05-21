import { useMutation } from '@tanstack/react-query';

import { requestOtp } from '@/services/api/endpoints/authClient';

import { useAuthStore } from '../store';

/**
 * Triggers the OTP request and stashes the E.164 phone in the auth store
 * so the OTP screen can render it back to the user.
 */
export function useRequestOtp() {
  const setPhone = useAuthStore((s) => s.setPhone);
  return useMutation({
    mutationFn: async (phoneE164: string) => {
      setPhone(phoneE164);
      return requestOtp(phoneE164);
    },
  });
}
