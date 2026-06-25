import jwt from 'jsonwebtoken';
import stripe from "../config/stripe.js";
import { logger } from '../config/logger.js';
import { getRequestMeta } from '../config/requestMeta.js';
import { changeUserSubscription } from '../services/userService.js';

export const webhook = async (req, res) => {
    let sig = req.headers['stripe-signature'];
    const body = req.body;
    
    try {
        const result = await changeUserSubscription(sig, body);

        // [SECURITY FIX - V13] Extrair dados do resultado para evitar ReferenceError
        const userId = result?.data?.id || 'unknown';
        const plan = result?.data?.plan || 'unknown';
        logger.info('Webhook recebido - assinatura atualizada', getRequestMeta(req, { userId, plan }));
        return res.status(200).json({ received: true }) // Importante, diz ao stripe que o webhook foi recebido
    } catch (error) {
        if(
            error.message === 'Invalid userId format' || 
            error.message === 'Invalid subscription plan'
        ){
            logger.warn('Erro de validação ao criar sessão de inscrição', { ...getRequestMeta(req), error: error.message });
            return res.status(400).json({ message: error.message });
        }

        if(error.message === 'User already subscribed to this plan'){
            return res.status(200).json({ message: error.message });
        }

        logger.error('Erro no webhook', { ...getRequestMeta(req), error: error.message, stack: error.stack });
        res.status(500).json({ message: 'Internal server error' });
    }
}