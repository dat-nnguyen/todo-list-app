import bcrypt from 'bcrypt';
import { findByEmailWithPassword, createUser, findById } from './auth.repository.js';

const SALT_ROUNDS = 10;


export async function register({ first_name, last_name, email, password }) {
    const existingUser = await findByEmailWithPassword(email);

    if (existingUser) {
        const error = new Error('Email already exists');
        error.statusCode = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    const user = await createUser({ first_name, last_name, email, passwordHash });

    return user;
}

export async function login(email, password) {
    const user = await findByEmailWithPassword(email);

    if (!user) {
        throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
    }
}

export async function getMe(userId) {
    const user = await findById(userId);

    if (!user) {
        const error = new Error('Unauthorized');
        error.statusCode = 401;
        throw error;
    }

    return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
    };
}

export async function logout(req) {
    return new Promise((resolve, reject) => {
        req.session.destroy((err) => {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
}