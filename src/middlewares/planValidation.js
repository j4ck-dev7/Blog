import { downgradeUserSubscription } from '../repositories/userRepository.js';
import { findArticleBySlugWithPlanRole } from '../repositories/articleRepository.js';

const planWeight = {
    FREE: 0,
    BASIC: 1,
    INTERMEDIATE: 2,
    PREMIUM: 3
}

export const planValidation = async (req, res, next) => {
    const { slug } = req.params;

    try {
      const now = new Date();

      const article = await findArticleBySlugWithPlanRole(slug);

      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }

      const planArticle = planWeight[article.planRole];
      if(planArticle === 0 || article.planRole === 'FREE'){
        return next();
      };

      if(req.user.subscriptionExpire){
          const planExpires = new Date(req.user.subscriptionExpire)

          if(now > planExpires){
            await downgradeUserSubscription(req.user.email);

            return res.status(403).json({
              message: 'Access denied: Please renew your subscription'
            })
          }
      }
      
      const planUser = planWeight[req.user.subscriptionPlan]
      if(planUser < planArticle) {
        return res.status(403).json({
          message: 'Access denied: Upgrade your subscription'
        });
      }

      return next();
    } catch (error) {
        console.error('Error in planValidation middleware:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}