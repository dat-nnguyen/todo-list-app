import { query } from "../../db/index.js";

export async function createTodo({ userId, title, description, status, dueDate }) {
    const result = await query(
        `INSERT INTO todos (user_id, title, description, status, due_date)
        VALUES($1, $2, $3, $4, $5)
        RETURNING id, user_id, title, description, status, due_date, created_at, updated_at`,
        [userId, title, description, status, dueDate ?? null]
    );
    return result.rows[0] || null;
}

export async function findByIdAndUserId({ id, userId }) {
    const result = await query(
        `SELECT id, user_id, title, description, status, due_date, created_at, updated_at
        FROM todos WHERE id = $1 AND user_id = $2`,
        [id, userId]
    );
    return result.rows[0] || null;
}

export async function listByUserId({ userId, limit, cursor }) {
    const values = [userId];
    let where = 'WHERE user_id = $1';

    if (cursor) {
        values.push(cursor.createdAt, cursor.id);
        where += ` AND (created_at, id) < ($${values.length - 1}, $${values.length})`;
    }

    values.push(limit);

    const result = await query(
        `SELECT id, user_id, title, description, status, due_date, created_at, updated_at
        FROM todos
        ${where}
        ORDER BY created_at DESC, id DESC
        LIMIT $${values.length}`,
        values
    );

    return result.rows;
}
export async function updateTodo({ id, userId, updates }) {
    const allowedColumns = {
        title: 'title',
        description: 'description',
        status: 'status',
        dueDate: 'due_date',
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
        RETURNING id, user_id, title, description, status, due_date, created_at, updated_at`,
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