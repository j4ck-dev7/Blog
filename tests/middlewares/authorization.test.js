import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/config/logger.js', () => ({
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() }
}));

jest.unstable_mockModule('../../src/config/requestMeta.js', () => ({
    getRequestMeta: jest.fn().mockImplementation((req, extra) => ({ ip: req?.ip || '127.0.0.1', route: req?.originalUrl || req?.url || '/', method: req?.method || 'GET', ...extra }))
}));

jest.unstable_mockModule('../../src/repositories/userRepository.js', () => ({
    verifyIfUserIsVerified: jest.fn()
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
    default: { verify: jest.fn() }
}));

jest.unstable_mockModule('@paralleldrive/cuid2', () => ({
    isCuid: jest.fn()
}));

const { auth } = await import('../../src/middlewares/authorization.js');
const { logger } = await import('../../src/config/logger.js');
const { getRequestMeta } = await import('../../src/config/requestMeta.js');
const { verifyIfUserIsVerified } = await import('../../src/repositories/userRepository.js');
const jwt = await import('jsonwebtoken');
const { isCuid } = await import('@paralleldrive/cuid2');

describe('Authorization middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should set freeAccess cookie and call next when no cookie present', async () => {
        const req = { cookies: {} };
        const res = { cookie: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await auth(req, res, next);

        expect(res.cookie).toHaveBeenCalledWith('userAuth', 'freeAccess', expect.objectContaining({ secure: true, httpOnly: true }));
        expect(req.user).toEqual({ state: 'freeAccess' });
        expect(next).toHaveBeenCalled();
    });

    test('should return 400 when id from cookie is not a valid cuid', async () => {
        isCuid.mockReturnValue(false);

        const req = { cookies: { userAuth: { id: 'not-a-cuid' } } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), cookie: jest.fn() };
        const next = jest.fn();

        await auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid id format' });
        expect(next).not.toHaveBeenCalled();
    });

    test('should return 403 when user not found', async () => {
        isCuid.mockReturnValue(true);
        verifyIfUserIsVerified.mockResolvedValue(null);

        const req = { cookies: { userAuth: { id: 'cuid123valid' } } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), cookie: jest.fn() };
        const next = jest.fn();

        await auth(req, res, next);

        expect(verifyIfUserIsVerified).toHaveBeenCalledWith('cuid123valid');
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        expect(next).not.toHaveBeenCalled();
    });

    test('should return 500 when jwt.verify throws (invalid token)', async () => {
        isCuid.mockReturnValue(true);
        verifyIfUserIsVerified.mockResolvedValue({ isEmailVerified: true });
        jwt.default.verify.mockImplementation(() => { throw new Error('invalid token'); });

        const req = { cookies: { userAuth: { id: 'validcuid' } } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), cookie: jest.fn() };
        const next = jest.fn();

        await auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
        expect(next).not.toHaveBeenCalled();
    });
});
