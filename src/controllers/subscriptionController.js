import { logger } from '../config/logger.js';
import { getRequestMeta } from '../config/requestMeta.js';
import { findUserById } from '../repositories/userRepository.js';
import { isValidCuid } from '../utils/isValidCuid.js';

/**
 * Renderiza a página de assinaturas
 * Exibe os planos disponíveis com o plano atual do usuário destacado
 */
export const renderSubscriptionPage = async (req, res) => {
    try {
        const user = req.user;
        let userData = null;

        // Se usuário estiver autenticado, buscar dados do banco
        if (user && user._id && user._id !== 'freeAccess' && isValidCuid(user._id)) {
            try {
                const result = await findUserById(user._id);
                if (result?.success && result?.data?.user) {
                    userData = result.data.user;
                }
            } catch (error) {
                logger.warn('Não foi possível buscar dados do usuário para página de assinatura', {
                    ...getRequestMeta(req),
                    userId: user._id,
                    error: error.message
                });
            }
        }

        // Definir plano atual do usuário
        const currentPlan = userData?.subscriptionPlan || (user?._id === 'freeAccess' ? 'free' : (user?.subscriptionPlan || 'free'));

        // Verificar se usuário é freeAccess
        const isFreeAccess = user?._id === 'freeAccess';

        res.render('subscription', {
            user: isFreeAccess ? null : {
                ...user,
                subscriptionPlan: currentPlan,
                authenticationType: user?.authenticationType
            },
            error: null
        });

        logger.info('Página de assinaturas renderizada', getRequestMeta(req, { 
            userId: user?._id,
            currentPlan 
        }));

    } catch (error) {
        logger.error('Erro ao renderizar página de assinaturas', {
            ...getRequestMeta(req),
            error: error.message,
            stack: error.stack
        });
        res.status(500).render('subscription', {
            user: null,
            error: 'Erro interno do servidor'
        });
    }
};
