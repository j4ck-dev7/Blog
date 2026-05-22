import { prisma } from '../lib/prisma.js';
import { logger } from '../config/logger.js';

export const getLikes = async (userId) => {
    logger.debug('getLikes called', { userId });
    try {
        const likes = await prisma.like.findMany({
            where: { userId },
            select: { articleSlug: true, id: true }
        });
        const mapped = (likes || []).map(l => ({ id: l.id, articleSlug: l.articleSlug }));
        return { success: true, data: { likes: mapped } };
    } catch (err) {
        logger.error('getLikes error', { err, userId });
        throw err;
    }
};

export const createLike = async (userId, articleSlug) => {
    logger.info('createLike called', { userId, articleSlug });
    try {
        const like = await prisma.like.create({
            data: { userId, articleSlug }
        });
        return { success: true, data: { like: { id: like.id, articleSlug: like.articleSlug } } };
    } catch (err) {
        logger.error('createLike error', { err, userId, articleSlug });
        throw err;
    }
};

export const deleteLike = async (id) => {
    logger.info('deleteLike called', { id });
    try {
        await prisma.like.delete({ where: { id } });
        return { success: true };
    } catch (err) {
        logger.error('deleteLike error', { err, id });
        throw err;
    }
};

export const verifyExistsLikeId = async (id) => {
    logger.debug('verifyExistsLikeId called', { id });
    try {
        const like = await prisma.like.findFirst({
            where: { id },
            select: { id: true }
        });
        return { success: true, data: like ? { like: { id: like.id } } : { like: null } };
    } catch (err) {
        logger.error('verifyExistsLikeId error', { err, id });
        throw err;
    }
};

export const verifyUserLikeArticle = async (userId, articleSlug) => {
    logger.debug('verifyUserLikeArticle called', { userId, articleSlug });
    try {
        const like = await prisma.like.findFirst({
            where: { userId, articleSlug },
            select: { id: true }
        });
        return { success: true, data: like ? { like: { id: like.id } } : { like: null } };
    } catch (err) {
        logger.error('verifyUserLikeArticle error', { err, userId, articleSlug });
        throw err;
    }
};