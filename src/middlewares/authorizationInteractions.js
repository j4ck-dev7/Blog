import { logger } from '../config/logger.js';
import { getRequestMeta } from '../config/requestMeta.js';

export const authInteractions = (req, res, next) => {
    try {
        if(!req.user._id){
            return res.status(401).json({ message: 'Unauthorized. Please register or login to perform this action' });
        }

        if(req.user.state === 'freeAccess'){
            return res.status(401).json({ message: 'Unauthorized. Please register or login to perform this action' });
        };

        next();
    } catch (error) {
        logger.error('Erro nas interações de autorização', { ...getRequestMeta(req), error: error.message, stack: error.stack });
        res.status(500).json({ message: 'Internal server error' });
    }
}