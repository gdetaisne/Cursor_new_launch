import { z } from 'zod';

const frenchPhoneRegex = /^(\+33|0)[1-9]\d{8}$/;

export const createClientSchema = z.object({
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(frenchPhoneRegex, "Invalid French phone number"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const updateClientSchema = createClientSchema.partial();

export const anonymizeClientSchema = z.object({
  clientId: z.string().uuid("Invalid client ID"),
  reason: z.string().min(1, "Reason is required for RGPD compliance"),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type AnonymizeClientInput = z.infer<typeof anonymizeClientSchema>;

