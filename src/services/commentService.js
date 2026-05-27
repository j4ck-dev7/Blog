import { incrementArticleCommentCount, decrementArticleCommentCount, articleExistsBySlug } from "../repositories/articleRepository.js";
import { addComment, editComment, removeComment, verifyComment } from "../repositories/commentRepository.js";
import { findUserById } from '../repositories/userRepository.js';
import { updateCounterService } from "../utils/updateConterService.js";
import { logger } from '../config/logger.js';
import { isValidCuid } from '../utils/isValidCuid.js';
import { transformSlug } from '../utils/transformSlug.js';

export const createComment = async ({ comment, userId, articleSlug }) => {
    try{
        logger.info('createComment called', { userId, articleSlug });

        if(!articleSlug) {
            logger.warn('createComment - missing articleSlug', { articleSlug });
            throw new Error('Slug inválido');
        }

        const transformedSlug = transformSlug(articleSlug);
        if(!transformedSlug.success) {
            logger.warn('createComment - invalid articleSlug', { articleSlug });
            throw new Error(transformedSlug.error);
        }

        if(!userId || !isValidCuid(userId)){
            logger.warn('createComment - invalid userId', { userId });
            throw new Error('Invalid id');
        }

        if (
            !comment ||
            typeof comment !== 'string' ||
            !comment.trim() ||
            comment.length > 2000
        ) {
            logger.warn('createComment - invalid comment', { comment, userId, articleSlug });
            throw new Error('Invalid comment');
        }

        const [ userExistsResult, articleExistsResult ] = await Promise.all([
            findUserById(userId),
            articleExistsBySlug(transformedSlug.data)
        ]);

        const userExists = userExistsResult?.data?.user;
        const articleExists = articleExistsResult?.data?.article;

        if (!userExists) {
            logger.warn('createComment - user not found', { userId });
            throw new Error('User not found');
        }

        if (!articleExists) {
            logger.warn('createComment - article not found', { articleSlug });
            throw new Error('Article not found');
        }

        const newComment = await addComment(comment.trim(), userId, userExists.name, transformedSlug.data);

        // Usar prisma + postgres em vez de mongoose + mongo para maior atomicidade
        try {
            await updateCounterService(transformedSlug.data, (s) => incrementArticleCommentCount(s));
        } catch (counterError) {
            logger.error('createComment - failed to update counter', {
                transformedSlug: transformedSlug.data,
                error: counterError.message
            });
        }

        logger.info('createComment success', { transformedSlug, userId });

        return newComment;
    } catch(error){
        logger.error('createComment failed', {
            error: error.message,
            errorStack: error.stack
        });

        throw error;
    }
};

export const updateComment = async ({ commentId, commentEdit, userId }) => {
    try{
        logger.info('updateComment called', { commentId, userId });

        if(!isValidCuid(commentId)){
            logger.warn('updateComment - invalid commentId', { commentId });
            throw new Error('Invalid id');
        }

        if(!isValidCuid(userId)){
            logger.warn('updateComment - invalid userId', { userId });
            throw new Error('Invalid id');
        }

        if (
            !commentEdit ||
            typeof commentEdit !== 'string' ||
            !commentEdit.trim() ||
            commentEdit.length > 2000
        ) {
            logger.warn('updateComment - invalid commentEdit', { commentId });
            throw new Error('Invalid comment');
        }

        const existingComment = await verifyComment({ commentId })

        if (!existingComment?.data?.comment) {
            logger.warn('updateComment - comment not found', { commentId });
            throw new Error('Comment not found');
        }

        if (existingComment?.data?.comment?.userId !== userId) {
            logger.warn('updateComment - user is not the comment owner', { commentId, userId });
            throw new Error('Unauthorized');
        }

        // Retorna success true quando tudo der certo
        const updated = await editComment(commentId, commentEdit.trim());
        logger.info('updateComment success', { commentId });

        return updated;
    }catch(error){
        logger.error('updateComment failed', {
            commentId,
            userId,
            error: error.message,
            errorStack: error.stack
        });

        throw error;
    }
};

export const deleteComment = async ({ commentId, userId }) => {
    try {
        logger.info('deleteComment called', { commentId });

        if(!isValidCuid(commentId) || !isValidCuid(userId)){
            logger.warn('deleteComment - invalid commentId or userId', { commentId, userId });
            throw new Error('Invalid id');
        }

        const existingComment = await verifyComment({ commentId });
        if (!existingComment?.data?.comment) {
            logger.warn('deleteComment - comment found', { commentId });
            throw new Error('Comment or user not found');
        }
        if(existingComment?.data?.comment?.userId !== userId){
            logger.warn('deleteComment - user is not the comment owner', { userId, commentId, commentOwner: existingComment.data.comment?.userId });
            throw new Error('Comment or user not found');
        }

        const removed = await removeComment(commentId);

        // Valida com acknowledged e modifiedCount do mongoose, futuramente migrar para o postgres + prisma
        // para melhor consistencia, junto com o uso de transaction
        await updateCounterService(existingComment.data.comment?.articleSlug, (s) => decrementArticleCommentCount(s));
        logger.info('deleteComment success', { commentId, article: existingComment.data.comment?.articleSlug });

        return removed;
    } catch (error) {
        logger.error('deleteComment failed', {
            commentId,
            userId,
            error: error.message,
            errorStack: error.stack
        });

        throw error;
    }
};