import { jest } from '@jest/globals';

const repository = Object.fromEntries([
    'createTodo', 'findByIdAndUserId', 'listByUserId', 'getTodoSummaryByUserId',
    'countFilteredTodos', 'updateTodo', 'deleteTodo',
].map((name) => [name, jest.fn()]));
const cache = { get: jest.fn(), set: jest.fn() };
jest.unstable_mockModule('./todos.repository.js', () => repository);
jest.unstable_mockModule('../../utils/cache.js', () => ({ cache }));
jest.unstable_mockModule('../../config/index.js', () => ({
    config: { memcached: { todoListTtlSeconds: 60 } },
}));
const service = await import('./todos.service.js');

beforeEach(() => {
    jest.clearAllMocks();
    cache.get.mockImplementation(async (key) => key.startsWith('todos:list-version:') ? 'version' : null);
    cache.set.mockResolvedValue(undefined);
    repository.listByUserId.mockResolvedValue([]);
    repository.getTodoSummaryByUserId.mockResolvedValue({ total_count: 20, completed_count: 8 });
    repository.countFilteredTodos.mockResolvedValue(8);
});

const options = { userId: 'user', date: '2026-10-29', limit: 5, status: 'completed', sort: 'title' };

test('forwards filtering/sorting, fetches lookahead, and keeps filtered count separate from progress', async () => {
    const result = await service.getTodosService(options);
    expect(repository.listByUserId).toHaveBeenCalledWith({ ...options, limit: 6, cursor: undefined });
    expect(repository.countFilteredTodos).toHaveBeenCalledWith({ userId: 'user', date: options.date, status: 'completed' });
    expect(result).toMatchObject({ filteredCount: 8, summary: { total_count: 20 } });
});

test('cache keys distinguish sort/filter/cursor and fit Memcached key length', async () => {
    await service.getTodosService(options);
    await service.getTodosService({ ...options, status: 'all' });
    await service.getTodosService({ ...options, sort: 'dueTime' });
    await service.getTodosService({ ...options, cursor: { id: 'id', value: '☕'.repeat(255) } });
    const keys = cache.set.mock.calls.map(([key]) => key);
    expect(new Set(keys).size).toBe(4);
    expect(keys.every((key) => Buffer.byteLength(key) <= 250)).toBe(true);
});

test.each(['create', 'update', 'delete'])('%s invalidates cached lists', async (action) => {
    repository[`${action}Todo`].mockResolvedValue({ id: 'todo' });
    await service[`${action}TodoService`]({ userId: 'user', id: 'todo', updates: { status: 'completed' } });
    expect(cache.set).toHaveBeenCalledWith('todos:list-version:user', expect.any(String), 86400);
});

test('cache failures still return database results', async () => {
    cache.get.mockRejectedValue(new Error('Cache unavailable'));
    await expect(service.getTodosService(options)).resolves.toMatchObject({ filteredCount: 8 });
});
