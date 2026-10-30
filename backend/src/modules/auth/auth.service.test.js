import { jest } from '@jest/globals';

const repository = {
    findByEmailWithPassword: jest.fn(),
    createUser: jest.fn(),
    findById: jest.fn(),
};
const bcrypt = { hash: jest.fn(), compare: jest.fn() };

jest.unstable_mockModule('./auth.repository.js', () => repository);
jest.unstable_mockModule('bcrypt', () => ({ default: bcrypt }));

const service = await import('./auth.service.js');

const user = Object.freeze({
    id: 'user-id',
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    password_hash: 'stored-hash',
    created_at: '2026-10-30T00:00:00.000Z',
    updated_at: '2026-10-30T00:00:00.000Z',
    internal_note: 'private',
});

const expectedResponse = {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
};

beforeEach(() => {
    jest.resetAllMocks();
    repository.findByEmailWithPassword.mockResolvedValue(user);
    repository.createUser.mockResolvedValue(user);
    repository.findById.mockResolvedValue(user);
    bcrypt.hash.mockResolvedValue('new-hash');
    bcrypt.compare.mockResolvedValue(true);
});

test('login returns only public fields without mutating the repository user', async () => {
    const result = await service.login(user.email, 'password');

    expect(repository.findByEmailWithPassword).toHaveBeenCalledWith(user.email);
    expect(bcrypt.compare).toHaveBeenCalledWith('password', user.password_hash);
    expect(result).toStrictEqual(expectedResponse);
    expect(result).not.toBe(user);
    expect(user.password_hash).toBe('stored-hash');
});

test('register returns the same public response after hashing the password', async () => {
    const result = await service.register({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        password: 'password',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    expect(repository.createUser).toHaveBeenCalledWith({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        passwordHash: 'new-hash',
    });
    expect(result).toStrictEqual(expectedResponse);
});

test('getMe returns only public fields', async () => {
    await expect(service.getMe(user.id)).resolves.toStrictEqual(expectedResponse);
    expect(repository.findById).toHaveBeenCalledWith(user.id);
});

test('login rejects an unknown email before comparing passwords', async () => {
    repository.findByEmailWithPassword.mockResolvedValue(null);

    await expect(service.login(user.email, 'password')).rejects.toMatchObject({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
    });
    expect(bcrypt.compare).not.toHaveBeenCalled();
});

test('login rejects an invalid password', async () => {
    bcrypt.compare.mockResolvedValue(false);

    await expect(service.login(user.email, 'wrong-password')).rejects.toMatchObject({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
    });
});

test('getMe rejects a missing user', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.getMe(user.id)).rejects.toMatchObject({
        statusCode: 401,
        code: 'UNAUTHORIZED',
    });
});
