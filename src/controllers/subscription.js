import stripe from "../config/stripe.js";
import { logger } from '../config/logger.js';
import { getRequestMeta } from '../config/requestMeta.js';
import { generateUrlForSubscription } from '../services/userService.js'; 

export const subscribe = async (req, res) => {
    const plan = req.query.subscription;
    const userId = req.user._id;
    const userEmail = req.user.email;

    try {
        const generateUrl = await generateUrlForSubscription(userId, plan, userEmail);   

        logger.info('Sessão de inscrição criada', getRequestMeta(req, { userId, plan }));
        res.status(200).json({ url: generateUrl });
    } catch (error) {
        if(
            error.message === 'Invalid userId format' || 
            error.message === 'Invalid subscription plan'
        ){
            logger.warn('Erro de validação ao criar sessão de inscrição', { ...getRequestMeta(req), error: error.message });
            return res.status(400).json({ message: error.message });
        }

        if(error.message === 'User not authenticated, please login or register'){
            logger.warn('Usuário não autenticado ao criar sessão de inscrição', getRequestMeta(req));
            return res.status(401).json({ message: error.message });
        }

        logger.error('Erro ao criar sessão de inscrição', { ...getRequestMeta(req), error: error.message, stack: error.stack });
        res.status(500).json({ message: 'Internal server error' });
    }
}