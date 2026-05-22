import { prisma } from '../lib/prisma.js';
import { logger } from '../config/logger.js';

export const getCommentsBySlug = async (slug) => {
    logger.debug('getCommentsBySlug called', { slug });
    try {
        const db = await prisma.comment.findMany({
            where: { articleSlug: slug },
            select: {
                id: true,
                userId: true,
                userName: true,
                post: true,
                creationDate: true
            }
        });
        const comments = (db || []).map(c => ({
            id: c.id,
            userId: c.userId,
            userName: c.userName,
            post: c.post,
            creationDate: c.creationDate
        }));

        return { success: true, data: { comments } };
    } catch (err) {
        logger.error('getCommentsBySlug error', { err, slug });
        throw err;
    }
};

export const addComment = async (post, userId, userName, articleSlug) => {
    logger.info('addComment called', { userId, userName, articleSlug });
    try {
        const comment = await prisma.comment.create({
            data: { post, userId, userName, articleSlug },
            select: { id: true, userId: true, userName: true, post: true, articleSlug: true, creationDate: true }
        });
        return { success: true, data: { comment } };
    } catch (err) {
        logger.error('addComment error', { err, userId, userName, articleSlug });
        throw err;
    }
};

export const editComment = async (commentId, post) => {
    logger.info('editComment called', { commentId });
    try {
        const comment = await prisma.comment.update({
            where: { id: commentId },
            data: { post },
            select: { id: true, userId: true, userName: true, post: true, articleSlug: true, creationDate: true }
        });
        return { success: true, data: { comment } };
    } catch (err) {
        logger.error('editComment error', { err, commentId });
        throw err;
    }
};

export const removeComment = async ({ commentId }) => {
    logger.info('removeComment called', { commentId });
    try {
        const deleted = await prisma.comment.delete({ where: { id: commentId }, select: { id: true } });
        return { success: true, data: { comment: { id: deleted.id } } };
    } catch (err) {
        logger.error('removeComment error', { err, commentId });
        throw err;
    }
};

export const verifyComment = async (commentId) => {
    logger.debug('verifyComment called', { commentId });
    try {
        const db = await prisma.comment.findFirst({
            where: { id: commentId },
            select: {
                userId: true,
                articleSlug: true
            }
        });

        return {
            success: true,
            data: { comment: db ? { userId: db.userId, articleSlug: db.articleSlug } : null }
        };
    } catch (err) {
        logger.error('verifyComment error', { err, commentId });
        throw err;
    }
};