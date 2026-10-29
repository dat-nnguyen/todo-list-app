import { jest } from '@jest/globals';

const query = jest.fn();
jest.unstable_mockModule('../../db/index.js', () => ({ query }));
const { listByUserId, countFilteredTodos, getTodoSummaryByUserId } = await import('./todos.repository.js');

beforeEach(() => {
    query.mockReset().mockResolvedValue({ rows: [{ count: 8 }] });
});

const options = { userId: 'user', date: '2026-10-29', limit: 6, status: 'completed' };

test.each([
    ['createdAt', '2026-10-29T01:00:00.123456Z', '(created_at, id) < ($5, $4)', 'created_at DESC, id DESC'],
    ['title', 'Same title', '(title, id) > ($5, $4)', 'title ASC, id ASC'],
    ['dueTime', '09:30:00', '((due_time, id) > ($5, $4) OR due_time IS NULL)', 'due_time ASC NULLS LAST, id ASC'],
])('filters before paginating by %s with id tie breaker', async (sort, value, condition, order) => {
    await listByUserId({ ...options, sort, cursor: { value, id: 'last-id' } });
    const [sql, params] = query.mock.calls[0];
    expect(sql).toContain('task_date = $2 AND status = $3');
    expect(sql).toContain(condition);
    expect(sql).toContain(`ORDER BY ${order}`);
    expect(sql).toContain('LIMIT $6');
    expect(params).toEqual(['user', options.date, 'completed', 'last-id', value, 6]);
});

test('continues within the null due-time group', async () => {
    await listByUserId({ ...options, sort: 'dueTime', cursor: { value: null, id: 'last-id' } });
    expect(query.mock.calls[0][0]).toContain('AND due_time IS NULL AND id > $4');
    expect(query.mock.calls[0][1]).toEqual(['user', options.date, 'completed', 'last-id', 6]);
});

test('first page includes all statuses without a cursor condition', async () => {
    await listByUserId({ ...options, status: 'all', sort: 'title' });
    expect(query.mock.calls[0][1]).toEqual(['user', options.date, 6]);
    expect(query.mock.calls[0][0]).not.toContain('AND status =');
    expect(query.mock.calls[0][0]).not.toContain('(title, id) >');
});

test('filtered count follows the filter while progress covers the whole day', async () => {
    expect(await countFilteredTodos(options)).toBe(8);
    expect(query.mock.calls[0][0]).toContain('AND status = $3');
    expect(query.mock.calls[0][1]).toEqual(['user', options.date, 'completed']);
    await getTodoSummaryByUserId(options);
    expect(query.mock.calls[1][0]).not.toContain('AND status =');
    expect(query.mock.calls[1][1]).toEqual(['user', options.date]);
});
