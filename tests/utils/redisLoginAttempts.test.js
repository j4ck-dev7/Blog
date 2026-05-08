import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/config/redis.js', () => ({
    default: { get: jest.fn(), setEx: jest.fn(), del: jest.fn() }
}));

jest.unstable_mockModule('../../src/config/logger.js', () => ({
    logger: { error: jest.fn(), debug: jest.fn() }
}));

const { default: client } = await import('../../src/config/redis.js');
const { logger } = await import('../../src/config/logger.js');
const {
    getLoginAttempts,
    incrementLoginAttempts,
    resetLoginAttempts,
    isLockedOut,
    getResetPasswordToken,
    setResetPasswordToken,
    deleteResetPasswordToken
} = await import('../../src/utils/redisLoginAttempts.js');

describe('redisLoginAttempts utils - success cases', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getLoginAttempts returns default when no data', async () => {
        client.get.mockResolvedValue(null);
        const res = await getLoginAttempts('a@b.com');
        expect(client.get).toHaveBeenCalledWith('login_attempts:a@b.com');
        expect(res).toEqual({ attempts: 0, lastAttempt: null });
    });

    test('getLoginAttempts returns parsed data', async () => {
        const payload = { attempts: 2, lastAttempt: '2024-01-01T00:00:00.000Z' };
        client.get.mockResolvedValue(JSON.stringify(payload));
        const res = await getLoginAttempts('a@b.com');
        expect(res).toEqual(payload);
    });

    test('incrementLoginAttempts increments and stores', async () => {
        client.get.mockResolvedValue(JSON.stringify({ attempts: 1, lastAttempt: '2024-01-01T00:00:00.000Z' }));
        client.setEx.mockResolvedValue('OK');
        const res = await incrementLoginAttempts('a@b.com');
        expect(client.setEx).toHaveBeenCalled();
        expect(res.attempts).toBe(2);
        expect(res.email).toBe('a@b.com');
    });

    test('resetLoginAttempts calls del', async () => {
        client.del.mockResolvedValue(1);
        await resetLoginAttempts('a@b.com');
        expect(client.del).toHaveBeenCalledWith('login_attempts:a@b.com');
    });

    test('isLockedOut returns true when attempts >= MAX', async () => {
        client.get.mockResolvedValue(JSON.stringify({ attempts: 5 }));
        const res = await isLockedOut('a@b.com');
        expect(res).toBe(true);
    });

    test('set/get/delete reset password token flow', async () => {
        const tokenData = { token: 't', code: '123', createdAt: new Date().toISOString() };
        client.setEx.mockResolvedValue('OK');
        await setResetPasswordToken('u@e.com', 't', '123');
        expect(client.setEx).toHaveBeenCalledWith(expect.stringContaining('reset_password_token:u@e.com'), 60 * 15, expect.any(String));

        client.get.mockResolvedValue(JSON.stringify(tokenData));
        const got = await getResetPasswordToken('u@e.com');
        expect(got).toEqual(tokenData);

        client.del.mockResolvedValue(1);
        await deleteResetPasswordToken('u@e.com');
        expect(client.del).toHaveBeenCalledWith(expect.stringContaining('reset_password_token:u@e.com'));
    });
});

describe('redisLoginAttempts utils - error cases', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getLoginAttempts handles redis get error and logs', async () => {
        client.get.mockRejectedValue(new Error('fail'));
        const res = await getLoginAttempts('x@y.com');
        expect(logger.error).toHaveBeenCalled();
        expect(res).toEqual({ attempts: 0, lastAttempt: null });
    });

    test('incrementLoginAttempts propagates error after logging', async () => {
        client.setEx.mockRejectedValue(new Error('fail'));
        await expect(incrementLoginAttempts('x@y.com')).rejects.toThrow('fail');
        expect(logger.error).toHaveBeenCalled();
    });

    test('resetLoginAttempts propagates error after logging', async () => {
        client.del.mockRejectedValue(new Error('fail'));
        await expect(resetLoginAttempts('x@y.com')).rejects.toThrow('fail');
        expect(logger.error).toHaveBeenCalled();
    });

    test('isLockedOut returns false on error', async () => {
        client.get.mockRejectedValue(new Error('fail'));
        const res = await isLockedOut('x@y.com');
        expect(res).toBe(false);
        expect(logger.error).toHaveBeenCalled();
    });

    test('getResetPasswordToken returns null on error', async () => {
        client.get.mockRejectedValue(new Error('fail'));
        const res = await getResetPasswordToken('u@e.com');
        expect(res).toBeNull();
        expect(logger.error).toHaveBeenCalled();
    });

    test('setResetPasswordToken propagates error after logging', async () => {
        client.setEx.mockRejectedValue(new Error('fail'));
        await expect(setResetPasswordToken('u@e.com', 't', '123')).rejects.toThrow('fail');
        expect(logger.error).toHaveBeenCalled();
    });

    test('deleteResetPasswordToken propagates error after logging', async () => {
        client.del.mockRejectedValue(new Error('fail'));
        await expect(deleteResetPasswordToken('u@e.com')).rejects.toThrow('fail');
        expect(logger.error).toHaveBeenCalled();
    });
});
