import { incrementArticleCommentCount, decrementArticleCommentCount } from "../repositories/articleRepository.js";
import { addComment, editComment, removeComment, verifyComment } from "../repositories/commentRepository.js";

export const createComment = async (post, userId, userName, articleSlug) => {
    const newComment = await addComment(post, userId, userName, articleSlug);

    await incrementArticleCommentCount(articleSlug);
    return newComment;
};

export const updateComment = async (commentId, post) => {
    const existingComment = await verifyComment(commentId);
    if (!existingComment) {
        throw new Error('Comment not found');
    }

    return await editComment(commentId, post);
};

export const deleteComment = async (commentId, articleSlug) => {
    const existingComment = await verifyComment(commentId);
    if (!existingComment) {
        throw new Error('Comment not found');
    }

    await decrementArticleCommentCount(articleSlug);
    return await removeComment(commentId);
};