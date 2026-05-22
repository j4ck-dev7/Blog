import slowDown from 'express-slow-down';
import { RedisStore } from 'rate-limit-redis';
import { client } from '../config/redis.js';
import { ipKeyGenerator } from 'express-rate-limit';
import { logger } from '../config/logger.js';
import { getRequestMeta } from '../config/requestMeta.js';

const getSlowDownKey = (req) => {
  if (req.user?.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`;
  if (req.user?._id) return req.user._id;
  return ipKeyGenerator(req.ip);
};

const createSlowdown = ({ windowMs, limit, basePrefix, delayMs, maxDelayMs }) => (scope = '') => {
  const normalizedScope = scope ? `${scope}:` : '';
  const delayAfter = Math.max(1, Math.ceil(limit / 3));

  return slowDown({
    windowMs,
    delayAfter,
    delayMs: delayMs ?? ((hits) => hits ** 2 * 100),
    maxDelayMs,
    store: new RedisStore({
      sendCommand: (...args) => client.sendCommand(args),
      prefix: `${basePrefix}${normalizedScope}`
    }),
    keyGenerator: getSlowDownKey,
    handler: (req, res, next, options) => {
      logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}, aplicando atraso`, getRequestMeta(req));
    }
  });
};

export const lightSlowDown = createSlowdown({
  windowMs: 60 * 1000,
  limit: 30,
  basePrefix: 'slowdown:light:',
  maxDelayMs: 25 * 1000
});

export const heavySlowDown = createSlowdown({
  windowMs: 60 * 1000,
  limit: 5,
  basePrefix: 'slowdown:heavy:',
  maxDelayMs: 25 * 1000
});

export const sensitiveSlowDown = createSlowdown({
  windowMs: 15 * 60 * 1000,
  limit: 2,
  basePrefix: 'slowdown:sensitive:',
  delayMs: (hits) => hits ** 2 * 100,
  maxDelayMs: 25 * 1000
});
