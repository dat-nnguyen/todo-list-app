import { z } from 'zod';

const cursorSchema = z.object({
    version: z.literal(1),
    sort: z.enum(['createdAt', 'title', 'dueTime']),
    status: z.enum(['all', 'pending', 'in_progress', 'completed']),
    date: z.iso.date().nullable(),
    id: z.string().uuid(),
    value: z.string().nullable(),
});

// JSON preserves titles containing separators; Base64url keeps the cursor URL-safe.
export function encodeCursor(todo, { date, status = 'all', sort = 'createdAt' }) {
    const value = sort === 'title' ? todo.title
        : sort === 'dueTime' ? todo.due_time ?? null
        : todo.cursor_created_at ?? new Date(todo.created_at).toISOString();
    return Buffer.from(JSON.stringify({
        version: 1, sort, status, date: date ?? null, id: todo.id, value,
    })).toString('base64url');
}

export function decodeCursor(encoded, { date, status = 'all', sort = 'createdAt' }) {
    try {
        if (encoded.length > 4096 || !/^[A-Za-z0-9_-]+$/.test(encoded)) throw new Error();
        const cursor = cursorSchema.parse(JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')));
        if (cursor.sort !== sort || cursor.status !== status || cursor.date !== (date ?? null)) throw new Error();
        if (sort === 'createdAt') z.iso.datetime().parse(cursor.value);
        if (sort === 'title') z.string().min(1).max(255).parse(cursor.value);
        if (sort === 'dueTime' && cursor.value !== null) {
            z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/).parse(cursor.value);
        }
        return cursor;
    } catch {
        const error = new Error('Invalid cursor');
        error.statusCode = 400;
        error.code = 'VALIDATION_ERROR';
        throw error;
    }
}
