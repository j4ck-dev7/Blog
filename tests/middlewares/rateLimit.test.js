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
const { RedisStore } = await import('rate-limit-redis');
const client = (await import('../../src/config/redis.js')).default;
const { getRequestMeta } = await import('../../src/config/requestMeta.js');
const {
    articlesLimit,
    articlesFindByTagLimit,
    articleFindBySlugLimit,
    articlesFindBySearchLimit,
    likesLimit,
    addCommentLimit,
    addLikeLimit,
    deleteLikeLimit,
    deleteCommentLimit,
    editCommentLimit,
    subscribeLimit,
    webhookStripeLimit,
    autenticacaoLimit,
    Oauth2UrlLimit,
    Oauth2AuthenticationLimit
} = await import('../../src/middlewares/rateLimit.js');

const limits = [
    { name: 'articlesLimit', ref: articlesLimit, prefix: 'ratelimit:articles:', limit: 5 },
    { name: 'articlesFindByTagLimit', ref: articlesFindByTagLimit, prefix: 'ratelimit:articlesFindByTag:', limit: 5 },
    { name: 'articleFindBySlugLimit', ref: articleFindBySlugLimit, prefix: 'ratelimit:articlesFindBySlug:', limit: 5 },
    { name: 'articlesFindBySearchLimit', ref: articlesFindBySearchLimit, prefix: 'ratelimit:articlesFindBySearch:', limit: 5 },
    { name: 'likesLimit', ref: likesLimit, prefix: 'ratelimit:likes:', limit: 5 },
    { name: 'addCommentLimit', ref: addCommentLimit, prefix: 'ratelimit:addComment:', limit: 5 },
    { name: 'addLikeLimit', ref: addLikeLimit, prefix: 'ratelimit:addLike:', limit: 5 },
    { name: 'deleteLikeLimit', ref: deleteLikeLimit, prefix: 'ratelimit:deleteLike:', limit: 5 },
    { name: 'deleteCommentLimit', ref: deleteCommentLimit, prefix: 'ratelimit:deleteComment:', limit: 5 },
    { name: 'editCommentLimit', ref: editCommentLimit, prefix: 'ratelimit:editComment:', limit: 5 },
    { name: 'subscribeLimit', ref: subscribeLimit, prefix: 'ratelimit:subscribe:', limit: 5 },
    { name: 'autenticacaoLimit', ref: autenticacaoLimit, prefix: 'ratelimit:authentication:', limit: 6 },
    { name: 'Oauth2UrlLimit', ref: Oauth2UrlLimit, prefix: 'ratelimit:oauth2Url:', limit: 10 },
    { name: 'Oauth2AuthenticationLimit', ref: Oauth2AuthenticationLimit, prefix: 'ratelimit:oauth2:', limit: 10 },
    { name: 'webhookStripeLimit', ref: webhookStripeLimit, prefix: 'ratelimit:webhook:stripe:', limit: 2 }
];

describe('Rate Limit Middleware - per rateLimit', () => {
    for (const entry of limits) {
        describe(entry.name, () => {
            beforeEach(() => jest.clearAllMocks());

            test('keyGenerator: freeAccess user state', () => {
                const req = { user: { state: 'freeAccess' }, ip: '1.2.3.4' };
                const res = entry.ref.keyGenerator(req);
                expect(res).toBe(`freeAccess:${ipKeyGenerator(req.ip)}`);
            });

            test('keyGenerator: user _id present', () => {
                const req = { user: { _id: 'uid-123' }, ip: '1.2.3.4' };
                expect(entry.ref.keyGenerator(req)).toBe('uid-123');
            });

            test('keyGenerator: fallback to ip', () => {
                const req = { ip: '5.6.7.8' };
                expect(entry.ref.keyGenerator(req)).toBe(ipKeyGenerator(req.ip));
            });

            test('keyGenerator: handles null ip', () => {
                const req = { ip: null };
                expect(() => entry.ref.keyGenerator(req)).not.toThrow();
                expect(entry.ref.keyGenerator(req)).toBe(ipKeyGenerator(req.ip));
            });

            test('keyGenerator: does not throw when req.user missing', () => {
                expect(() => entry.ref.keyGenerator({})).not.toThrow();
            });

            test('handler responds with status and message', () => {
                const req = { ip: '1.1.1.1', originalUrl: '/x' };
                const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
                const options = { statusCode: 429, message: 'rate limited' };
                entry.ref.handler(req, res, null, options);
                expect(res.status).toHaveBeenCalledWith(429);
                expect(res.json).toHaveBeenCalledWith({ message: 'rate limited' });
            });

            test('store prefix and limit are correct', () => {
                expect(typeof entry.ref.limit).toBe('number');
                expect(entry.ref.limit).toBe(entry.limit);
                expect(entry.ref.store).toBeDefined();
                expect(entry.ref.store.opts).toBeDefined();
                expect(entry.ref.store.opts.prefix).toBe(entry.prefix);
            });

            test('store.sendCommand delegates to redis client', () => {
                const send = entry.ref.store.opts.sendCommand;
                send('INCR', 'some:key');
                expect(client.sendCommand).toHaveBeenCalledWith(['INCR', 'some:key']);
            });
        });
    }
});
