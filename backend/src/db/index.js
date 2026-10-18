import pg from 'pg';
const { Pool } = pg;

import { config, getDatabaseUrl } from '../config/index.js';

const pool = new Pool({
    connectionString: getDatabaseUrl(),
    ssl: config.db.ssl,
});

export async function connect() {
    try {
        await pool.connect();
        console.log('Database connected');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
}

export async function query(text, params) {
    return pool.query(text, params);
}

export async function getClient() {
    return pool.connect();
}

export async function close() {
    await pool.end();
}

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
})

export default pool;