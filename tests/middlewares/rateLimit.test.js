import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('express-rate-limit', () => ({
    rateLimit: jest.fn((opts) => opts),
    ipKeyGenerator: jest.fn((ip) => `ip:${ip}`)
}));

jest.unstable_mockModule('rate-limit-redis', () => ({
    RedisStore: jest.fn((opts) => ({ opts }))
}));

jest.unstable_mockModule('../../src/config/logger.js', () => ({
    logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn(), debug: jest.fn() }
}));

jest.unstable_mockModule('../../src/config/redis.js', () => ({
    default: { sendCommand: jest.fn() }
}));

jest.unstable_mockModule('../../src/config/requestMeta.js', () => ({
    getRequestMeta: jest.fn().mockReturnValue({ meta: true })
}));

const { rateLimit, ipKeyGenerator } = await import('express-rate-limit');
const client = (await import('../../src/config/redis.js')).default;
const { getRequestMeta } = await import('../../src/config/requestMeta.js');
const {
    lightRateLimit,
    heavyRateLimit,
    sensitiveRateLimit
} = await import('../../src/middlewares/rateLimit.js');

const entries = [
    { name: 'lightRateLimit', fn: lightRateLimit, scope: 'articles', prefix: 'ratelimit:light:articles:', limit: 30, windowMs: 60 * 1000 },
    { name: 'lightRateLimit', fn: lightRateLimit, scope: 'articlesFindByTag', prefix: 'ratelimit:light:articlesFindByTag:', limit: 30, windowMs: 60 * 1000 },
    { name: 'heavyRateLimit', fn: heavyRateLimit, scope: 'addComment', prefix: 'ratelimit:heavy:addComment:', limit: 5, windowMs: 60 * 1000 },
    { name: 'heavyRateLimit', fn: heavyRateLimit, scope: 'editComment', prefix: 'ratelimit:heavy:editComment:', limit: 5, windowMs: 60 * 1000 },
    { name: 'sensitiveRateLimit', fn: sensitiveRateLimit, scope: 'subscribe', prefix: 'ratelimit:sensitive:subscribe:', limit: 2, windowMs: 15 * 60 * 1000 }
];

describe('Rate Limit Middleware', () => {
    beforeEach(() => jest.clearAllMocks());

    test('keyGenerator: freeAccess user state returns freeAccess prefix', () => {
        const req = { user: { state: 'freeAccess' }, ip: '1.2.3.4' };
        const opts = lightRateLimit('articles');
        expect(opts.keyGenerator(req)).toBe(`freeAccess:${ipKeyGenerator(req.ip)}`);
    });

    test('keyGenerator: user _id present returns user id', () => {
        const req = { user: { _id: 'uid-123' }, ip: '1.2.3.4' };
        const opts = heavyRateLimit('addComment');
        expect(opts.keyGenerator(req)).toBe('uid-123');
    });

    test('keyGenerator: fallback to ip uses ipKeyGenerator', () => {
        const req = { ip: '5.6.7.8' };
        const opts = sensitiveRateLimit('subscribe');
        expect(opts.keyGenerator(req)).toBe(ipKeyGenerator(req.ip));
    });

    test('handler responds with status and message', () => {
        const req = { ip: '1.1.1.1', originalUrl: '/x' };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const options = { statusCode: 429, message: 'rate limited' };
        const opts = heavyRateLimit('addComment');
        opts.handler(req, res, null, options);
        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.json).toHaveBeenCalledWith({ message: 'rate limited' });
    });

    for (const entry of entries) {
        describe(entry.name, () => {
            test(`creates a rate limit config for ${entry.scope}`, () => {
                const opts = entry.fn(entry.scope);
                expect(opts.windowMs).toBe(entry.windowMs);
                expect(opts.limit).toBe(entry.limit);
                expect(opts.store).toBeDefined();
                expect(opts.store.opts.prefix).toBe(entry.prefix);
                expect(opts.message).toContain('requis');
            });

            test('store.sendCommand delegates to redis client', () => {
                const opts = entry.fn(entry.scope);
                opts.store.opts.sendCommand('INCR', 'some:key');
                expect(client.sendCommand).toHaveBeenCalledWith(['INCR', 'some:key']);
            });
        });
    }
});
