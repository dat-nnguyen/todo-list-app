import { query } from "../../db/index.js";

export async function createTodo({ userId, title, description, status }) {
    const result = await query(
        `INSERT INTO todos (user_id, title, description, status)
        VALUES($1, $2, $3, $4)
        RETURNING id, user_id, title, description, status, created_at, updated_at`,
        [userId, title, description, status]
    );
    return result.rows[0] || null;
}

export async function findByIdAndUserId({ id, userId }) {
    const result = await query(
        `SELECT id, user_id, title, description, status, created_at, updated_at
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
        `SELECT id, user_id, title, description, status, created_at, updated_at
        FROM todos
        ${where}
        ORDER BY created_at DESC, id DESC
        LIMIT $${values.length}`,
        values
    );

    return result.rows;
}


export async function updateTodo({ id, userId, updates }) {
    const ALLOWED = ['title', 'description', 'status'];
    const sets = [];
    const values = [];

    for (const key of ALLOWED) {
        if (updates[key] !== undefined) {
            values.push(updates[key]);
            sets.push(`${key} = $${values.length}`);
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
        RETURNING id, user_id, title, description, status, created_at, updated_at`,
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