import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/lib/prisma.js', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findUniqueOrThrow: jest.fn()
        },
        $transaction: jest.fn()
    }
}));

jest.unstable_mockModule('../../src/config/logger.js', () => ({
    logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() }
}));

const { prisma } = await import('../../src/lib/prisma.js');
const { logger } = await import('../../src/config/logger.js');
const {
    findUserByEmail,
    findUserBySub,
    verifyUserExistsByEmail,
    verifyUserExistsBySub,
    createUser,
    createUserWithOauth,
    updateUserSubscription,
    downgradeUserSubscription,
    findUserById,
    changeUserStatusActive,
    verifyUserIsVerifiedAndExists
} = await import('../../src/repositories/userRepository.js');

describe('User Repository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('findUserByEmail', () => {
        test('should find user by email', async () => {
            const mockUser = {
                id: 'user-1',
                name: 'John',
                email: 'john@test.com',
                password: 'hashed_password',
                subscriptionExpiresAt: null,
                subscriptionPlan: 'free',
                isEmailVerified: true
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            const result = await findUserByEmail('john@test.com');

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'john@test.com' },
                select: {
                    name: true,
                    email: true,
                    password: true,
                    id: true,
                    subscriptionExpiresAt: true,
                    subscriptionPlan: true,
                    isEmailVerified: true
                }
            });
            expect(result).toEqual(mockUser);
        });

        test('should return null when user not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const result = await findUserByEmail('nonexistent@test.com');

            expect(result).toBeNull();
        });
    });

    describe('findUserBySub', () => {
        test('should find user by OAuth sub', async () => {
            const mockUser = {
                id: 'user-1',
                name: 'John',
                email: 'john@test.com',
                password: null,
                subscriptionExpiresAt: null,
                subscriptionPlan: 'free'
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            const result = await findUserBySub('google-sub-123');

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { sub: 'google-sub-123' },
                select: {
                    name: true,
                    email: true,
                    password: true,
                    id: true,
                    subscriptionExpiresAt: true,
                    subscriptionPlan: true
                }
            });
            expect(result).toEqual(mockUser);
        });
    });

    describe('verifyUserExistsByEmail', () => {
        test('should return user email when user exists', async () => {
            const mockUser = { email: 'john@test.com' };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            const result = await verifyUserExistsByEmail('john@test.com');

            expect(result).toEqual(mockUser);
        });

        test('should return null when user does not exist', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const result = await verifyUserExistsByEmail('nonexistent@test.com');

            expect(result).toBeNull();
        });
    });

    describe('verifyUserExistsBySub', () => {
        test('should return user sub when user exists', async () => {
            const mockUser = { sub: 'google-sub-123' };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            const result = await verifyUserExistsBySub('google-sub-123');

            expect(result).toEqual(mockUser);
        });

        test('should return null when user does not exist', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const result = await verifyUserExistsBySub('nonexistent-sub');

            expect(result).toBeNull();
        });
    });

    describe('createUser', () => {
        test('should create a new local user', async () => {
            const mockUser = {
                id: 'user-1',
                name: 'John',
                email: 'john@test.com',
                password: 'hashed_password',
                authenticationType: 'local'
            };

            prisma.user.create.mockResolvedValue(mockUser);

            const result = await createUser('John', 'john@test.com', 'hashed_password');

            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: 'john@test.com',
                    name: 'John',
                    password: 'hashed_password',
                    authenticationType: 'local'
                }
            });
            expect(result).toEqual(mockUser);
        });
    });

    describe('createUserWithOauth', () => {
        test('should create a new OAuth user', async () => {
            const mockUser = {
                id: 'user-1',
                name: 'John',
                email: 'john@test.com',
                sub: 'google-sub-123',
                authenticationType: 'google'
            };

            prisma.user.create.mockResolvedValue(mockUser);

            const result = await createUserWithOauth('John', 'john@test.com', 'google-sub-123');

            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    name: 'John',
                    email: 'john@test.com',
                    sub: 'google-sub-123',
                    authenticationType: 'google'
                }
            });
            expect(result).toEqual(mockUser);
        });
    });

    describe('updateUserSubscription', () => {
        test('should update user subscription plan', async () => {
            const mockTx = {
                user: {
                    findUniqueOrThrow: jest.fn().mockResolvedValue({ subscriptionPlan: 'free' }),
                    update: jest.fn().mockResolvedValue({ id: 'user-1' })
                }
            };

            prisma.$transaction.mockImplementation(async (callback) => {
                return callback(mockTx);
            });

            const result = await updateUserSubscription('user-1', 'BASIC');

            expect(result).toEqual({ id: 'user-1' });
            expect(logger.info).toHaveBeenCalledWith('updateUserSubscription success', { id: 'user-1', plan: 'BASIC' });
        });

        test('should throw error when user already subscribed to plan', async () => {
            const mockTx = {
                user: {
                    findUniqueOrThrow: jest.fn().mockResolvedValue({ subscriptionPlan: 'BASIC' })
                }
            };

            prisma.$transaction.mockImplementation(async (callback) => {
                return callback(mockTx);
            });

            await expect(updateUserSubscription('user-1', 'BASIC')).rejects.toThrow('User already subscribed to this plan');
        });
    });

    describe('downgradeUserSubscription', () => {
        test('should downgrade user subscription to free', async () => {
            const mockResult = { id: 'user-1', subscriptionPlan: 'free' };

            prisma.user.update.mockResolvedValue(mockResult);

            const result = await downgradeUserSubscription('john@test.com');

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { email: 'john@test.com' },
                data: {
                    subscriptionExpiresAt: null,
                    subscriptionPlan: 'free'
                },
                select: {}
            });
            expect(result).toEqual(mockResult);
        });
    });

    describe('findUserById', () => {
        test('should find user by id', async () => {
            const mockUser = { id: 'user-1' };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            const result = await findUserById('user-1');

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 'user-1' },
                select: { id: true }
            });
            expect(result).toEqual(mockUser);
        });

        test('should return null when user not found', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const result = await findUserById('nonexistent');

            expect(result).toBeNull();
        });
    });

    describe('changeUserStatusActive', () => {
        test('should set user status to active and verify email', async () => {
            const mockResult = { id: 'user-1', status: 'active', isEmailVerified: true };

            prisma.user.update.mockResolvedValue(mockResult);

            const result = await changeUserStatusActive('user-1');

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-1' },
                data: {
                    status: 'active',
                    isEmailVerified: true
                },
                select: {}
            });
            expect(result).toEqual(mockResult);
        });
    });

    describe('verifyUserIsVerifiedAndExists', () => {
        test('should return verification status when user exists', async () => {
            const mockUser = { isEmailVerified: true };

            prisma.user.findUnique.mockResolvedValue(mockUser);

            const result = await verifyUserIsVerifiedAndExists('user-1');

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 'user-1' },
                select: { isEmailVerified: true }
            });
            expect(result).toEqual(mockUser);
        });

        test('should return null when user does not exist', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const result = await verifyUserIsVerifiedAndExists('nonexistent');

            expect(result).toBeNull();
        });
    });
});
