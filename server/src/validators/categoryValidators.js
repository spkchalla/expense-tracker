import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string({ required_error: 'Category name is required' })
    .trim()
    .min(1, 'Category name cannot be empty')
    .max(80),
  countsTowardFlexibleBudget: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
  parentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent ID').nullable().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  countsTowardFlexibleBudget: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  isArchived: z.boolean().optional(),
  parentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent ID').nullable().optional(),
});
