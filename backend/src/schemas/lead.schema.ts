import { z } from 'zod';

// French phone regex: +33 or 0, followed by 9 digits
const frenchPhoneRegex = /^(\+33|0)[1-9]\d{8}$/;

// French postal code: 5 digits
const frenchPostalCodeRegex = /^\d{5}$/;

export const createLeadSchema = z.object({
  source: z.string().min(1, "Source is required"),
  
  // Contact data
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(frenchPhoneRegex, "Invalid French phone number").optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  
  // Addresses
  originAddress: z.string().min(1, "Origin address is required"),
  originCity: z.string().min(1, "Origin city is required"),
  originPostalCode: z.string().regex(frenchPostalCodeRegex, "Invalid postal code (5 digits)"),
  
  destAddress: z.string().min(1, "Destination address is required"),
  destCity: z.string().min(1, "Destination city is required"),
  destPostalCode: z.string().regex(frenchPostalCodeRegex, "Invalid postal code (5 digits)"),
  
  // Estimation
  estimatedVolume: z.number().min(1, "Volume must be at least 1m³").max(500, "Volume cannot exceed 500m³").optional(),
  estimationMethod: z.enum(['AI_PHOTO', 'FORM', 'MANUAL_ADMIN']).default('FORM'),
  photosUrls: z.array(z.string().url("Invalid photo URL")).optional(),
  aiEstimationConfidence: z.number().min(0).max(100).optional(),
  
  movingDate: z.coerce.date().min(new Date(), "Moving date cannot be in the past").optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const convertLeadSchema = z.object({
  leadId: z.string().uuid("Invalid lead ID"),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type ConvertLeadInput = z.infer<typeof convertLeadSchema>;

