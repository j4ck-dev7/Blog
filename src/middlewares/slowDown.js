import slowDown from "express-slow-down";
import { RedisStore } from 'rate-limit-redis';
import client from '../config/redis.js';
import { ipKeyGenerator } from "express-rate-limit";
import { logger } from '../config/logger.js';
import { getRequestMeta } from "../config/requestMeta.js";

export const authenticationSlowDown = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 3, // Começa a atrasar após x requisições
    // O delayMs é o atraso aplicado a cada tentativa, seja progressivo ou exponencial.
    delayMs: (hits) => hits ** 2 * 100, // Atraso exponencial.
    maxDelayMs: 25 * 1000,
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'slowdown:authentication:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user && req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}`, getRequestMeta(req));
    }
});

export const createUserSlowDown = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 3, // Começa a atrasar após x requisições
    // O delayMs é o atraso aplicado a cada tentativa, seja progressivo ou exponencial.
    delayMs: (hits) => hits ** 2 * 100, // Atraso exponencial.
    maxDelayMs: 25 * 1000,
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'slowdown:createUser:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user && req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}`, getRequestMeta(req));
    }
});

export const Oauth2UrlSlowDown = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 5, // Começa a atrasar após x requisições
    // O delayMs é o atraso aplicado a cada tentativa, seja progressivo ou exponencial.
    delayMs: (hits) => hits ** 2 * 100, // Atraso exponencial.
    maxDelayMs: 25 * 1000,
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'slowdown:oauth2Url:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user && req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}`, getRequestMeta(req));
    }
});

export const Oauth2SlowDown = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 5, // Começa a atrasar após x requisições
    // O delayMs é o atraso aplicado a cada tentativa, seja progressivo ou exponencial.
    delayMs: (hits) => hits ** 2 * 100, // Atraso exponencial.
    maxDelayMs: 25 * 1000,
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'slowdown:oauth2:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user && req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}, aplicando atraso`, getRequestMeta(req));
    }
});

export const verifyEmailSlowDown = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 1, // Começa a atrasar após x requisições
    // O delayMs é o atraso aplicado a cada tentativa, seja progressivo ou exponencial.
    delayMs: (hits) => hits ** 4 * 100, // Atraso exponencial.
    maxDelayMs: 25 * 1000,
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'slowdown:verifyEmail:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user && req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}, aplicando atraso`, getRequestMeta(req));

    }
});

export const articlesSlowDown = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 10, // Começa a atrasar após x requisições
    // O delayMs é o atraso aplicado a cada tentativa, seja progressivo ou exponencial.
    delayMs: (hits) => hits ** 2 * 100,
    maxDelayMs: 25 * 1000,
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'slowdown:articles:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user && req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}, aplicando atraso`, getRequestMeta(req));
    }
});

export const findArticleBySlugSlowDown = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 10, // Começa a atrasar após x requisições
    // O delayMs é o atraso aplicado a cada tentativa, seja progressivo ou exponencial.
    delayMs: (hits) => hits ** 4 * 100, // Atraso exponencial.
    maxDelayMs: 25 * 1000,
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'slowdown:findArticleBySlug:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user && req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}, aplicando atraso`, getRequestMeta(req));
    }
});

export const findArticlesByTagSlowDown = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 1, // Começa a atrasar após x requisições
    // O delayMs é o atraso aplicado a cada tentativa, seja progressivo ou exponencial.
    delayMs: (hits) => hits ** 4 * 100, // Atraso exponencial.
    maxDelayMs: 25 * 1000,
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'slowdown:findArticlesByTag:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user && req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}, aplicando atraso`, getRequestMeta(req));
    }
});

export const findArticlesBySearchSlowDown = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 1, // Começa a atrasar após x requisições
    // O delayMs é o atraso aplicado a cada tentativa, seja progressivo ou exponencial.
    delayMs: (hits) => hits ** 4 * 100, // Atraso exponencial.
    maxDelayMs: 25 * 1000,
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'slowdown:findArticlesBySearch:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user && req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}, aplicando atraso`, getRequestMeta(req));
    }
});

export const addLikeSlowDown = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 1, // Começa a atrasar após x requisições
    // O delayMs é o atraso aplicado a cada tentativa, seja progressivo ou exponencial.
    delayMs: (hits) => hits ** 4 * 100, // Atraso exponencial.
    maxDelayMs: 25 * 1000,
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'slowdown:addLike:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user && req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}, aplicando atraso`, getRequestMeta(req));
    }
});

export const allLikesSlowDown = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 1, // Começa a atrasar após x requisições
    // O delayMs é o atraso aplicado a cada tentativa, seja progressivo ou exponencial.
    delayMs: (hits) => hits ** 4 * 100, // Atraso exponencial.
    maxDelayMs: 25 * 1000,
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'slowdown:allLikes:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user && req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}, aplicando atraso`, getRequestMeta(req));
    }
});

export const deleteLikeSlowDown = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 1, // Começa a atrasar após x requisições
    // O delayMs é o atraso aplicado a cada tentativa, seja progressivo ou exponencial.
    delayMs: (hits) => hits ** 4 * 100, // Atraso exponencial.
    maxDelayMs: 25 * 1000,
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'slowdown:deleteLike:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user && req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}, aplicando atraso`, getRequestMeta(req));
    }
});

export const addCommentSlowDown = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 1, // Começa a atrasar após x requisições
    // O delayMs é o atraso aplicado a cada tentativa, seja progressivo ou exponencial.
    delayMs: (hits) => hits ** 4 * 100, // Atraso exponencial.
    maxDelayMs: 25 * 1000,
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'slowdown:addComment:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user && req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}, aplicando atraso`, getRequestMeta(req));
    }
});

export const editCommentSlowDown = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 1, // Começa a atrasar após x requisições
    // O delayMs é o atraso aplicado a cada tentativa, seja progressivo ou exponencial.
    delayMs: (hits) => hits ** 4 * 100, // Atraso exponencial.
    maxDelayMs: 25 * 1000,
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'slowdown:editComment:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user && req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}, aplicando atraso`, getRequestMeta(req));
    }
});

export const deleteCommentSlowDown = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 1, // Começa a atrasar após x requisições
    // O delayMs é o atraso aplicado a cada tentativa, seja progressivo ou exponencial.
    delayMs: (hits) => hits ** 4 * 100, // Atraso exponencial.
    maxDelayMs: 25 * 1000,
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'slowdown:deleteComment:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user && req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}, aplicando atraso`, getRequestMeta(req));
    }
});

export const subscriptionSlowDown = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 1, // Começa a atrasar após x requisições
    // O delayMs é o atraso aplicado a cada tentativa, seja progressivo ou exponencial.
    delayMs: (hits) => hits ** 4 * 100, // Atraso exponencial.
    maxDelayMs: 25 * 1000,
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'slowdown:subscription:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user && req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}, aplicando atraso`, getRequestMeta(req));
    }
});

export const stripeWebhookSlowDown = slowDown({
    windowMs: 60 * 1000,
    delayAfter: 1, // Começa a atrasar após x requisições
    // O delayMs é o atraso aplicado a cada tentativa, seja progressivo ou exponencial.
    delayMs: (hits) => hits ** 4 * 100, // Atraso exponencial.
    maxDelayMs: 25 * 1000,
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'slowdown:stripeWebhook:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user && req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}, aplicando atraso`, getRequestMeta(req));
    }
});