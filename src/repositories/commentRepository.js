import { prisma } from '../lib/prisma.js';
import { logger } from '../config/logger.js';

export const getCommentsBySlug = async (slug) => {
    logger.debug('getCommentsBySlug called', { slug });
    return await prisma.comment.findMany({
        where: {
            articleSlug: slug
        },
        select: {
            userName: true,
            post: true,
            creationDate: true
        }
    });
};

export const addComment = async (post, userId, userName, articleSlug) => {
    logger.info('addComment called', { userId, userName, articleSlug });
    return await prisma.comment.create({
        data: {
            post,
            userId,
            userName,
            articleSlug
        }
    });
};

export const editComment = async (commentId, post) => {
    logger.info('editComment called', { commentId });
    return await prisma.comment.update({
        where: {
            id: commentId
        },
        data: {
            post
        }
    });
};

export const removeComment = async (commentId) => {
    logger.info('removeComment called', { commentId });
    return await prisma.comment.delete({
        where: {
            id: commentId
        }
    });
};

export const verifyComment = async (commentId) => {
    logger.debug('verifyComment called', { commentId });
    return await prisma.comment.findFirst({
        where: {
            id: commentId,
        },
        select: { 
            post: true
        }
    });
}