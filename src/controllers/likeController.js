import { allLikesUser, addLike, removeLike } from "../services/likeService.js";
import { logger } from '../config/logger.js';
import { getRequestMeta } from '../config/requestMeta.js';

export const like = async (req, res) => {
    const userId = req.user._id;
    const articleSlug = req.params.slug;

    try {
        await addLike(userId, articleSlug);
        res.status(201).json({ message: "Liked article" });
        logger.info('Artigo curtido', getRequestMeta(req, { userId, articleSlug }));
    } catch (error) {
        if(error.message === 'You already liked this article'){
            logger.warn('Tentativa de curtir artigo já curtido', getRequestMeta(req, { userId, articleSlug, error: error.message }));
            return  res.status(400).json({ message: 'You already liked this article' });
        }

        logger.error('Erro ao curtir artigo', { ...getRequestMeta(req), error: error.message, stack: error.stack });
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const DeleteLike = async (req, res) => {
    const articleSlug = req.params.slug;
    const userId = req.user._id;

    try {
        await removeLike(userId, articleSlug);
        res.status(204).json({ message: 'Like removed' });
        logger.info('Curtida removida', getRequestMeta(req, { userId, articleSlug }));
    } catch (error) {
        if(error.message === 'Like does not exist'){
            logger.warn('Tentativa de remover curtida inexistente', getRequestMeta(req, { userId, articleSlug, error: error.message }));
            return res.status(404).json({ message: 'Like does not exist' });
        }

        logger.error('Erro ao remover curtida', { ...getRequestMeta(req), error: error.message, stack: error.stack });
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const allLikes = async (req, res) => {
    const userId = req.user._id;

    try {
        const likes = await allLikesUser(userId);
        res.status(200).json({ message: 'Likes obteined', likes});
        logger.info('Lista de curtidas obtida', getRequestMeta(req, { userId }));
    } catch (error) {
        if(error.message === 'User not authenticated, please login or register'){
            logger.warn('Usuário não autenticado tentou obter curtidas', getRequestMeta(req, { userId, error: error.message }));
            return res.status(401).json({ message: 'User not authenticated, please login or register' });
        };

        res.status(500).json({ message: 'Internal server error' });
        logger.error('Erro no servidor ao obter curtidas', { ...getRequestMeta(req), error: error.message, stack: error.stack });
    }
}