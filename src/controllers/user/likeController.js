import Article from '../../models/Article.js';
import { prisma } from '../../lib/prisma.js'
import { isValidObjectId } from '../../utills/isValidObjectId.js';

export const like = async (req, res) => {
    const userId = req.user._id;
    const articleId = req.params.articleId;

    try {
        if (!isValidObjectId(articleId)) {
            return res.status(400).json({ 
                message: 'ID inválido' 
            });
        }

        const [articleValid, liked] = await Promise.all([
            Article.findById(articleId).select('_id').lean(), // O lean funciona apenas em consultas | leituras, ele converte a instância de do mongoose em objeto JS puro
            prisma.like.findFirst({ 
                where: {
                    userId, articleId
                },
                select: { id: true }
            })
        ])

        if(!articleValid) return res.status(400).json({ message: 'Article not found' });
        if(liked) return res.status(409).json({ message: 'You already liked this article' });

        await Promise.all([
            prisma.like.create({
                data: {
                    userId, articleId
                }
            }),
            Article.updateOne( {_id: articleId}, { $inc: { likeCount: 1 } }),
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
            Article.findById(articleId).select('_id').lean(),
            prisma.like.findFirst({
                where: {
                    id: likeId,
                    articleId: articleId
                }
            })
        ])
        
        if(!articleVerify) return res.status(400).json({ message: 'Article not found' });
        if(!deleteLike) return res.status(400).json({ message: 'Like not found' });

        await Promise.all([
            prisma.like.delete({
                where: {
                    id: likeId
                }
            }),
            Article.updateOne({_id: articleId}, { $inc: { likeCount: -1 } })
        ])
        res.status(204).json({ message: 'Like removed' });
    } catch (error) {
        console.error('Error removing like', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const allLikes = async (req, res) => {
    const userId = req.user._id;

    try {
        const likes = await prisma.like.findMany({
            where: {
                userId
            },
            select: {
                articleId: true, id: true 
            }
        })
        
        if(!likes.length) return res.status(400).json({ message: 'No likes' });
        res.status(200).json({ message: 'Likes obteined', likes});
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        console.error('Server error:', error);
    }
}