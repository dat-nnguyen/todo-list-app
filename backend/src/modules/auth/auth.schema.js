import { z } from 'zod';

export const registerSchema = z.object({
  first_name: z.string({ error: 'First name is required' }),
  last_name: z.string({ error: 'Last name is required' }),

  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email({ message: 'Invalid email' }),

  password: z.string({ error: 'Password is required' })
  .min(8, {
    message: 'Password must be at least 8 characters long',
  })
  .regex(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  .regex(/[0-9]/, {
    message: 'Password must contain at least one number',
  })
  .regex(/[^A-Za-z0-9]/, {
    message: 'Password must contain at least one special character',
  }),

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
