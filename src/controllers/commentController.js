import { createComment, updateComment, deleteComment } from "../services/commentService.js";
import { logger } from '../config/logger.js';
import { getRequestMeta } from '../config/requestMeta.js';

export const comment = async (req, res) => {
    try {
        const articleSlug = req.params.slug;
        const userId = req.user._id;
        const userName = req.user.name
        const post = req.body.post;
        
        await createComment(post, userId, userName, articleSlug);

        res.status(201).json({ 
            message: "Comment added"
        });
        logger.info('Comentário adicionado', getRequestMeta(req, { userId }));
    } catch (error) {
        logger.error('Erro ao adicionar comentário', { ...getRequestMeta(req, { userId: req?.user?._id }), error: error.message, stack: error.stack });
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const EditComment = async (req, res) => {
    const post = req.body.post;
    const commentId = req.params.commentId;

    try {
        await updateComment(commentId, post);

        res.status(204).json({ 
            message: 'Comment edited'
        });
        logger.info('Comentário editado', getRequestMeta(req, { commentId }));
    } catch (error) {
        if(error.message === 'Comment not found'){
            logger.warn('Comentário não encontrado', getRequestMeta(req, { commentId, error: error.message }));
            return res.status(404).json({ message: 'Comment not found' });
        }

        logger.error('Erro ao editar comentário', { ...getRequestMeta(req), error: error.message, stack: error.stack });
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const removeComment = async (req, res) => {
    const commentId = req.params.commentId;
    const articleSlug = req.params.slug;

    try {
        await deleteComment(commentId, articleSlug);
        res.status(204).json({ message: 'Comment removed' });
        logger.info('Comentário removido', getRequestMeta(req, { commentId, articleSlug }));
    } catch (error) {
        if(error.message === 'Comment not found'){
            logger.warn('Comentário não encontrado', getRequestMeta(req, { commentId, error: error.message }));
            return res.status(404).json({ message: 'Comment not found' });
        }
        
        logger.error('Erro ao remover comentário', { ...getRequestMeta(req), error: error.message, stack: error.stack });
        res.status(500).json({ message: 'Internal server error' });
    }
}