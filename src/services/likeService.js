import { createLike, deleteLike, getLikes, verifyUserLikeArticle } from "../repositories/likeRepository.js";
import { decrementArticleLikeCount, incrementArticleLikeCount } from "../repositories/articleRepository.js";
import { logger } from '../config/logger.js';
import { updateCounterService } from "../utils/updateConterService.js";
import { isValidCuid } from "../utils/isValidCuid.js";

export const allLikesUser = async (userId) => {
    logger.info('allLikesUser called', { userId });

    if(!isValidCuid(userId)){
        logger.warn('allLikesUser - invalid user id format', { userId });
        throw new Error('Invalid user id format');
    }

    const likesResult = await getLikes(userId);
    const likesData = likesResult?.data ?? [];

    if(!userId) {
        logger.warn('allLikesUser - unauthenticated user', { userId });
        throw new Error('User not authenticated, please login or register')
    }

    logger.info('allLikesUser - success', { userId, count: likesData.length });
    return likesData.map(like => ({ articleSlug: like.articleSlug, id: like.id }));
}

export const addLike = async (userId, articleSlug) => {
    logger.info('addLike called', { userId, articleSlug });

    if(!isValidCuid(userId)){
        logger.warn('addLike - invlid user id format', { userId, articleSlug });
        throw new Error('Invalid user id format');
    }

    const verifyResult = await verifyUserLikeArticle(userId, articleSlug);
    if(verifyResult?.data) {
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

    if(!isValidCuid(userId)){
        logger.warn('removeLike - invalid user id format', { userId, articleSlug });
        throw new Error('Invalid user id format');
    }

    const verifyResult = await verifyUserLikeArticle(userId, articleSlug);
    if(!verifyResult?.data) {
        logger.warn('removeLike - like does not exist', { userId, articleSlug });
        throw new Error('Like does not exist');
    };
    if(!isValidCuid(verifyResult.data.id)){
        logger.warn('removeLike - invalid like id format', { userId, articleSlug, likeId: verifyResult.data.id });
        throw new Error('Invalid like id format');
    }

    const result = await Promise.all([
        deleteLike(verifyResult.data.id),
        updateCounterService(articleSlug, (s) => decrementArticleLikeCount(s))
    ]);
    logger.info('removeLike - success', { userId, articleSlug });
    return result;
}