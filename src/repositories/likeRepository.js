import { prisma } from '../lib/prisma.js' 

export const getLikes = async (userId) => {
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
    return await prisma.like.create({
        data: {
            userId,
            articleSlug
        }
    });
}

export const deleteLike = async (id) => {
    return await prisma.like.delete({ // Caso tenha um modelo que faz referencia ao modelo que contenha o documento para excluir
        where: { // É retornado um erro ao tentar excluir, então é necessário apagar o documento e os outros documentos que
            id: id // tenha a relação, ou deixar a relação opcional
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