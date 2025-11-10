import { z } from 'zod';

const bookingBaseSchema = z.object({
  folderId: z.string().uuid("Invalid folder ID"),
  quoteId: z.string().uuid("Invalid quote ID"),
  
  totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  depositAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
});

export const createBookingSchema = bookingBaseSchema
  .refine(
    (data) => {
      // Deposit must be exactly 30% of total
      const total = parseFloat(data.totalAmount);
      const deposit = parseFloat(data.depositAmount);
      const expectedDeposit = total * 0.30;
      const tolerance = 0.01; // 1 cent tolerance
      return Math.abs(deposit - expectedDeposit) <= tolerance;
    },
    {
      message: "Deposit amount must be exactly 30% of total amount",
      path: ["depositAmount"],
    }
  );

export const updateBookingSchema = bookingBaseSchema.partial();

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;

