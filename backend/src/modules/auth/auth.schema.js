import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email' })
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters long' }),
});


export const loginSchema = z.object({
    email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email' })
    .transform((val) => val.trim().toLowerCase()),
    
    password: z.string({
        required_error: 'Password is required'
    }).min(1, { message: 'Password is required' }),
});