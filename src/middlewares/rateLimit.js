import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { logger } from '../config/logger.js';
import { RedisStore } from 'rate-limit-redis';
import { client } from '../config/redis.js';
import { getRequestMeta } from '../config/requestMeta.js';

// Em rotas do tipo get, que há apenas leituras no DB, o recomendado é de 300 requisições por minuto, desde que não seja feito alguma consulta
// banco de dados.
export const articlesLimit = rateLimit({
    windowMs: 60 * 1000, // Tempo de janela em milissegundos
    limit: 5, // Limite de requisições por janela (windowMs) pelo ip
    standardHeaders: true, // Retorna as informações do rate limit dentro dos cabeçalhos do RateLimit-*
    legacyHeaders: false, // Desativa os cabeçalhos X-RateLimit-*
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'ratelimit:articles:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    message: 'Muitas requisições, por favor tente novamente mais tarde.',
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}`, getRequestMeta(req));
        res.status(options.statusCode).json({ message: options.message });
    }
});

export const articlesFindByTagLimit = rateLimit({
    windowMs: 60 * 1000, // Tempo de janela em milissegundos
    limit: 5, // Limite de requisições por janela (windowMs) pelo ip
    standardHeaders: true, // Retorna as informações do rate limit dentro dos cabeçalhos do RateLimit-*
    legacyHeaders: false, // Desativa os cabeçalhos X-RateLimit-*
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'ratelimit:articlesFindByTag:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    message: 'Muitas requisições, por favor tente novamente mais tarde.',
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}`, getRequestMeta(req));
        res.status(options.statusCode).json({ message: options.message });
    }
});

export const articleFindBySlugLimit = rateLimit({
    windowMs: 60 * 1000, // Tempo de janela em milissegundos
    limit: 5, // Limite de requisições por janela (windowMs) pelo ip
    standardHeaders: true, // Retorna as informações do rate limit dentro dos cabeçalhos do RateLimit-*
    legacyHeaders: false, // Desativa os cabeçalhos X-RateLimit-*
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'ratelimit:articlesFindBySlug:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    message: 'Muitas requisições, por favor tente novamente mais tarde.',
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}`, getRequestMeta(req));
        res.status(options.statusCode).json({ message: options.message });
    }
});

export const articlesFindBySearchLimit = rateLimit({
    windowMs: 60 * 1000, // Tempo de janela em milissegundos
    limit: 5, // Limite de requisições por janela (windowMs) pelo ip
    standardHeaders: true, // Retorna as informações do rate limit dentro dos cabeçalhos do RateLimit-*
    legacyHeaders: false, // Desativa os cabeçalhos X-RateLimit-*
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'ratelimit:articlesFindBySearch:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    message: 'Muitas requisições, por favor tente novamente mais tarde.',
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}`, getRequestMeta(req));
        res.status(options.statusCode).json({ message: options.message });
    }
});

export const likesLimit = rateLimit({ 
    windowMs: 60 * 1000, // Tempo de janela em milissegundos
    limit: 5, // Limite de requisições por janela (windowMs) pelo ip
    standardHeaders: true, // Retorna as informações do rate limit dentro dos cabeçalhos do RateLimit-*
    legacyHeaders: false, // Desativa os cabeçalhos X-RateLimit-*
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'ratelimit:likes:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    message: 'Muitas requisições, por favor tente novamente mais tarde.',
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}`, getRequestMeta(req));
        res.status(options.statusCode).json({ message: options.message });
    }
});

export const addCommentLimit = rateLimit({
    windowMs: 60 * 1000, // Tempo de janela em milissegundos
    limit: 5, // Limite de requisições por janela (windowMs) pelo ip
    standardHeaders: true, // Retorna as informações do rate limit dentro dos cabeçalhos do RateLimit-*
    legacyHeaders: false, // Desativa os cabeçalhos X-RateLimit-*
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'ratelimit:addComment:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    message: 'Muitas requisições, por favor tente novamente mais tarde.',
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}`, getRequestMeta(req));
        res.status(options.statusCode).json({ message: options.message });
    }
});

export const addLikeLimit = rateLimit({
    windowMs: 60 * 1000, // Tempo de janela em milissegundos
    limit: 5, // Limite de requisições por janela (windowMs) pelo ip
    standardHeaders: true, // Retorna as informações do rate limit dentro dos cabeçalhos do RateLimit-*
    legacyHeaders: false, // Desativa os cabeçalhos X-RateLimit-*
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'ratelimit:addLike:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    message: 'Muitas requisições, por favor tente novamente mais tarde.',
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}`, getRequestMeta(req));
        res.status(options.statusCode).json({ message: options.message });
    }
});

export const deleteLikeLimit = rateLimit({
    windowMs: 60 * 1000, // Tempo de janela em milissegundos
    limit: 5, // Limite de requisições por janela (windowMs) pelo ip
    standardHeaders: true, // Retorna as informações do rate limit dentro dos cabeçalhos do RateLimit-*
    legacyHeaders: false, // Desativa os cabeçalhos X-RateLimit-*
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'ratelimit:deleteLike:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    message: 'Muitas requisições, por favor tente novamente mais tarde.',
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}`, getRequestMeta(req));
        res.status(options.statusCode).json({ message: options.message });
    }
});

