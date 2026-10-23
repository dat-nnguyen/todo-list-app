import { query } from "../../db/index.js";

export async function createTodo({ userId, title, description, status, dueDate, dueTime, taskDate }) {
    const result = await query(
        `INSERT INTO todos (user_id, title, description, status, due_date, due_time, task_date)
        VALUES($1, $2, $3, $4, $5, $6, COALESCE($7::date, CURRENT_DATE))
        RETURNING id, user_id, title, description, status, due_date, due_time, task_date, created_at, updated_at`,
        [userId, title, description, status, dueDate ?? null, dueTime ?? null, taskDate ?? null]
    );
    return result.rows[0] || null;
}

export async function findByIdAndUserId({ id, userId }) {
    const result = await query(
        `SELECT id, user_id, title, description, status, due_date, due_time, task_date, created_at, updated_at
        FROM todos WHERE id = $1 AND user_id = $2`,
        [id, userId]
    );
    return result.rows[0] || null;
}

export async function listByUserId({ userId, limit, cursor, date }) {
    const values = [userId];
    let where = 'WHERE user_id = $1';

    if (date) {
        values.push(date);
        where += ` AND task_date = $${values.length}`;
    }

    if (cursor) {
        values.push(cursor.createdAt, cursor.id);
        where += ` AND (created_at, id) < ($${values.length - 1}, $${values.length})`;
    }

    values.push(limit);

    const result = await query(
        `SELECT id, user_id, title, description, status, due_date, due_time, task_date, created_at, updated_at
        FROM todos
        ${where}
        ORDER BY created_at DESC, id DESC
        LIMIT $${values.length}`,
        values
    );

    return result.rows;
}

export async function getTodoSummaryByUserId({ userId, date }) {
    const values = [userId];
    let where = 'WHERE user_id = $1';

    if (date) {
        values.push(date);
        where += ` AND task_date = $${values.length}`;
    }

    const result = await query(
        `SELECT
            COUNT(*)::int AS total_count,
            COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_count
        FROM todos
        ${where}`,
        values
    );
    return result.rows[0];
}

export async function updateTodo({ id, userId, updates }) {
    const allowedColumns = {
        title: 'title',
        description: 'description',
        status: 'status',
        dueDate: 'due_date',
        dueTime: 'due_time',
        taskDate: 'task_date',
    };
    const sets = [];
    const values = [];

    for (const [field, column] of Object.entries(allowedColumns)) {
        if (updates[field] !== undefined) {
            values.push(updates[field]);
            sets.push(`${column} = $${values.length}`);
        }
    }

    if (sets.length === 0) {
        return null;
    }

    values.push(id, userId);

    const result = await query(
        `UPDATE todos
        SET ${sets.join(', ')}, updated_at = NOW()
        WHERE id = $${values.length - 1} AND user_id = $${values.length}
        RETURNING id, user_id, title, description, status, due_date, due_time, task_date, created_at, updated_at`,
        values
    );

    return result.rows[0] || null;
}

export async function deleteTodo({ id, userId }) {
    const result = await query(
        `DELETE FROM todos
        WHERE id = $1 AND user_id = $2
        RETURNING id`,
        [id, userId]
    );
    return result.rows[0] || null;
}