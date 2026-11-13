import { z } from 'zod';

export const updateBudgetSchema = z.object({
  monthlyAvailableFundsPaise: z
    .number()
    .int('Funds must be an integer in paise')
    .min(0)
    .nullable()
    .optional(),
  flexibleBudgetPaise: z
    .number()
    .int('Flexible budget must be an integer in paise')
    .min(0)
    .nullable()
    .optional(),
  categoryLimits: z
    .array(
      z.object({
        categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
        limitPaise: z
          .number()
          .int('Limit must be an integer in paise')
          .min(0),
      })
    )
    .optional(),
});
