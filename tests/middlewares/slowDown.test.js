import { describe, test, expect, jest, beforeEach } from '@jest/globals';

const createMockMiddleware = (options) => {
  const middleware = (req, res, next) => {
    next();
  };
  middleware.options = options;
  return middleware;
};

jest.unstable_mockModule('express-slow-down', () => ({
  default: jest.fn((options) => createMockMiddleware(options)),
  slowDown: jest.fn((options) => createMockMiddleware(options))
}));

jest.unstable_mockModule('express-rate-limit', () => ({
  ipKeyGenerator: jest.fn((ip) => `ip:${ip}`)
}));

jest.unstable_mockModule('rate-limit-redis', () => ({
  RedisStore: jest.fn((options) => ({
    sendCommand: options.sendCommand,
    prefix: options.prefix
  }))
}));

jest.unstable_mockModule('../../src/config/logger.js', () => ({
  logger: { warn: jest.fn(), info: jest.fn(), error: jest.fn(), debug: jest.fn() }
}));

jest.unstable_mockModule('../../src/config/redis.js', () => ({
  client: { sendCommand: jest.fn() }
}));

jest.unstable_mockModule('../../src/config/requestMeta.js', () => ({
  getRequestMeta: jest.fn().mockReturnValue({ meta: true })
}));

const { ipKeyGenerator } = await import('express-rate-limit');
const { getRequestMeta } = await import('../../src/config/requestMeta.js');
const { logger } = await import('../../src/config/logger.js');
const mockRedisClient = (await import('../../src/config/redis.js')).client;

const {
  lightSlowDown,
  heavySlowDown,
  sensitiveSlowDown
} = await import('../../src/middlewares/slowDown.js');

const entries = [
  { name: 'lightSlowDown', fn: lightSlowDown, scope: 'articles', prefix: 'slowdown:light:articles:', windowMs: 60 * 1000, limit: 30 },
  { name: 'lightSlowDown', fn: lightSlowDown, scope: 'articlesFindByTag', prefix: 'slowdown:light:articlesFindByTag:', windowMs: 60 * 1000, limit: 30 },
  { name: 'heavySlowDown', fn: heavySlowDown, scope: 'addComment', prefix: 'slowdown:heavy:addComment:', windowMs: 60 * 1000, limit: 5 },
  { name: 'heavySlowDown', fn: heavySlowDown, scope: 'editComment', prefix: 'slowdown:heavy:editComment:', windowMs: 60 * 1000, limit: 5 },
  { name: 'sensitiveSlowDown', fn: sensitiveSlowDown, scope: 'subscribe', prefix: 'slowdown:sensitive:subscribe:', windowMs: 15 * 60 * 1000, limit: 2 }
];

describe('SlowDown Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('keyGenerator: freeAccess user state returns freeAccess prefix', () => {
    const req = { user: { state: 'freeAccess' }, ip: '1.2.3.4' };
    const opts = lightSlowDown('articles');
    expect(opts.options.keyGenerator(req)).toBe(`freeAccess:${ipKeyGenerator(req.ip)}`);
  });

  test('keyGenerator: user _id present returns user id', () => {
    const req = { user: { _id: 'uid-123' }, ip: '1.2.3.4' };
    const opts = heavySlowDown('addComment');
    expect(opts.options.keyGenerator(req)).toBe('uid-123');
  });

  test('keyGenerator: fallback to ip uses ipKeyGenerator', () => {
    const req = { ip: '5.6.7.8' };
    const opts = sensitiveSlowDown('subscribe');
    expect(opts.options.keyGenerator(req)).toBe(ipKeyGenerator(req.ip));
  });

  test('handler logs a warning and uses request meta', () => {
    const req = { ip: '1.1.1.1', originalUrl: '/x' };
    const res = {};
    const opts = heavySlowDown('addComment');
    opts.options.handler(req, res, null, {});
    expect(logger.warn).toHaveBeenCalled();
    expect(getRequestMeta).toHaveBeenCalledWith(req);
  });

  for (const entry of entries) {
    describe(entry.name, () => {
      test(`creates correct slowDown config for ${entry.scope}`, () => {
        const opts = entry.fn(entry.scope);
        expect(opts.options.windowMs).toBe(entry.windowMs);
        expect(opts.options.delayAfter).toBeGreaterThanOrEqual(Math.ceil(entry.limit / 3));
        expect(opts.options.keyGenerator).toBeDefined();
        expect(opts.options.store.prefix).toBe(entry.prefix);
      });

      test('slowdown store sendCommand is configured', () => {
        const opts = entry.fn(entry.scope);
        expect(opts.options.store.sendCommand).toBeDefined();
        opts.options.store.sendCommand('INCR', 'some:key');
        expect(mockRedisClient.sendCommand).toHaveBeenCalledWith(['INCR', 'some:key']);
      });
    });
  }
});
