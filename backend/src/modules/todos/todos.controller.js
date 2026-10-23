import {
    createTodoService,
    getTodoService,
    getTodosService,
    updateTodoService,
    deleteTodoService,
} from './todos.service.js';

export async function createTodoController(req, res, next) {
    try {
        const result = await createTodoService({
            userId: req.session.userId,
            title: req.body.title,
            description: req.body.description,
            status: req.body.status,
            dueDate: req.body.dueDate,
            dueTime: req.body.dueTime,
            taskDate: req.body.taskDate,
        });

        res.status(201).json({ todo: toTodoResponse(result) });
    } catch (error) {
        next(error);
    }
}

export async function getTodoController(req, res, next) {
    try {
        const result = await getTodoService({
            id: req.params.id,
            userId: req.session.userId
        });

        res.status(200).json({ todo: toTodoResponse(result) });
    } catch (error) {
        next(error);
    }
}

export async function getTodosController(req, res, next) {
    try {
        const { limit, cursor: encodedCursor, date } = req.validatedQuery;
        const cursor = encodedCursor ? decodeCursor(encodedCursor) : undefined;

        const { todos: fetchedTodos, summary } = await getTodosService({
            userId: req.session.userId,
            limit,
            cursor,
            date,
        });
        const hasMore = fetchedTodos.length > limit;
        const todos = fetchedTodos.slice(0, limit);
        const lastTodo = todos.at(-1);
        const nextCursor = hasMore && lastTodo ? encodeCursor(lastTodo) : null;

        res.status(200).json({
            todos: todos.map(toTodoResponse),
            nextCursor,
            summary: {
                totalCount: summary.total_count,
                completedCount: summary.completed_count,
            },
        });
    } catch (error) {
        next(error);
    }
}
export async function updateTodoController(req, res, next) {
    try {
        const result = await updateTodoService({
            id: req.params.id,
            userId: req.session.userId,
            updates: req.body
        });

        res.status(200).json({ todo: toTodoResponse(result) });
    } catch (error) {
        next(error);
    }
}

export async function deleteTodoController(req, res, next) {
    try {
        await deleteTodoService({
            id: req.params.id,
            userId: req.session.userId
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }

}

function toTodoResponse(todo) {
    const taskDate = todo.task_date instanceof Date
        ? todo.task_date.toISOString().slice(0, 10)
        : todo.task_date;

    return {
        id: todo.id,
        title: todo.title,
        description: todo.description,
        status: todo.status,
        dueDate: todo.due_date,
        dueTime: todo.due_time,
        taskDate,
        createdAt: todo.created_at,
        updatedAt: todo.updated_at,
    };
}

function encodeCursor(todo) {
    const payload = `${todo.created_at.toISOString()}|${todo.id}`;
    return Buffer.from(payload).toString('base64url');
}

function decodeCursor(encodedCursor) {
    const invalidCursorError = () => {
        const error = new Error('Invalid cursor');
        error.statusCode = 400;
        error.code = 'VALIDATION_ERROR';
        return error;
    };

    if (!/^[A-Za-z0-9_-]+$/.test(encodedCursor)) {
        throw invalidCursorError();
    }

    const decoded = Buffer.from(encodedCursor, 'base64url').toString('utf8');
    const [createdAt, id, ...extraParts] = decoded.split('|');
    const parsedDate = new Date(createdAt);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id ?? '');

    if (
        extraParts.length > 0 ||
        !createdAt ||
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString() !== createdAt ||
        !isUuid
    ) {
        throw invalidCursorError();
    }

    return { createdAt: parsedDate, id };
}