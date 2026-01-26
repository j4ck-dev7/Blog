import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/repositories/userRepository.js', () => ({
    verifyUserExistsByEmail: jest.fn(),
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
    updateUserSubscription: jest.fn()
}))

jest.unstable_mockModule('bcryptjs', () => ({
    default: {
        hash: jest.fn().mockReturnValue('$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y'),
        compare: jest.fn().mockResolvedValue(true)
    }
}))

const { default: bcryptjs } = await import('bcryptjs')
const { verifyUserExistsByEmail, findUserByEmail, createUser } = await import('../../src/repositories/userRepository.js');
const { registerUser, loginUser } = await import('../../src/services/userService.js');

describe('User Service Tests Register', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    test('Register User - Failure when user already exists', async () => {
        verifyUserExistsByEmail.mockResolvedValue({
            id: '1',
            email: 'teste@gmail.com',
            password: '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y'
        });

        await expect(
            registerUser('Teste', 'teste@gmail.com', '12345678')
        ).rejects.toThrow('Email already exists');

        expect(verifyUserExistsByEmail).toHaveBeenCalledWith('teste@gmail.com');
        expect(createUser).not.toHaveBeenCalled();
    });

    test('Register User - Should register user with password hashed', async () => {
        verifyUserExistsByEmail.mockResolvedValue(undefined);
        createUser.mockResolvedValue({
            id: 2,
            email: 'ana@gmail.com',
            name: 'Ana',
            password: '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y', // 12345678
            subscriptionPlan: 'FREE',
            subscriptionExpiresAt: null
        });

        const result = await registerUser('Ana', 'ana@gmail.com', '123456789');

        expect(bcryptjs.hash).toHaveBeenCalledWith('123456789', 10);
        expect(createUser).toHaveBeenCalledWith('Ana', 'ana@gmail.com', expect.not.stringContaining('12345678'));
        expect(result).toEqual({
            id: 2,
            email: 'ana@gmail.com',
            name: 'Ana',
            password: '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y',
            subscriptionPlan: 'FREE',
            subscriptionExpiresAt: null
        }); 
    });
})

describe('User Service Tests Login', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    test('Login User - Failure when email already is invalid', async () => {
        findUserByEmail.mockResolvedValue(undefined);

        await expect(
            loginUser('bruno@gmail.com', '12345678')
        ).rejects.toThrow('Invalid email or password');
    });

    test('Login User - Failure when password already is invalid', async () => {
        verifyUserExistsByEmail.mockResolvedValue(true)
        findUserByEmail.mockResolvedValue({
            id: '3',
            email: 'carlos@gmail.com',
            password: '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y',
            name: 'Carlos',
            subscriptionPlan: 'FREE',
            subscriptionExpiresAt: null
        });
        bcryptjs.compare.mockResolvedValue(false)

        await expect(
            loginUser('carlos@gmail.com', '123456789')
        ).rejects.toThrow('Invalid email or password');


        expect(findUserByEmail).toHaveBeenCalledWith('carlos@gmail.com');
        expect(verifyUserExistsByEmail).toHaveBeenCalledWith('carlos@gmail.com')
        expect(bcryptjs.compare).toHaveBeenCalledWith('123456789', '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y');
    });

    test('Login User - Shold login success and with password hashed', async () => {
        verifyUserExistsByEmail.mockResolvedValue(true)
        findUserByEmail.mockResolvedValue({
            id: '3',
            email: 'carlos@gmail.com',
            password: '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y',
            name: 'Carlos',
            subscriptionPlan: 'FREE',
            subscriptionExpiresAt: null
        });
        bcryptjs.compare.mockResolvedValue(true)

        const result = await loginUser('carlos@gmail.com', '12345678')
        expect(result).toEqual({
            id: '3',
            email: 'carlos@gmail.com',
            password: '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y',
            name: 'Carlos',
            subscriptionPlan: 'FREE',
            subscriptionExpiresAt: null
        })
        expect(findUserByEmail).toHaveBeenCalledWith('carlos@gmail.com');
        expect(verifyUserExistsByEmail).toHaveBeenCalledWith('carlos@gmail.com')
        expect(bcryptjs.compare).toHaveBeenCalledWith('12345678', '$2a$10$6OX/EUwCxD/OV2RPLi9g.eTiXJgU8zf/6avWU5YkpDGoBt8do8s3y');
    })
})