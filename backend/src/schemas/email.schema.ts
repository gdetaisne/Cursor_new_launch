import { z } from 'zod';

export const sendEmailSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  folderId: z.string().optional(),
  type: z.string().optional(),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;

