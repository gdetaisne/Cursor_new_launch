import { z } from 'zod';

const siretRegex = /^\d{14}$/;
const frenchPhoneRegex = /^(\+33|0)[1-9]\d{8}$/;
const frenchPostalCodeRegex = /^\d{5}$/;

export const createMoverSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  siret: z.string().regex(siretRegex, "SIRET must be exactly 14 digits"),
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(frenchPhoneRegex, "Invalid French phone number"),
  
  // Address
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().regex(frenchPostalCodeRegex, "Invalid postal code"),
  
  // Google Places
  googlePlaceId: z.string().optional(),
  googleRating: z.number().min(0).max(5).optional(),
  googleReviewsCount: z.number().int().min(0).optional(),
  
  // Financial scoring (manual input from CreditSafe web access)
  creditSafeScore: z.number().int().min(0).max(100).optional(),
  creditSafeNotes: z.string().max(2000).optional(),
  
  // Coverage zones (JSON array of postal codes or departments)
  coverageZones: z.string(), // JSON string like ["33", "40", "47"]
});

export const updateMoverSchema = createMoverSchema.partial();

export const blacklistMoverSchema = z.object({
  moverId: z.string().uuid("Invalid mover ID"),
  blacklisted: z.boolean(),
  blacklistReason: z.string().max(500).optional(),
});

export const syncGoogleDataSchema = z.object({
  moverId: z.string().uuid("Invalid mover ID"),
  googlePlaceId: z.string().min(1, "Google Place ID is required"),
});

export type CreateMoverInput = z.infer<typeof createMoverSchema>;
export type UpdateMoverInput = z.infer<typeof updateMoverSchema>;
export type BlacklistMoverInput = z.infer<typeof blacklistMoverSchema>;
export type SyncGoogleDataInput = z.infer<typeof syncGoogleDataSchema>;

