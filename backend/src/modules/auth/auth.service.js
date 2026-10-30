import bcrypt from 'bcrypt';
import { findByEmailWithPassword, createUser, findById } from './auth.repository.js';
import { toUserResponse } from './auth.dto.js';

const SALT_ROUNDS = 10;

export async function register({ first_name, last_name, email, password }) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    try {
        const user = await createUser({ first_name, last_name, email, passwordHash });
        return toUserResponse(user);
    } catch (error) {
        if (error.code === '23505') {
            throw emailAlreadyExists();
        }
        throw error;
    }
}

export async function login(email, password) {
    const user = await findByEmailWithPassword(email);

    if (!user) {
        throw invalidEmailOrPassword();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
        throw invalidEmailOrPassword();
    }

    return toUserResponse(user);
}

export async function getMe(userId) {
    const user = await findById(userId);

    if (!user) {
        throw unauthorized();
    }

    return toUserResponse(user);
}

function unauthorized() {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    return error;
}

function invalidEmailOrPassword() {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    return error;
}

function emailAlreadyExists() {
    const error = new Error('Email already exists');
    error.statusCode = 409;
    error.code = 'EMAIL_ALREADY_EXISTS';
    return error;
}
