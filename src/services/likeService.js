import { createLike, deleteLike, getLikes, verifyUserLikeArticle } from "../repositories/likeRepository.js";
import { decrementArticleLikeCount, incrementArticleLikeCount } from "../repositories/articleRepository.js";
import { logger } from '../config/logger.js';
import { updateCounterService } from "../utils/updateConterService.js";

export const allLikesUser = async (userId) => {
    logger.info('allLikesUser called', { userId });
    const likesData = await getLikes(userId);

    if(!userId) {
        logger.warn('allLikesUser - unauthenticated user', { userId });
        throw new Error('User not authenticated, please login or register')
    }

    logger.info('allLikesUser - success', { userId, count: likesData?.length || 0 });
    return likesData.map(like => ({ articleSlug: like.articleSlug, id: like.id }));
}

export const addLike = async (userId, articleSlug) => {
    logger.info('addLike called', { userId, articleSlug });
    const verify = await verifyUserLikeArticle(userId, articleSlug);
    if(verify) {
        logger.warn('addLike - already liked', { userId, articleSlug });
        throw new Error('You already liked this article');
    };

    const result = await Promise.all([
        createLike(userId, articleSlug),
        updateCounterService(articleSlug, (s)=> incrementArticleLikeCount(s))
    ]);
    logger.info('addLike - success', { userId, articleSlug });
    return result;
}

export const removeLike = async (userId, articleSlug) => {
    logger.info('removeLike called', { userId, articleSlug });
    const verify = await verifyUserLikeArticle(userId, articleSlug);
    if(!verify) {
        logger.warn('removeLike - like does not exist', { userId, articleSlug });
        throw new Error('Like does not exist');
    };

    const id = verify.id

    const result = await Promise.all([
        deleteLike(id),
        updateCounterService(articleSlug, (s) => decrementArticleLikeCount(s))
    ]);
    logger.info('removeLike - success', { userId, articleSlug });
    return result;
}