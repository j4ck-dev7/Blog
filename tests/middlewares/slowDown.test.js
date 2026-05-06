import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('express-slow-down', () => ({
    default: jest.fn((opts) => opts)
}));

jest.unstable_mockModule('express-rate-limit', () => ({
    ipKeyGenerator: jest.fn((ip) => `ip:${ip}`)
}));

jest.unstable_mockModule('rate-limit-redis', () => ({
    RedisStore: jest.fn((opts) => ({ opts }))
}));

jest.unstable_mockModule('../../src/config/logger.js', () => ({
    logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn(), debug: jest.fn() }
}));

jest.unstable_mockModule('../../src/config/redis.js', () => ({
    client: { sendCommand: jest.fn() },
    default: { sendCommand: jest.fn() }
}));

jest.unstable_mockModule('../../src/config/requestMeta.js', () => ({
    getRequestMeta: jest.fn().mockReturnValue({ meta: true })
}));

const { ipKeyGenerator } = await import('express-rate-limit');
const { RedisStore } = await import('rate-limit-redis');
const redisMod = await import('../../src/config/redis.js');
const client = redisMod.client || redisMod.default;
const { getRequestMeta } = await import('../../src/config/requestMeta.js');
const { logger } = await import('../../src/config/logger.js');

const {
    authenticationSlowDown,
    createUserSlowDown,
    Oauth2UrlSlowDown,
    Oauth2SlowDown,
    verifyEmailSlowDown,
    articlesSlowDown,
    findArticleBySlugSlowDown,
    findArticlesByTagSlowDown,
    findArticlesBySearchSlowDown,
    addLikeSlowDown,
    allLikesSlowDown,
    deleteLikeSlowDown,
    addCommentSlowDown,
    editCommentSlowDown,
    deleteCommentSlowDown,
    subscriptionSlowDown,
    stripeWebhookSlowDown
} = await import('../../src/middlewares/slowDown.js');

const entries = [
    { name: 'authenticationSlowDown', ref: authenticationSlowDown, prefix: 'slowdown:authentication:' },
    { name: 'createUserSlowDown', ref: createUserSlowDown, prefix: 'slowdown:createUser:' },
    { name: 'Oauth2UrlSlowDown', ref: Oauth2UrlSlowDown, prefix: 'slowdown:oauth2Url:' },
    { name: 'Oauth2SlowDown', ref: Oauth2SlowDown, prefix: 'slowdown:oauth2:' },
    { name: 'verifyEmailSlowDown', ref: verifyEmailSlowDown, prefix: 'slowdown:verifyEmail:' },
    { name: 'articlesSlowDown', ref: articlesSlowDown, prefix: 'slowdown:articles:' },
    { name: 'findArticleBySlugSlowDown', ref: findArticleBySlugSlowDown, prefix: 'slowdown:findArticleBySlug:' },
    { name: 'findArticlesByTagSlowDown', ref: findArticlesByTagSlowDown, prefix: 'slowdown:findArticlesByTag:' },
    { name: 'findArticlesBySearchSlowDown', ref: findArticlesBySearchSlowDown, prefix: 'slowdown:findArticlesBySearch:' },
    { name: 'addLikeSlowDown', ref: addLikeSlowDown, prefix: 'slowdown:addLike:' },
    { name: 'allLikesSlowDown', ref: allLikesSlowDown, prefix: 'slowdown:allLikes:' },
    { name: 'deleteLikeSlowDown', ref: deleteLikeSlowDown, prefix: 'slowdown:deleteLike:' },
    { name: 'addCommentSlowDown', ref: addCommentSlowDown, prefix: 'slowdown:addComment:' },
    { name: 'editCommentSlowDown', ref: editCommentSlowDown, prefix: 'slowdown:editComment:' },
    { name: 'deleteCommentSlowDown', ref: deleteCommentSlowDown, prefix: 'slowdown:deleteComment:' },
    { name: 'subscriptionSlowDown', ref: subscriptionSlowDown, prefix: 'slowdown:subscription:' },
    { name: 'stripeWebhookSlowDown', ref: stripeWebhookSlowDown, prefix: 'slowdown:stripeWebhook:' }
];

describe('SlowDown Middleware - per slowDown', () => {
    for (const entry of entries) {
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

            test('handler logs a warning', () => {
                const req = { ip: '1.1.1.1', originalUrl: '/x' };
                const res = {};
                entry.ref.handler(req, res, null, {});
                expect(logger.warn).toHaveBeenCalled();
                expect(getRequestMeta).toHaveBeenCalledWith(req);
            });

            test('store prefix is correct and sendCommand delegates to redis client', () => {
                expect(entry.ref.store).toBeDefined();
                expect(entry.ref.store.opts).toBeDefined();
                expect(entry.ref.store.opts.prefix).toBe(entry.prefix);

                const send = entry.ref.store.opts.sendCommand;
                send('INCR', 'some:key');
                expect(client.sendCommand).toHaveBeenCalledWith(['INCR', 'some:key']);
            });

            test('has numeric windowMs and delayAfter properties', () => {
                expect(typeof entry.ref.windowMs).toBe('number');
                expect(typeof entry.ref.delayAfter).toBe('number');
            });
        });
    }
});
