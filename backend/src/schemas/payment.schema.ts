import { z } from 'zod';

export const createPaymentSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  
  type: z.enum(['DEPOSIT', 'REMAINING', 'REFUND']),
  
  amount: z.number().min(0, "Amount must be positive"),
  currency: z.string().length(3, "Currency must be 3 letters").default("EUR"),
  
  // Commission (for DEPOSIT only)
  commissionRate: z.number().min(0.05).max(0.15).optional(), // 5-15%
  
  // Stripe
  stripePaymentIntentId: z.string().optional(),
  idempotencyKey: z.string().optional(),
})
  .refine(
    (data) => {
      // If type is DEPOSIT, commissionRate must be between 0.05 and 0.15
      if (data.type === 'DEPOSIT') {
        return data.commissionRate !== undefined && data.commissionRate >= 0.05 && data.commissionRate <= 0.15;
      }
      return true;
    },
    {
      message: "Commission rate must be between 5% and 15% for deposit payments",
      path: ["commissionRate"],
    }
  );

export const validateDepositAmountSchema = z.object({
  totalAmount: z.number().min(0),
  depositAmount: z.number().min(0),
})
  .refine(
    (data) => {
      // Deposit must be exactly 30% of total
      const expectedDeposit = data.totalAmount * 0.30;
      const tolerance = 0.01; // 1 cent tolerance
      return Math.abs(data.depositAmount - expectedDeposit) <= tolerance;
    },
    {
      message: "Deposit amount must be exactly 30% of total amount",
      path: ["depositAmount"],
    }
  );

export const stripeWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.object({
      id: z.string(),
      amount: z.number(),
      currency: z.string(),
      status: z.string(),
      metadata: z.record(z.string()).optional(),
    }),
  }),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type ValidateDepositAmountInput = z.infer<typeof validateDepositAmountSchema>;
export type StripeWebhookInput = z.infer<typeof stripeWebhookSchema>;

