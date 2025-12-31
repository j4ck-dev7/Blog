import Article from '../../models/Article.js';
import { prisma } from '../../lib/prisma.js';

export const like = async (req, res) => {
    const userId = req.user._id;
    const articleSlug = req.params.slug;

    try {
        const [articleValid, liked] = await Promise.all([
            Article.findOne({ slug: articleSlug }).select('_id').lean(), // O lean funciona apenas em consultas | leituras, ele converte a instância de do mongoose em objeto JS puro
            prisma.like.findFirst({ 
                where: {
                    userId, articleSlug
                },
                select: { id: true }
            })
        ])

        if(!articleValid) return res.status(400).json({ message: 'Article not found' });
        if(liked) return res.status(409).json({ message: 'You already liked this article' });

        await Promise.all([
            prisma.like.create({
                data: {
                    userId, articleSlug
                }
            }),
            Article.updateOne({ slug: articleSlug }, { $inc: { likeCount: 1 } }),
        ])

        res.status(204).json({ message: "Liked article" });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.error('Error while liking an article', error);
    }
}

export const removeLike = async (req, res) => {
    const articleSlug = req.params.slug;
    const likeId = req.params.likeId;

    try {
        const [articleVerify, deleteLike] = await Promise.all([
            Article.findOne({ slug: articleSlug }).select('slug').lean(),
            prisma.like.findFirst({
                where: {
                    id: likeId,
                    articleSlug: articleSlug
                },
                select: {
                    id: true
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
            Article.updateOne({ slug: articleSlug }, { $inc: { likeCount: -1 } })
        ])
        res.status(204).json({ message: 'Like removed' });
    } catch (error) {
        console.error('Error removing like', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const allLikes = async (req, res) => {
    const userId = req.user._id;
    if(userId === 'freeAccess') return res.status(401).json({ message: 'User not authenticated, please login or register' });

    try {
        const likes = await prisma.like.findMany({
            where: {
                userId
            },
            select: {
                articleSlug: true, id: true
            }
        })
        
        if(!likes.length) return res.status(400).json({ message: 'No likes' });
        res.status(200).json({ message: 'Likes obteined', likes});
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        console.error('Server error:', error);
    }
}