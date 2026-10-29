import { encodeCursor, decodeCursor } from './todos.cursor.js';
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
        const { limit, cursor: encodedCursor, date, status, sort } = req.validatedQuery;
        const cursor = encodedCursor ? decodeCursor(encodedCursor, { date, status, sort }) : undefined;

        const { todos: fetchedTodos, summary, filteredCount } = await getTodosService({
            userId: req.session.userId,
            limit,
            cursor,
            date,
            status,
            sort,
        });
        const hasMore = fetchedTodos.length > limit;
        const todos = fetchedTodos.slice(0, limit);
        const lastTodo = todos.at(-1);
        const nextCursor = hasMore && lastTodo ? encodeCursor(lastTodo, { date, status, sort }) : null;

        res.status(200).json({
            todos: todos.map(toTodoResponse),
            nextCursor,
            filteredCount,
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
