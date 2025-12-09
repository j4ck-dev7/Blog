import Article from '../../models/Article.js';
import Like from '../../models/Like.js'

import { isValidObjectId } from '../../utills/isValidObjectId.js';

export const like = async (req, res) => {
    const user = req.user._id;
    const article = req.params.articleId;

    try {
        if (!isValidObjectId(user)) {
            return res.status(400).json({ 
                message: 'ID inválido' 
            });
        }

        if (!isValidObjectId(article)) {
            return res.status(400).json({ 
                message: 'ID inválido' 
            });
        }

        const [articleValid, liked] = await Promise.all([
            Article.findById(article).lean(), // O lean funciona apenas em consultas | leituras, ele converte a instância de do mongoose em objeto JS puro
            Like.findOne({ user, article }).lean() 
        ])

        if(!articleValid) return res.status(400).json({ message: 'Article not found' });
        if(liked) return res.status(409).json({ message: 'You already liked this article' });
        
        const like = new Like({
            user,
            article
        }); // Novos documentos são sincronos, não é necessário o await, por isso o uso do promisse.all() é desnecessário

        await Promise.all([
            Article.updateOne( {_id: article}, { $inc: { likeCount: 1 } }),
            like.save(),
        ])

        res.status(204).json({ message: "Liked article" });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.error('Error while liking an article', error);
    }
}

export const removeLike = async (req, res) => {
    const articleId = req.params.articleId;
    const likeId = req.params.likeId;

    if (!isValidObjectId(articleId)) {
        return res.status(400).json({ 
            message: 'ID inválido' 
        });
    }
    try {
        const [articleVerify, deleteLike] = await Promise.all([
            Article.findById(articleId).lean(),
            Like.findByIdAndDelete(likeId)
        ])
        
        if(!articleVerify) return res.status(400).json({ message: 'Article not found' });
        if(!deleteLike) return res.status(400).json({ message: 'Like not found' });

        await Article.updateOne({_id: articleId}, { $inc: { likeCount: -1 } }),
        res.status(204).json({ message: 'Like removed' });
    } catch (error) {
        console.error('Error removing like', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const allLikes = async (req, res) => {
    const user = req.user._id;

    try {
        if (!isValidObjectId(user)) {
            return res.status(400).json({ 
                message: 'ID inválido' 
            });
        }
        const userCurtidas = await Like.find({ user })
            .select('-_id -__v -user -creationDate')
            .populate('article', 'title -_id')
            .sort({ creationDate: -1 });
        
        if(!userCurtidas.length) return res.status(400).json({ message: 'No likes' });
        res.status(200).json({ message: 'Likes obteined', userCurtidas});
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        console.error('Server error:', error);
    }
}