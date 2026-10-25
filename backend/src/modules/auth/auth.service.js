import bcrypt from 'bcrypt';
import { findByEmailWithPassword, createUser, findById } from './auth.repository.js';

const SALT_ROUNDS = 10;

export async function register({ first_name, last_name, email, password }) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    try {
        return await createUser({ first_name, last_name, email, passwordHash });
    } catch (error) {
        if (error.code === '23505') {
            throw emailAlreadyExists();
        }
        throw error;
    }
}

function emailAlreadyExists() {
    const error = new Error('Email already exists');
    error.statusCode = 409;
    error.code = 'EMAIL_ALREADY_EXISTS';
    return error;
}

export async function login(email, password) {
    const user = await findByEmailWithPassword(email);

    if (!user) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        error.code = 'INVALID_CREDENTIALS';
        throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        error.code = 'INVALID_CREDENTIALS';
        throw error;
    }

    delete user.password_hash;

    return user;
}

export async function getMe(userId) {
    const user = await findById(userId);

    if (!user) {
        const error = new Error('Unauthorized');
        error.statusCode = 401;
        error.code = 'UNAUTHORIZED';
        throw error;
    }

    return user;
}