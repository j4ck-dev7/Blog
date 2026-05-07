import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/config/logger.js', () => ({
    logger: { error: jest.fn() }
}));

jest.unstable_mockModule('../../src/config/requestMeta.js', () => ({
    getRequestMeta: jest.fn().mockImplementation((req, extra) => ({ ip: req?.ip || '127.0.0.1', route: req?.originalUrl || req?.url || '/', method: req?.method || 'GET', ...extra }))
}));

const { authInteractions } = await import('../../src/middlewares/authorizationInteractions.js');
const { logger } = await import('../../src/config/logger.js');
const { getRequestMeta } = await import('../../src/config/requestMeta.js');

describe('authInteractions middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns 401 when req.user has no _id', () => {
        const req = { user: {} };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        authInteractions(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized. Please register or login to perform this action' });
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 401 when user.state is freeAccess', () => {
        const req = { user: { _id: '1', state: 'freeAccess' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        authInteractions(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized. Please register or login to perform this action' });
        expect(next).not.toHaveBeenCalled();
    });

    test('calls next when user is authorized', () => {
        const req = { user: { _id: '1', state: 'premium' } };
        const res = {};
        const next = jest.fn();

        authInteractions(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    test('returns 500 on unexpected error', () => {
        const req = {}; // accessing req.user._id will throw
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        authInteractions(req, res, next);

        expect(logger.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
        expect(next).not.toHaveBeenCalled();
    });
});
