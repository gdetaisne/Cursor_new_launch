import { z } from 'zod';

/**
 * Schema for creating/updating email draft
 */
export const emailDraftSchema = z.object({
  to: z.array(z.string().email()).min(1, 'Au moins un destinataire requis'),
  cc: z.array(z.string().email()).optional().default([]),
  bcc: z.array(z.string().email()).optional().default([]),
  subject: z.string().min(1, 'Le sujet est requis'),
  bodyHtml: z.string().min(1, 'Le contenu est requis'),
  folderId: z.string().uuid().optional(),
  inReplyToId: z.string().uuid().optional(),
});

export type EmailDraftInput = z.infer<typeof emailDraftSchema>;

/**
 * Schema for listing drafts
 */
export const listDraftsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  folderId: z.string().uuid().optional(),
});

/**
 * Schema for sending draft
 */
export const sendDraftSchema = z.object({
  draftId: z.string().uuid(),
});

