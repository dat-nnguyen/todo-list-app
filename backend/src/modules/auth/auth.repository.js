import { query } from '../../db/index.js';

export async function findByEmailWithPassword(email) { // use for login
  const result = await query(
    `SELECT id, first_name, last_name, email, password_hash, created_at, updated_at 
     FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

export async function findById(id) { // use for other modules
  const result = await query(
    `SELECT id, first_name, last_name, email, created_at, updated_at 
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function createUser({ first_name, last_name, email, passwordHash }) {
  const result = await query(
    `INSERT INTO users (first_name, last_name, email, password_hash) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, first_name, last_name, email, created_at, updated_at`,
    [first_name, last_name, email, passwordHash]
  );
  return result.rows[0] || null;
}