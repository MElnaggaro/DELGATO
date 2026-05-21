import { z } from 'zod';

import { isValidEgyptianPhone } from '@/shared/utils/phone';

export const PhoneFormSchema = z.object({
  phone: z
    .string()
    .min(1, 'errors.phoneInvalid')
    .refine(isValidEgyptianPhone, 'errors.phoneInvalid'),
});
export type PhoneFormValues = z.infer<typeof PhoneFormSchema>;

export const OtpFormSchema = z.object({
  code: z.string().length(6, 'errors.otpInvalid').regex(/^\d{6}$/, 'errors.otpInvalid'),
});
export type OtpFormValues = z.infer<typeof OtpFormSchema>;
