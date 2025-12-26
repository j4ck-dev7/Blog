import { prisma } from '../../lib/prisma.js' // Aqui importa o 'modelo', feito no schema.prisma
import { relativeTime } from '../../utills/tempoRelativo.js'
import { isValidObjectId } from '../../utills/isValidObjectId.js';
import Article from '../../models/Article.js';

export const comment = async (req, res) => {
    const articleSlug = req.params.slug;
    const userId = req.user._id;
    const userName = req.user.name
    const post = req.body.post;

    try {
        const articleValid = await Article.findOne({ slug: articleSlug }).select('slug').lean(); // select para retornar apenas o _id e lean() para converter em objeto JS
        if(!articleValid) return res.status(400).json({ message: 'Article not found' });

        await prisma.comment.create({ // Diferente do mongoose que para salvar (await Model.save) uma nova criação de documento o prisma cria e salva ao mesmo tempo
            data: {
                post,
                userId,
                userName,
                articleSlug
            }
        })

        await Article.updateOne({slug: articleSlug}, { $inc: { commentCount: 1 } })
        res.status(204).json({ 
            message: "Comment added",
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.error('Error when commenting on the article', error);
    }
}

export const editComment = async (req, res) => {
    const post = req.body.post;
    const commentId = req.params.commentId;

    try {
        const verifyComment = await prisma.comment.findFirst({
            where: {
                id: commentId
            },
            select: {
                post: true
            }
        })
        if(!verifyComment) return res.status(400).json({
            message: 'Comment not found'
        })

        const editComment = await prisma.comment.update({
            where: { // Onde | qual documento especifico tenha esse campo especifico
                id: `${commentId}`
            },
            data: { // Os dados que serão modificados
                post
            }
        })

        res.status(200).json({ 
            message: 'Comentário editado!',
            comment: editComment.post,
            user: editComment.userId, 
            article: editComment.articleId,
            // created: relativeTime(editComment.creationDate),
            // edited: editComment.isEdited
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.error('Error editing a comment', error);
    }
}

export const removeComment = async (req, res) => {
    const commentId = req.params.commentId;
    const articleSlug = req.params.slug;

    try {
        const [articleValid, commentVerify] = await Promise.all([
            Article.findOne({ slug: articleSlug }).select('slug').lean(),
            prisma.comment.findFirst({
                where: {
                    id: commentId,
                    articleSlug
                },
                select: { id: true }
            })
        ])

        if(!articleValid) return res.status(404).json({ message: 'Article not found' });
        if(!commentVerify) return res.status(404).json({ message: 'Comment not found' });

        await Promise.all([
            prisma.comment.delete({
                where: { id: commentId }
            }),
            Article.updateOne({ slug: articleSlug }, { $inc: { commentCount: -1 } })
        ])
        res.status(204).json({ message: 'Comment removed' });
    } catch (error) {
        console.error('Error removing comment', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}