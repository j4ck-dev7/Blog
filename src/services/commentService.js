import { incrementArticleCommentCount, decrementArticleCommentCount } from "../repositories/articleRepository.js";
import { addComment, editComment, removeComment, verifyComment } from "../repositories/commentRepository.js";
import { updateCounterService } from "../utils/updateConterService.js";
import { logger } from '../config/logger.js';

export const createComment = async (post, userId, userName, articleSlug) => {
    logger.info('createComment called', { userId, userName, articleSlug });
    const newComment = await addComment(post, userId, userName, articleSlug);

    await updateCounterService(articleSlug, (s) => incrementArticleCommentCount(s));
    logger.info('createComment success', { id: newComment?.id, articleSlug });
    return newComment;
};

export const updateComment = async (commentId, post) => {
    logger.info('updateComment called', { commentId });
    const existingComment = await verifyComment(commentId);
    if (!existingComment) {
        logger.warn('updateComment - comment not found', { commentId });
        throw new Error('Comment not found');
    }

    const updated = await editComment(commentId, post);
    logger.info('updateComment success', { commentId });
    return updated;
};

export const deleteComment = async (commentId, articleSlug) => {
    logger.info('deleteComment called', { commentId, articleSlug });
    const existingComment = await verifyComment(commentId);
    if (!existingComment) {
        logger.warn('deleteComment - comment not found', { commentId });
        throw new Error('Comment not found');
    }

    await updateCounterService(articleSlug, (s) => decrementArticleCommentCount(s));
    const removed = await removeComment(commentId);
    logger.info('deleteComment success', { commentId, articleSlug });
    return removed;
};