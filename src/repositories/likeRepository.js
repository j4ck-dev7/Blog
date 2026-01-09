import { prisma } from '../lib/prisma.js' 

export const getLikes = async (userId) => {
    return await prisma.like.findMany({
        where: {
            userId: userId
        },
        select: {
            articleSlug: true
        }
    });
}

export const createLike = async (userId, articleSlug) => {
    return await prisma.like.create({
        data: {
            userId,
            articleSlug
        }
    });
}

export const deleteLike = async (id) => {
    return await prisma.like.deleteMany({
        where: {
            id: id
        }
    });
}

export const verifyExistsLikeId = async (id) => {
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