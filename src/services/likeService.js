import { createLike, deleteLike, getLikes, verifyExistsLikeId} from "../repositories/likeRepository.js";
import { decrementArticleLikeCount, incrementArticleLikeCount } from "../repositories/articleRepository.js";

export const allLikesUser = async (userId) => {
    const likesData = await getLikes(userId);
    return likesData.map(like => ({ articleSlug: like.articleSlug, id: like.id }));
}

export const addLike = async (userId, articleSlug) => {
    const verify = await verifyExistsLikeId(userId);
    if(verify) {
        throw new Error('You already liked this article');
    };

    return Promise.all([
        createLike(userId, articleSlug),
        incrementArticleLikeCount(articleSlug)
    ])
}

export const removeLike = async (userId, articleSlug) => {
    const verify = await verifyExistsLikeId(userId);
    if(!verify) {
        throw new Error('Like does not exist');
    };

    return Promise.all([
        deleteLike(userId, articleSlug),
        decrementArticleLikeCount(articleSlug)
    ])
}