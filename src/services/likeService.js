import { createLike, deleteLike, getLikes, verifyUserLikeArticle } from "../repositories/likeRepository.js";
import { decrementArticleLikeCount, incrementArticleLikeCount } from "../repositories/articleRepository.js";

export const allLikesUser = async (userId) => {
    const likesData = await getLikes(userId);

    if(!userId) throw new Error('User not authenticated, please login or register')

    return likesData.map(like => ({ articleSlug: like.articleSlug, id: like.id }));
}

export const addLike = async (userId, articleSlug) => {
    const verify = await verifyUserLikeArticle(userId, articleSlug);
    if(verify) {
        throw new Error('You already liked this article');
    };

    return Promise.all([
        createLike(userId, articleSlug),
        incrementArticleLikeCount(articleSlug)
    ])
}

export const removeLike = async (userId, articleSlug) => {
    const verify = await verifyUserLikeArticle(userId, articleSlug);
    if(!verify) {
        throw new Error('Like does not exist');
    };

    const id = verify.id

    return Promise.all([
        deleteLike(id),
        decrementArticleLikeCount(articleSlug)
    ])
}