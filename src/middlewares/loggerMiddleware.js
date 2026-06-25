import { logger } from "../config/logger.js";
import { getRequestMeta } from "../config/requestMeta.js";

export const loggerMiddleware = (req, res, next) => {
    const inicio = Date.now();

    const originalSend = res.send 
    res.send = function(data) {
        const duracao = Date.now() - inicio;

        logger.info('Requisição HTTP', getRequestMeta(req, {
            statusCode: res.statusCode,
            duracao: `${duracao}ms`,
        }));

        if(res.statusCode >= 400) {
            const d = Date.now() - inicio;

            // [SECURITY FIX - V23] Removido log do corpo da resposta para evitar sensitive data exposure
            logger.warn('Erro na requisição', getRequestMeta(req, {
                statusCode: res.statusCode,
                duracao: `${d}ms`
            }));
        }

        return originalSend.call(this, data);
    };

    next();
}