import joi from 'joi';
import { logger } from '../config/logger.js';
import { getRequestMeta } from '../config/requestMeta.js';

export const validate = (schema, errorMap) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: true });

        if (!error) {
            logger.info(`IP ${req.ip} passou na validação`, getRequestMeta(req));
            return next();
        }

        const { type, context } = error.details[0];

        // Nunca loga o valor — só o campo
        const campo = context?.label ?? 'campo desconhecido';
        const mapped = errorMap[type];

        if (mapped) {
            logger.warn(`IP ${req.ip} ${mapped.logMsg(campo)}`, getRequestMeta(req));
            return res.status(400).json({ error: mapped.userMsg });
        }

        logger.error(`Validação desconhecida [${type}] no campo "${campo}"`, getRequestMeta(req));
        return res.status(400).json({ error: 'Erro de validação' });
    };
}