export const deleteCommentLimit = rateLimit({
    windowMs: 60 * 1000, // Tempo de janela em milissegundos
    limit: 5, // Limite de requisições por janela (windowMs) pelo ip
    standardHeaders: true, // Retorna as informações do rate limit dentro dos cabeçalhos do RateLimit-*
    legacyHeaders: false, // Desativa os cabeçalhos X-RateLimit-*
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'ratelimit:deleteComment:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    message: 'Muitas requisições, por favor tente novamente mais tarde.',
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}`, getRequestMeta(req));
        res.status(options.statusCode).json({ message: options.message });
    }
});

export const editCommentLimit = rateLimit({
    windowMs: 60 * 1000, // Tempo de janela em milissegundos
    limit: 5, // Limite de requisições por janela (windowMs) pelo ip
    standardHeaders: true, // Retorna as informações do rate limit dentro dos cabeçalhos do RateLimit-*
    legacyHeaders: false, // Desativa os cabeçalhos X-RateLimit-*
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'ratelimit:editComment:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    message: 'Muitas requisições, por favor tente novamente mais tarde.',
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}`, getRequestMeta(req));
        res.status(options.statusCode).json({ message: options.message });
    }
});

export const subscribeLimit = rateLimit({
    windowMs: 60 * 1000, // Tempo de janela em milissegundos
    limit: 5, // Limite de requisições por janela (windowMs) pelo ip
    standardHeaders: true, // Retorna as informações do rate limit dentro dos cabeçalhos do RateLimit-*
    legacyHeaders: false, // Desativa os cabeçalhos X-RateLimit-*
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'ratelimit:subscribe:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    message: 'Muitas requisições, por favor tente novamente mais tarde.',
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}`, getRequestMeta(req));
        res.status(options.statusCode).json({ message: options.message });
    }
});

export const webhookStripeLimit = rateLimit({
    windowMs: 60 * 1000, // Tempo de janela em milissegundos
    limit: 2, // Limite de requisições por janela (windowMs) pelo ip
    standardHeaders: true, // Retorna as informações do rate limit dentro dos cabeçalhos do RateLimit-*
    legacyHeaders: false, // Desativa os cabeçalhos X-RateLimit-*
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'ratelimit:webhook:stripe:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    message: 'Muitas requisições, por favor tente novamente mais tarde.',
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}`, getRequestMeta(req));
        res.status(options.statusCode).json({ message: options.message });
    }
});

// Em rotas Post para autenticação, o recomendado é de 3-6 requisições a cada 15 minutos, isso previne ataques de 
// força bruta.
export const autenticacaoLimit = rateLimit({
    windowMs: 60 * 1000,
    limit: 6,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'ratelimit:authentication:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    message: 'Você excedeu o limite de requisições, por favor tente novamente mais tarde.',
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}`, getRequestMeta(req));
        res.status(options.statusCode).json({ message: options.message });
    }
});

// Rate-limit para rotas para obter a url de autenticação Oauth
export const Oauth2UrlLimit = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'ratelimit:oauth2Url:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    message: 'Você excedeu o limite de requisições, por favor tente novamente mais tarde.',
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}`, getRequestMeta(req));
        res.status(options.statusCode).json({ message: options.message });
    }
});

// Rate-limit para rotas de autenticação Oauth, 10 requisições a cada 15 minutos, isso previne ataques de força
// bruta, já que nesta rota envolver consultas | escritas no banco de dados.
export const Oauth2AuthenticationLimit = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => client.sendCommand(args),
        prefix: 'ratelimit:oauth2:'
    }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
    keyGenerator: (req) => {
        if(req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

        if(req.user && req.user._id) return req.user._id
        return ipKeyGenerator(req.ip)
    },
    message: 'Você excedeu o limite de requisições, por favor tente novamente mais tarde.',
    handler: (req, res, next, options) => {
        logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}`, getRequestMeta(req));
        res.status(options.statusCode).json({ message: options.message });
    }
});

// export const verifyEmailLimit = rateLimit({
//     windowMs: 60 * 1000,
//     limit: 2,
//     standardHeaders: true,
//     legacyHeaders: false,
//     store: new RedisStore({
//         sendCommand: (...args) => client.sendCommand(args),
//         prefix: 'ratelimit:verifyEmail:'
//     }), // Onde armazenar os dados do rate limit, neste caso usando Redis, o que é recomendado para aplicações em produção, já que o armazenamento em memória (MemoryStore) não é recomendado para produção, pois não é escalável e pode causar problemas de memória.
//     keyGenerator: (req) => {
//         if(req.user.state && req.user.state === 'freeAccess') return `freeAccess:${ipKeyGenerator(req.ip)}`

//         if(req.user && req.user._id) return req.user._id
//         return ipKeyGenerator(req.ip)
//     },
//     message: 'Você excedeu o limite de requisições, por favor tente novamente mais tarde.',
//     handler: (req, res, next, options) => {
//         logger.warn(`IP ${req.ip} excedeu o limite de requisições para a rota ${req.originalUrl}`, getRequestMeta(req));
//         res.status(options.statusCode).json({ message: options.message });
//     }
// });