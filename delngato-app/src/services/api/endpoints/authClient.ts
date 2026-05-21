import { API_MODE } from '../config';
import { http } from '../client';
import { mockDelay } from '../delay';
import { mockRequestOtp, mockVerifyOtp } from '../mocks/auth';
import {
  RequestOtpResponseSchema,
  VerifyOtpResponseSchema,
  type RequestOtpResponse,
  type VerifyOtpResponse,
} from '../schemas/auth';

export async function requestOtp(phoneE164: string): Promise<RequestOtpResponse> {
  if (API_MODE === 'mock') {
    await mockDelay(380, 720);
    return RequestOtpResponseSchema.parse(mockRequestOtp(phoneE164));
  }
  const { data } = await http.post('/auth/otp/request', { phone: phoneE164 });
  return RequestOtpResponseSchema.parse(data);
}

export class InvalidOtpError extends Error {
  constructor() {
    super('INVALID_OTP');
    this.name = 'InvalidOtpError';
  }
}

export async function verifyOtp(phoneE164: string, code: string): Promise<VerifyOtpResponse> {
  if (API_MODE === 'mock') {
    await mockDelay(280, 540);
    const result = mockVerifyOtp(phoneE164, code);
    if (!result) throw new InvalidOtpError();
    return VerifyOtpResponseSchema.parse(result);
  }
  const { data } = await http.post('/auth/otp/verify', { phone: phoneE164, code });
  return VerifyOtpResponseSchema.parse(data);
}

export async function signOut(): Promise<void> {
  if (API_MODE === 'mock') {
    await mockDelay(120, 240);
    return;
  }
  await http.post('/auth/signout');
}
