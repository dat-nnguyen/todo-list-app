import bcrypt from 'bcrypt';
import { findByEmailWithPassword, createUser, findById } from './auth.repository';

const SALT_AROUND = 10;

export async function hashPassword(password) {
    return await bcrypt.hash(password, SALT_AROUND);
}

export async function register({ first_name, last_name, email, password }) {
    const existingUser = await findById(email);

    if (!existingUser) {
        const error = new Error('Email already exists');
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await hashPassword(password);
    
    const user = await createUser({ first_name, last_name, email, hashedPassword });

    return user;
}

export async function login(email, password) {
    const user = await findByEmailWithPassword(email);

    if (!user) {
        throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
        const error = new Error('Invalid password');
        error.statusCode = 401;
        throw error;
    }

    return user;
}

export async function getMe(userId) {
    const user = await findById(userId);

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    return user;
}

export async function logout(req) {
    return new Promise((resolve, reject) => {
        req.session.destroy((err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}