import { z } from 'zod';

export const AddressLabelSchema = z.enum(['home', 'work', 'other']);
export type AddressLabel = z.infer<typeof AddressLabelSchema>;

export const AddressSchema = z.object({
  id: z.string(),
  label: AddressLabelSchema,
  street: z.string(),
  detail: z.string().optional().default(''),
  lat: z.number().optional(),
  lng: z.number().optional(),
});
export type Address = z.infer<typeof AddressSchema>;

export const AddressInputSchema = AddressSchema.omit({ id: true });
export type AddressInput = z.infer<typeof AddressInputSchema>;
