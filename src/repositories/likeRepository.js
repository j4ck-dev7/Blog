import { prisma } from '../lib/prisma.js'
import { logger } from '../config/logger.js';

export const getLikes = async (userId) => {
    logger.debug('getLikes called', { userId });
    return await prisma.like.findMany({
        where: {
            userId: userId
        },
        select: {
            articleSlug: true,
            id: true
        }
    });
}

export const createLike = async (userId, articleSlug) => {
    logger.info('createLike called', { userId, articleSlug });
    return await prisma.like.create({
        data: {
            userId,
            articleSlug
        }
    });
}

export const deleteLike = async (id) => {
    logger.info('deleteLike called', { id });
    return await prisma.like.delete({ // Caso tenha um modelo que faz referencia ao modelo que contenha o documento para excluir
        where: { // É retornado um erro ao tentar excluir, então é necessário apagar o documento e os outros documentos que
            id: id // tenha a relação, ou deixar a relação opcional
        }
    });
}

export const verifyExistsLikeId = async (id) => {
    logger.debug('verifyExistsLikeId called', { id });
    return await prisma.like.findFirst({
        where: {
            id: id
        },
        select: {
            id: true
        }
    });
}

export const verifyUserLikeArticle = async (userId, articleSlug) => {
    logger.debug('verifyUserLikeArticle called', { userId, articleSlug });
    return await prisma.like.findFirst({
        where: {
            userId: userId,
            articleSlug: articleSlug
        },
        select: {
            id: true
        }
    });
}