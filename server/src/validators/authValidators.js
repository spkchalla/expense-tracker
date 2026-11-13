import { z } from 'zod';

export const registerSchema = z.object({
  displayName: z
    .string({ required_error: 'Display name is required' })
    .trim()
    .min(2, 'Display name must be at least 2 characters')
    .max(60, 'Display name cannot exceed 60 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address')
    .max(254),
  password: z
    .string({ required_error: 'Password is required' })
    .min(10, 'Password must be at least 10 characters long')
    .max(128, 'Password cannot exceed 128 characters'),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password cannot be empty'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string({ required_error: 'Current password is required' }).min(1),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(10, 'New password must be at least 10 characters long')
    .max(128),
});

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(60).optional(),
  currency: z.string().trim().min(2).max(10).optional(),
  timezone: z.string().trim().min(2).max(60).optional(),
});
