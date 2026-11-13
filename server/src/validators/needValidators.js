import { z } from 'zod';

export const createNeedSchema = z.object({
  name: z
    .string({ required_error: 'Need name is required' })
    .trim()
    .min(1, 'Need name cannot be empty')
    .max(100),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID').nullable().optional(),
  notes: z.string().trim().max(500).optional().default(''),
  monthlyReserveAmountPaise: z
    .number({ required_error: 'Monthly reserve target is required' })
    .int('Amount must be an integer in paise')
    .min(0, 'Reserve target cannot be negative'),
  expectedCostPaise: z
    .number()
    .int('Expected cost must be an integer in paise')
    .min(0)
    .nullable()
    .optional(),
  frequency: z
    .enum(['monthly', 'weekly', 'quarterly', 'yearly', 'irregular'])
    .optional()
    .default('monthly'),
  nextDueDate: z.string().datetime({ offset: true }).nullable().optional(),
  openingBalancePaise: z
    .number()
    .int('Opening balance must be an integer in paise')
    .optional()
    .default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateNeedSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID').nullable().optional(),
  notes: z.string().trim().max(500).optional(),
  monthlyReserveAmountPaise: z
    .number()
    .int('Amount must be an integer in paise')
    .min(0)
    .optional(),
  expectedCostPaise: z
    .number()
    .int('Expected cost must be an integer in paise')
    .min(0)
    .nullable()
    .optional(),
  frequency: z
    .enum(['monthly', 'weekly', 'quarterly', 'yearly', 'irregular'])
    .optional(),
  nextDueDate: z.string().datetime({ offset: true }).nullable().optional(),
  openingBalancePaise: z
    .number()
    .int('Opening balance must be an integer in paise')
    .optional(),
  isActive: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

export const createContributionSchema = z.object({
  amountPaise: z
    .number({ required_error: 'Contribution amount is required' })
    .int('Contribution must be an integer in paise')
    .min(1, 'Contribution amount must be greater than zero'),
  contributedAt: z.string().datetime({ offset: true }).optional(),
  note: z.string().trim().max(250).optional().default(''),
});
