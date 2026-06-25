import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { logger } from '../config/logger.js';
import { RedisStore } from 'rate-limit-redis';
import client from '../config/redis.js';
import { getRequestMeta } from '../config/requestMeta.js';

// [SECURITY FIX - V12] Chave de rate limit usa IP para anônimos, evita compartilhamento de chave
const getRateLimitKey = (req) => {
  if (req.user?._id && req.user._id !== 'freeAccess') return req.user._id;
  return `ip:${ipKeyGenerator(req.ip)}`;
};

const createLimit = ({ windowMs, limit, prefix, message }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args) => client.sendCommand(args),
      prefix
    }),
    keyGenerator: getRateLimitKey,
    message,
    handler: (req, res, next, options) => {
      logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}`, getRequestMeta(req));
      res.status(options.statusCode).json({ message: options.message });
    }
  });

const createScopedLimit = ({ windowMs, limit, basePrefix, message }) => (scope = '') => {
  const normalizedScope = scope ? `${scope}:` : '';
  return createLimit({
    windowMs,
    limit,
    prefix: `${basePrefix}${normalizedScope}`,
    message
  });
};

export const lightRateLimit = createScopedLimit({
  windowMs: 60 * 1000,
  limit: 30,
  basePrefix: 'ratelimit:light:',
  message: 'Muitas requisições, por favor tente novamente mais tarde.'
});

export const heavyRateLimit = createScopedLimit({
  windowMs: 60 * 1000,
  limit: 5,
  basePrefix: 'ratelimit:heavy:',
  message: 'Muitas requisições, por favor tente novamente mais tarde.'
});

export const sensitiveRateLimit = createScopedLimit({
  windowMs: 15 * 60 * 1000,
  limit: 2,
  basePrefix: 'ratelimit:sensitive:',
  message: 'Você excedeu o limite de requisições, por favor tente novamente mais tarde.'
});
