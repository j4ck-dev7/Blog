import { createComment, updateComment, deleteComment } from "../services/commentService.js";
import { logger } from '../config/logger.js';
import { getRequestMeta } from '../config/requestMeta.js';

export const comment = async (req, res) => {
    const articleSlug = req.params.slug;
    const userId = req.user._id;
    const post = req.body.post;

    try {
        await createComment({ comment: post, userId, articleSlug });

        res.status(201).json({ message: 'Comment added' });
        logger.info('Comentário adicionado', getRequestMeta(req, { userId, articleSlug }));
    } catch (error) {
        if (error.message === 'Slug inválido' || error.message === 'Invalid id' || error.message === 'Invalid comment') {
            logger.warn('Comentário inválido', getRequestMeta(req, { userId, articleSlug, error: error.message }));
            return res.status(400).json({ message: error.message });
        }

        if (error.message === 'User not found' || error.message === 'Article not found') {
            logger.warn('Recurso não encontrado ao criar comentário', getRequestMeta(req, { userId, articleSlug, error: error.message }));
            return res.status(404).json({ message: error.message });
        }

        logger.error('Erro ao criar comentário', { ...getRequestMeta(req, { userId, articleSlug }), error: error.message, stack: error.stack });
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const EditComment = async (req, res) => {
    const post = req.body.post;
    const commentId = req.params.commentId;
    const userId = req.user._id;

    try {
        await updateComment({ commentId, commentEdit: post, userId });

        res.status(204).json({ message: 'Comment edited' });
        logger.info('Comentário editado', getRequestMeta(req, { commentId, userId }));
    } catch (error) {
        if (error.message === 'Invalid id' || error.message === 'Invalid comment') {
            logger.warn('Atualização de comentário inválida', getRequestMeta(req, { commentId, userId, error: error.message }));
            return res.status(400).json({ message: error.message });
        }

        if (error.message === 'Comment not found') {
            logger.warn('Comentário não encontrado', getRequestMeta(req, { commentId, userId, error: error.message }));
            return res.status(404).json({ message: error.message });
        }

        if (error.message === 'Unauthorized') {
            logger.warn('Usuário não autorizado a editar comentário', getRequestMeta(req, { commentId, userId, error: error.message }));
            return res.status(403).json({ message: error.message });
        }

        logger.error('Erro ao editar comentário', { ...getRequestMeta(req, { commentId, userId }), error: error.message, stack: error.stack });
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const removeComment = async (req, res) => {
    const commentId = req.params.commentId;
    const userId = req.user._id;
    const articleSlug = req.params.slug;

    try {
        await deleteComment({ commentId, userId });

        res.status(204).json({ message: 'Comment removed' });
        logger.info('Comentário removido', getRequestMeta(req, { commentId, articleSlug, userId }));
    } catch (error) {
        if (error.message === 'Invalid id') {
            logger.warn('Exclusão de comentário inválida', getRequestMeta(req, { commentId, userId, articleSlug, error: error.message }));
            return res.status(400).json({ message: error.message });
        }

        if (error.message === 'Comment or user not found') {
            logger.warn('Comentário ou usuário não encontrado', getRequestMeta(req, { commentId, userId, articleSlug, error: error.message }));
            return res.status(404).json({ message: error.message });
        }

        logger.error('Erro ao remover comentário', { ...getRequestMeta(req, { commentId, articleSlug, userId }), error: error.message, stack: error.stack });
        return res.status(500).json({ message: 'Internal server error' });
    }
};
