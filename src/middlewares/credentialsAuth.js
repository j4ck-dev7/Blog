import { getUserByIdVerifyCredentials } from "../repositories/userRepository.js";
import { findArticleBySlugWithPlanRole } from "../repositories/articleRepository.js";
import { logger } from '../config/logger.js';
import { getRequestMeta } from '../config/requestMeta.js';

export const credentialsAuth = async (req, res, next) => {
    try {
        const planWeight = {
            FREE: 0,
            BASIC: 1,
            INTERMEDIATE: 2,
            PREMIUM: 3
        };
        const { slug } = req.params;
        const article = await findArticleBySlugWithPlanRole(slug);
        
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        };
        
        const planArticle = planWeight[article.planRole];
        if(planArticle === 0 || article.planRole === 'FREE'){
            return next();
        };

        if(req.user.state === 'freeAccess'){
            return res.status(401).json({ message: 'Unauthorized. To access this content, please subscribe.' });
        };

        const user = await getUserByIdVerifyCredentials(req.user._id);

        const userObjDb = {
            email: user.email,
            subscriptionPlan: user.subscriptionPlan,
            subscriptionExpires: user.subscriptionExpiresAt,
            name: user.name
        };

        const userObjToken = {
            email: req.user.email,
            subscriptionPlan: req.user.subscriptionPlan,
            subscriptionExpires: req.user.subscriptionExpire,
            name: req.user.name
        };

        const isEqual = JSON.stringify(userObjDb) === JSON.stringify(userObjToken); // Compara os dois objetos para garantir que o token não foi adulterado        
        if (!isEqual) {
            return res.status(401).json({ message: "Unauthorized. Invalid credentials." });
        };

        next();
    } catch (error) {
        logger.error('Erro durante validação de credenciais', { ...getRequestMeta(req), error: error.message, stack: error.stack });
        res.status(500).json({ message: 'Internal server error' });
    }
}