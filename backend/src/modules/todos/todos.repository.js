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

function listConditions({ userId, date, status = 'all' }) {
    const values = [userId];
    let where = 'WHERE user_id = $1';
    if (date) {
        values.push(date);
        where += ` AND task_date = $${values.length}`;
    }
    if (status !== 'all') {
        values.push(status);
        where += ` AND status = $${values.length}`;
    }
    return { values, where };
}

const SORT_ORDERS = {
    createdAt: 'created_at DESC, id DESC',
    title: 'title ASC, id ASC',
    dueTime: 'due_time ASC NULLS LAST, id ASC',
};

export async function listByUserId({ userId, limit, cursor, date, status = 'all', sort = 'createdAt' }) {
    const order = SORT_ORDERS[sort];
    if (!order) throw new Error('Unsupported todo sort');
    const conditions = listConditions({ userId, date, status });
    const { values } = conditions;
    let { where } = conditions;

    if (cursor) {
        values.push(cursor.id);
        const idParam = `$${values.length}`;
        if (sort === 'dueTime' && cursor.value === null) {
            where += ` AND due_time IS NULL AND id > ${idParam}`;
        } else {
            values.push(cursor.value);
            const valueParam = `$${values.length}`;
            if (sort === 'createdAt') {
                where += ` AND (created_at, id) < (${valueParam}, ${idParam})`;
            } else if (sort === 'title') {
                where += ` AND (title, id) > (${valueParam}, ${idParam})`;
            } else {
                where += ` AND ((due_time, id) > (${valueParam}, ${idParam}) OR due_time IS NULL)`;
            }
        }
    }

    values.push(limit);
    const result = await query(
        `SELECT id, user_id, title, description, status, due_date, due_time, task_date, created_at, updated_at,
            to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_created_at
        FROM todos
        ${where}
        ORDER BY ${order}
        LIMIT $${values.length}`,
        values,
    );
    return result.rows;
}

export async function countFilteredTodos({ userId, date, status }) {
    const { where, values } = listConditions({ userId, date, status });
    const result = await query(`SELECT COUNT(*)::int AS count FROM todos ${where}`, values);
    return result.rows[0].count;
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