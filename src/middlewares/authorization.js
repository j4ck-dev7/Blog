import jwt from 'jsonwebtoken';
import { logger } from '../config/logger.js';
import { getRequestMeta } from '../config/requestMeta.js';

export const auth =  (req, res, next) => {
    try {
        const cookie = req.cookies.userAuth;
        if(!cookie){ 
            res.cookie('userAuth', 'freeAccess', { secure: true, httpOnly: true, expires: new Date(Date.now() + 2 * 3600000) });
            req.user = { state: 'freeAccess' }; // Usuário não autenticado, acesso livre. Exeto em rotas protegidas | conteudos premium
            logger.info('Acesso anônimo concedido (freeAccess)', getRequestMeta(req));
            return next();
        };
        
        if(cookie === 'freeAccess'){
            req.user = { state: 'freeAccess' };
            logger.info('Acesso freeAccess detectado', getRequestMeta(req));
            return next();
        }

        const userVerified = jwt.verify(cookie, process.env.SECRET);
        req.user = userVerified;
        logger.info('Token verificado com sucesso', getRequestMeta(req, { userId: userVerified._id || userVerified.id }));
        next();
    } catch (error) {
        logger.error('Erro na autenticação', { ...getRequestMeta(req), error: error.message, stack: error.stack });
        res.status(500).json({ message: 'Internal server error' });
    }
}