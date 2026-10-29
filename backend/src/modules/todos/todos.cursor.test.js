import { encodeCursor, decodeCursor } from './todos.cursor.js';
import { listTodoQuerySchema } from './todos.schema.js';

const context = { date: '2026-10-29', status: 'all', sort: 'createdAt' };
const todo = {
    id: '00000000-0000-4000-8000-000000000001',
    title: 'Việc cần làm | ☕',
    due_time: '09:30:00',
    created_at: new Date('2026-10-29T01:00:00.123Z'),
    cursor_created_at: '2026-10-29T01:00:00.123456Z',
};

test.each([
    ['createdAt', todo.cursor_created_at],
    ['title', todo.title],
    ['dueTime', todo.due_time],
])('round-trips %s through URL-safe Base64', (sort, value) => {
    const options = { ...context, sort };
    const encoded = encodeCursor(todo, options);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(JSON.parse(Buffer.from(encoded, 'base64url').toString()).value).toBe(value);
    expect(decodeCursor(encoded, options)).toMatchObject({ value, id: todo.id, ...options });
});

test('round-trips a missing due time', () => {
    const options = { ...context, sort: 'dueTime' };
    expect(decodeCursor(encodeCursor({ ...todo, due_time: null }, options), options).value).toBeNull();
});

test.each([
    { sort: 'title' }, { status: 'completed' }, { date: '2026-10-30' },
])('rejects cursor from a different query: %j', (change) => {
    expect(() => decodeCursor(encodeCursor(todo, context), { ...context, ...change }))
        .toThrow('Invalid cursor');
});

test.each(['!!!', 'e30', Buffer.from('not json').toString('base64url')])('rejects malformed cursor %s', (encoded) => {
    expect(() => decodeCursor(encoded, context)).toThrow('Invalid cursor');
});

test.each([
    ['createdAt', null], ['createdAt', 'bad date'], ['title', null], ['dueTime', '25:90'],
])('rejects invalid %s value %s', (sort, value) => {
    const encoded = Buffer.from(JSON.stringify({ version: 1, ...context, sort, id: todo.id, value })).toString('base64url');
    expect(() => decodeCursor(encoded, { ...context, sort })).toThrow('Invalid cursor');
});

test('query validation defaults and rejects unknown filters/sorts', () => {
    expect(listTodoQuerySchema.parse({})).toMatchObject({ sort: 'createdAt', status: 'all' });
    expect(() => listTodoQuerySchema.parse({ sort: 'title; DROP TABLE todos' })).toThrow();
    expect(() => listTodoQuerySchema.parse({ status: 'unknown' })).toThrow();
});
