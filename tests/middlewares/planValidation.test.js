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
    downgradeUserSubscription: jest.fn()
}));

const { planValidation } = await import('../../src/middlewares/planValidation.js');
const { findArticleBySlugWithPlanRole } = await import('../../src/repositories/articleRepository.js');
const { downgradeUserSubscription } = await import('../../src/repositories/userRepository.js');
const { logger } = await import('../../src/config/logger.js');
const { getRequestMeta } = await import('../../src/config/requestMeta.js');

describe('planValidation middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns 404 when article not found', async () => {
        findArticleBySlugWithPlanRole.mockResolvedValue(null);

        const req = { params: { slug: 's' }, user: {} };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await planValidation(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Article not found' });
        expect(next).not.toHaveBeenCalled();
    });

    test('calls next for FREE article', async () => {
        findArticleBySlugWithPlanRole.mockResolvedValue({ planRole: 'FREE' });

        const req = { params: { slug: 's' }, user: {} };
        const res = {};
        const next = jest.fn();

        await planValidation(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    test('returns 403 and downgrades when subscription expired', async () => {
        findArticleBySlugWithPlanRole.mockResolvedValue({ planRole: 'BASIC' });

        const past = new Date(Date.now() - 1000 * 60 * 60).toISOString();
        const req = { params: { slug: 's' }, user: { subscriptionExpire: past, email: 'a@b.com', subscriptionPlan: 'BASIC' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await planValidation(req, res, next);

        expect(downgradeUserSubscription).toHaveBeenCalledWith('a@b.com');
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Access denied: Please renew your subscription' });
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 403 when user plan is lower than article plan', async () => {
        findArticleBySlugWithPlanRole.mockResolvedValue({ planRole: 'INTERMEDIATE' });

        const req = { params: { slug: 's' }, user: { subscriptionPlan: 'BASIC' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await planValidation(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Access denied: Upgrade your subscription' });
        expect(next).not.toHaveBeenCalled();
    });

    test('calls next when user has adequate plan and not expired', async () => {
        findArticleBySlugWithPlanRole.mockResolvedValue({ planRole: 'BASIC' });

        const future = new Date(Date.now() + 1000 * 60 * 60).toISOString();
        const req = { params: { slug: 's' }, user: { subscriptionPlan: 'PREMIUM', subscriptionExpire: future } };
        const res = {};
        const next = jest.fn();

        await planValidation(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    test('returns 500 on unexpected error', async () => {
        findArticleBySlugWithPlanRole.mockImplementation(() => { throw new Error('boom'); });

        const req = { params: { slug: 's' }, user: {} };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        await planValidation(req, res, next);

        expect(logger.error).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
        expect(next).not.toHaveBeenCalled();
    });
});
