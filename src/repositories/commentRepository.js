import { prisma } from '../lib/prisma.js';

export const getCommentsBySlug = async (slug) => {
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
    return await prisma.comment.delete({
        where: {
            id: commentId
        }
    });
};

export const verifyComment = async (commentId) => {
    return await prisma.comment.findFirst({
        where: {
            id: commentId,
        },
        select: { 
            post: true
        }
    });
}