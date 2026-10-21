import { z } from 'zod';

export const registerSchema = z.object({
  first_name: z.string({ error: 'First name is required' }),
  last_name: z.string({ error: 'Last name is required' }),
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email({ message: 'Invalid email' }),
  password: z
    .string({ error: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters long' }),
});


export const loginSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email({ message: 'Invalid email' }),
  password: z
    .string({ error: 'Password is required' })
    .min(1, { message: 'Password is required' }),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email({ message: 'Invalid email' }),
});