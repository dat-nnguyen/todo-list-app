import { z } from 'zod';

export const createTodoSchema = z.object({
    title: z
        .string({ error: 'Title is required' })
        .trim()
        .min(1, { message: 'Title is required' })
        .max(255, { message: 'Title must be at most 255 characters long' }),
    description: z
        .string()
        .trim()
        .max(2000, { message: 'Description must be at most 2000 characters long' })
        .optional()
        .nullable(),
});

export const updateTodoSchema = z
    .object({
        title: z
            .string({ error: 'Title is required' })
            .trim()
            .min(1, { message: 'Title is required' })
            .max(255, { message: 'Title must be at most 255 characters long' })
            .optional(),

        description: z
            .string()
            .trim()
            .max(2000, { message: 'Description must be at most 2000 characters long' })
            .optional()
            .nullable(),

        completed: z.boolean().optional(),
    })
    .refine(
        (data) =>
            data.title !== undefined ||
            data.description !== undefined ||
            data.completed !== undefined,
        { message: 'At least one field is required', path: ['_root'] }
    );

export const listTodoQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    cursor: z.string().optional()
})

export const todoIdParamSchema = z.object({
    id: z.string().uuid()
})

