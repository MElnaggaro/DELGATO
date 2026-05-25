import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  phone: z.string(),
  displayName: z.string().optional(),
  roles: z.array(z.enum(['customer', 'merchant'])).default(['customer']),
});
export type User = z.infer<typeof UserSchema>;

export const RequestOtpResponseSchema = z.object({
  requestId: z.string(),
  expiresIn: z.number(),
});
export type RequestOtpResponse = z.infer<typeof RequestOtpResponseSchema>;

export const VerifyOtpResponseSchema = z.object({
  sessionToken: z.string(),
  user: UserSchema,
});
export type VerifyOtpResponse = z.infer<typeof VerifyOtpResponseSchema>;
