import { z } from 'zod';

import { AddressLabelSchema } from '@/services/api/schemas/address';

export const AddressFormSchema = z.object({
  label: AddressLabelSchema.default('home'),
  street: z.string().min(2),
  detail: z.string().optional().default(''),
});
export type AddressFormValues = z.infer<typeof AddressFormSchema>;
