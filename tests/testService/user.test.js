import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/repositories/userRepository.js', () => ({
    verifyUserExistsByEmail: jest.fn(),
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
    updateUserSubscription: jest.fn()
}))

const { verifyUserExistsByEmail, findUserByEmail, createUser, updateUserSubscription } = await import('../../src/repositories/userRepository.js');
const { registerUser, loginUser } = await import('../../src/services/userService.js');

describe('User Service Tests Register', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    test('Register User - Failure when user already exists', async () => {
        verifyUserExistsByEmail.mockResolvedValue(true);

        await expect(
            registerUser('Teste', 'teste@gmail.com', '12345678')
        ).rejects.toThrow('Email already exists');

        expect(verifyUserExistsByEmail).toHaveBeenCalledWith('teste@gmail.com');
        expect(createUser).not.toHaveBeenCalled();
    });

    test('Register User - Should register user with password hashed', async () => {
        verifyUserExistsByEmail.mockResolvedValue(null)
        createUser.mockResolvedValue({
            id: 2,
            email: 'ana@gmail.com',
            name: 'Ana',
            password: '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y' // 12345678
        });

        const result = await registerUser('Ana', 'ana@gmail.com', '12345678');
        expect(createUser).toHaveBeenCalledWith('Ana', 'ana@gmail.com', expect.not.stringContaining('12345678'));
        expect(result).toEqual({
            id: 2,
            email: 'ana@gmail.com',
            name: 'Ana',
            password: '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y'
        })
    });
})

describe('User Service Tests Login', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    test('Login User - Failure when email already is invalid', async () => {
        findUserByEmail.mockResolvedValue(null);

        await expect(
            loginUser('bruno@gmail.com', '12345678')
        ).rejects.toThrow('Invalid email or password')
    });

    test('Login User - Failure when password already is invalid', async () => {
        findUserByEmail.mockResolvedValue({
            email: 'carlos@gmail.com',
            password: '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y',
            name: 'Carlos'
        });

        await expect(
            loginUser('carlos@gmail.com', '123456789')
        ).rejects.toThrow('Invalid email or password')
    });

    test('Login User - Shold login success and with password hashed', async () => {
        verifyUserExistsByEmail.mockResolvedValue(true)
        findUserByEmail.mockResolvedValue({
            id: '3',
            email: 'carlos@gmail.com',
            password: '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y',
            name: 'Carlos'
        });

        const result = await loginUser('carlos@gmail.com', '12345678')
        expect(result).toEqual({
            id: '3',
            email: 'carlos@gmail.com',
            password: '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y',
            name: 'Carlos'
        })

    })
})