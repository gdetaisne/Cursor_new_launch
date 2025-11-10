import { z } from 'zod';

const frenchPostalCodeRegex = /^\d{5}$/;

export const createFolderSchema = z.object({
  // Relations
  clientId: z.string().uuid("Invalid client ID"),
  leadId: z.string().uuid("Invalid lead ID").optional(),
  
  // Origin
  originAddress: z.string().min(1, "Origin address is required"),
  originCity: z.string().min(1, "Origin city is required"),
  originPostalCode: z.string().regex(frenchPostalCodeRegex, "Invalid postal code"),
  originFloor: z.number().int().min(0).max(50).optional(),
  originElevator: z.boolean().default(false),
  
  // Destination
  destAddress: z.string().min(1, "Destination address is required"),
  destCity: z.string().min(1, "Destination city is required"),
  destPostalCode: z.string().regex(frenchPostalCodeRegex, "Invalid postal code"),
  destFloor: z.number().int().min(0).max(50).optional(),
  destElevator: z.boolean().default(false),
  
  // Volume & Distance
  volume: z.number().min(0.1, "Volume must be at least 0.1m³").max(500, "Volume cannot exceed 500m³"),
  distance: z.number().min(0.1, "Distance must be at least 0.1km").max(5000, "Distance cannot exceed 5000km"),
  
  // Volume adjustment (if adjusted by admin)
  volumeAdjustedBy: z.string().uuid().optional(),
  volumeAdjustmentReason: z.string().max(500).optional(),
  
  // Date
  movingDate: z.coerce.date().min(new Date(), "Moving date cannot be in the past"),
  flexibleDate: z.boolean().default(false),
  
  // Options
  needPacking: z.boolean().default(false),
  needStorage: z.boolean().default(false),
  needInsurance: z.boolean().default(false),
  specialItems: z.string().optional(), // JSON string
});

export const updateFolderSchema = createFolderSchema.partial();

export const selectQuoteSchema = z.object({
  folderId: z.string().uuid("Invalid folder ID"),
  quoteId: z.string().uuid("Invalid quote ID"),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
export type SelectQuoteInput = z.infer<typeof selectQuoteSchema>;

