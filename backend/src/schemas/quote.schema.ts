import { z } from 'zod';

export const createQuoteSchema = z.object({
  folderId: z.string().uuid("Invalid folder ID"),
  moverId: z.string().uuid("Invalid mover ID"),
  
  source: z.enum(['AUTO_GENERATED', 'EMAIL_PARSED', 'MANUAL']),
  
  // For AUTO_GENERATED
  pricingGridId: z.string().uuid("Invalid pricing grid ID").optional(),
  
  // For EMAIL_PARSED
  rawEmailId: z.string().optional(),
  parsedData: z.string().optional(), // JSON string
  confidenceScore: z.number().min(0).max(100).optional(),
  
  // Quote data
  totalPrice: z.number().min(0, "Price must be positive"),
  currency: z.string().length(3, "Currency must be 3 letters (e.g. EUR)").default("EUR"),
  validUntil: z.coerce.date().min(new Date(), "Valid until must be in the future"),
  
  // Details
  breakdown: z.string().optional(), // JSON string
  notes: z.string().max(2000).optional(),
});

export const updateQuoteSchema = createQuoteSchema.partial();

export const validateQuoteSchema = z.object({
  quoteId: z.string().uuid("Invalid quote ID"),
  validatedByUserId: z.string().uuid("Invalid user ID"),
  approved: z.boolean(),
  rejectionReason: z.string().max(500).optional(),
});

export const scoreQuoteSchema = z.object({
  quoteId: z.string().uuid("Invalid quote ID"),
  scorePrice: z.number().min(0).max(100),
  scoreGoogle: z.number().min(0).max(100),
  scoreFinancial: z.number().min(0).max(100),
  scoreLitigations: z.number().min(0).max(100).optional(),
});

export const remindQuoteSchema = z.object({
  quoteId: z.string().uuid("Invalid quote ID"),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
export type ValidateQuoteInput = z.infer<typeof validateQuoteSchema>;
export type ScoreQuoteInput = z.infer<typeof scoreQuoteSchema>;
export type RemindQuoteInput = z.infer<typeof remindQuoteSchema>;

