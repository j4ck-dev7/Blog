import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/config/logger.js', () => ({
    logger: { error: jest.fn() }
}));

jest.unstable_mockModule('../../src/config/requestMeta.js', () => ({
    getRequestMeta: jest.fn().mockImplementation((req, extra) => ({ ip: req?.ip || '127.0.0.1', route: req?.originalUrl || req?.url || '/', method: req?.method || 'GET', ...extra }))
}));

jest.unstable_mockModule('../../src/repositories/articleRepository.js', () => ({
    findArticleBySlugWithPlanRole: jest.fn()
}));

jest.unstable_mockModule('../../src/repositories/userRepository.js', () => ({
    getUserByIdVerifyCredentials: jest.fn(),
}));

const { credentialsAuth } = await import('../../src/middlewares/credentialsAuth.js');
const { findArticleBySlugWithPlanRole } = await import('../../src/repositories/articleRepository.js');
const { getUserByIdVerifyCredentials } = await import('../../src/repositories/userRepository.js');
const { logger } = await import('../../src/config/logger.js');
const { getRequestMeta } = await import('../../src/config/requestMeta.js');

describe('credentialsAuth middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns 404 when article not found', async () => {
        findArticleBySlugWithPlanRole.mockResolvedValue(null);

        const req = { params: { slug: 's' }, user: {} };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await credentialsAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Article not found' });
        expect(next).not.toHaveBeenCalled();
    });

    test('calls next for FREE article', async () => {
        findArticleBySlugWithPlanRole.mockResolvedValue({ planRole: 'FREE' });

        const req = { params: { slug: 's' }, user: {} };
        const res = {};
        const next = jest.fn();

        await credentialsAuth(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    test('returns 401 when user state is freeAccess and article requires plan', async () => {
        findArticleBySlugWithPlanRole.mockResolvedValue({ planRole: 'BASIC' });

        const req = { params: { slug: 's' }, user: { state: 'freeAccess' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await credentialsAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized. To access this content, please subscribe.' });
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 401 when credentials do not match', async () => {
        findArticleBySlugWithPlanRole.mockResolvedValue({ planRole: 'BASIC' });

        const req = {
            params: { slug: 's' },
            user: { _id: 'u1', email: 'a@b.com', subscriptionPlan: 'BASIC', subscriptionExpire: '2099-01-01T00:00:00.000Z', name: 'TokenName' }
        };

        getUserByIdVerifyCredentials.mockResolvedValue({ email: 'other@b.com', subscriptionPlan: 'BASIC', subscriptionExpiresAt: '2099-01-01T00:00:00.000Z', name: 'DbName' });

        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await credentialsAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized. Invalid credentials.' });
        expect(next).not.toHaveBeenCalled();
    });

    test('calls next when credentials are valid', async () => {
        findArticleBySlugWithPlanRole.mockResolvedValue({ planRole: 'BASIC' });

        const req = {
            params: { slug: 's' },
            user: { _id: 'u1', email: 'a@b.com', subscriptionPlan: 'BASIC', subscriptionExpire: '2099-01-01T00:00:00.000Z', name: 'Same' }
        };

        getUserByIdVerifyCredentials.mockResolvedValue({ email: 'a@b.com', subscriptionPlan: 'BASIC', subscriptionExpiresAt: '2099-01-01T00:00:00.000Z', name: 'Same' });

        const res = {};
        const next = jest.fn();

        await credentialsAuth(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    test('returns 500 on unexpected error', async () => {
        findArticleBySlugWithPlanRole.mockImplementation(() => { throw new Error('boom'); });

        const req = { params: { slug: 's' }, user: {} };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await credentialsAuth(req, res, next);

        expect(logger.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
        expect(next).not.toHaveBeenCalled();
    });
});
