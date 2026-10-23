import {
    createTodo as createTodoRepository,
    findByIdAndUserId,
    listByUserId,
    getTodoSummaryByUserId,
    updateTodo as updateTodoRepository,
    deleteTodo as deleteTodoRepository,
} from './todos.repository.js';

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

    return todo;
}

export async function getTodoService({ id, userId }) {
    const todo = await findByIdAndUserId({ id, userId });

    if (!todo) {
        throw todoNotFoundError();
    }

    return todo;
}

export async function getTodosService({ userId, limit, cursor, date }) {
    const [todos, summary] = await Promise.all([
        listByUserId({ userId, limit: limit + 1, cursor, date }),
        getTodoSummaryByUserId({ userId, date }),
    ]);

    return { todos, summary };
}

export async function updateTodoService({ id, userId, updates }) {
    const todo = await updateTodoRepository({ id, userId, updates });

    if (!todo) {
        throw todoNotFoundError();
    }

    return todo;
}

export async function deleteTodoService({ id, userId }) {
    const deletedTodo = await deleteTodoRepository({ id, userId });

    if (!deletedTodo) {
        throw todoNotFoundError();
    }

    return deletedTodo;
}