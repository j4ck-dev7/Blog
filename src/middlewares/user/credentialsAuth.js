import { prisma } from "../../lib/prisma.js";
import Article from "../../models/Article.js";

export const credentialsAuth = async (req, res, next) => {
    try {
        const planWeight = {
            FREE: 0,
            BASIC: 1,
            INTERMEDIATE: 2,
            PREMIUM: 3
        };
        const { slug } = req.params;
        const article = await Article.findOne({ slug })
            .select('planRole')
            .lean();
        
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        };
        
        const planArticle = planWeight[article.planRole];
        if(planArticle === 0 || article.planRole === 'FREE'){
            return next();
        };

        if(req.user._id === 'freeAccess'){
            return res.status(401).json({ message: 'Unauthorized. To access this content, please subscribe.' });
        };

        const user = await prisma.user.findFirst({
            where: {
                id: req.user._id
            },
            select: {
                email: true,
                subscriptionPlan: true,
                subscriptionExpiresAt: true,
                name: true
            }
        });

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
        res.status(500).json({ message: 'Internal server error' });
        console.error('Error during credentials authentication', error);
    }
}