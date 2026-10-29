import { createHash, randomUUID } from 'node:crypto';
import { config } from '../../config/index.js';
import { cache } from '../../utils/cache.js';
import {
    createTodo as createTodoRepository,
    findByIdAndUserId,
    listByUserId,
    getTodoSummaryByUserId,
    countFilteredTodos,
    updateTodo as updateTodoRepository,
    deleteTodo as deleteTodoRepository,
} from './todos.repository.js';

const CACHE_VERSION_PREFIX = 'todos:list-version:';
const CACHE_LIST_PREFIX = 'todos:list:v2:';
const CACHE_VERSION_TTL_SECONDS = 60 * 60 * 24;

async function getCacheVersion(userId) {
    const versionKey = `${CACHE_VERSION_PREFIX}${userId}`;
    try {
        let version = await cache.get(versionKey);
        if (typeof version !== 'string' || version.length === 0) {
            version = randomUUID();
            await cache.set(versionKey, version, CACHE_VERSION_TTL_SECONDS);
        }
        return version;
    } catch {
        return null;
    }
}

async function invalidateTodoLists(userId) {
    try {
        await cache.set(`${CACHE_VERSION_PREFIX}${userId}`, randomUUID(), CACHE_VERSION_TTL_SECONDS);
    } catch {
        // Cache is an optimization; database writes remain authoritative.
    }
}

function parseCachedList(value) {
    if (!value) return null;
    try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        return Array.isArray(parsed?.todos) && parsed?.summary ? parsed : null;
    } catch {
        return null;
    }
}

function todoNotFoundError() {
    const error = new Error('Todo not found');
    error.statusCode = 404;
    error.code = 'TODO_NOT_FOUND';
    return error;
}

export async function createTodoService({ userId, title, description, status, dueDate, dueTime, taskDate }) {
    const todo = await createTodoRepository({ userId, title, description, status, dueDate, dueTime, taskDate });

    if (!todo) {
        const error = new Error('Failed to create todo');
        error.statusCode = 500;
        error.code = 'INTERNAL_ERROR';
        throw error;
    }

    await invalidateTodoLists(userId);
    return todo;
}

export async function getTodoService({ id, userId }) {
    const todo = await findByIdAndUserId({ id, userId });

    if (!todo) {
        throw todoNotFoundError();
    }

    return todo;
}

export async function getTodosService({ userId, limit, cursor, date, status = 'all', sort = 'createdAt' }) {
    const version = await getCacheVersion(userId);
    const cursorKey = cursor ? createHash('sha256').update(JSON.stringify(cursor)).digest('hex') : 'first';
    const key = version
        ? `${CACHE_LIST_PREFIX}${userId}:${date || 'all'}:${status}:${sort}:${limit}:${cursorKey}:${version}`
        : null;

    if (key) {
        try {
            const cached = parseCachedList(await cache.get(key));
            if (cached) return cached;
        } catch {
            // Continue to the database when cache is unavailable.
        }
    }

    const [todos, summary, filteredCount] = await Promise.all([
        listByUserId({ userId, limit: limit + 1, cursor, date, status, sort }),
        getTodoSummaryByUserId({ userId, date }),
        countFilteredTodos({ userId, date, status }),
    ]);
    const result = { todos, summary, filteredCount };

    if (key) {
        try {
            await cache.set(key, JSON.stringify(result), config.memcached.todoListTtlSeconds);
        } catch {
            // Cache writes must never prevent a successful database response.
        }
    }

    return result;
}

export async function updateTodoService({ id, userId, updates }) {
    const todo = await updateTodoRepository({ id, userId, updates });

    if (!todo) {
        throw todoNotFoundError();
    }

    await invalidateTodoLists(userId);
    return todo;
}

export async function deleteTodoService({ id, userId }) {
    const deletedTodo = await deleteTodoRepository({ id, userId });

    if (!deletedTodo) {
        throw todoNotFoundError();
    }

    await invalidateTodoLists(userId);
    return deletedTodo;
}