import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['expense', 'income']).default('expense'),
  amountPaise: z
    .number({ required_error: 'Amount is required' })
    .int('Amount must be an integer in paise')
    .min(1, 'Amount must be greater than zero')
    .max(10000000000, 'Amount exceeds sensible maximum'),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
  needId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid need ID').nullable().optional(),
  description: z.string().trim().max(150).optional().default(''),
  merchant: z.string().trim().max(100).optional().default(''),
  source: z.enum(['Blinkit', 'Instamart', 'Zepto', 'Other', '']).nullable().optional(),
  mealPeriod: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Late Night', '']).nullable().optional(),
  paymentMethod: z.enum(['Cash', 'UPI', 'Card', 'Other']).default('UPI'),
  notes: z.string().trim().max(500).optional().default(''),
  occurredAt: z.string().datetime({ offset: true }).optional(),
  clientTransactionId: z
    .string({ required_error: 'Client transaction ID / idempotency key is required' })
    .trim()
    .min(1),
});

export const updateTransactionSchema = z.object({
  type: z.enum(['expense', 'income']).optional(),
  amountPaise: z
    .number()
    .int('Amount must be an integer in paise')
    .min(1, 'Amount must be greater than zero')
    .max(10000000000)
    .optional(),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID').optional(),
  needId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid need ID').nullable().optional(),
  description: z.string().trim().max(150).optional(),
  merchant: z.string().trim().max(100).optional(),
  source: z.enum(['Blinkit', 'Instamart', 'Zepto', 'Other', '']).nullable().optional(),
  mealPeriod: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Late Night', '']).nullable().optional(),
  paymentMethod: z.enum(['Cash', 'UPI', 'Card', 'Other']).optional(),
  notes: z.string().trim().max(500).optional(),
  occurredAt: z.string().datetime({ offset: true }).optional(),
});

export const syncTransactionsSchema = z.object({
  transactions: z.array(createTransactionSchema).max(100, 'Batch size limit is 100'),
});
