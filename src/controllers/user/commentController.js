import Comment from '../../models/Comment.js';
import { relativeTime } from '../../utills/tempoRelativo.js'
import { isValidObjectId } from '../../utills/isValidObjectId.js';
import Article from '../../models/Article.js';

export const comment = async (req, res) => {
    const article = req.params.articleId;
    const user = req.user._id;
    const post = req.body.post;

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

        const articleValid = await Article.findById(article).lean();
        if(!articleValid) return res.status(400).json({ message: 'Article not found' });

        const comment = new Comment({
            post,
            user,
            article
        });

        await Promise.all([
            Article.updateOne({_id: article}, { $inc: { commentCount: 1 } }),
            comment.save()
        ])
        
        res.status(204).json({ 
            message: "Comment added", 
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.error('Error while liking an article', error);
    }
}

export const editComment = async (req, res) => {
    const post = req.body.post;
    const updateField = { post, isEdited: true };
    const commentId = req.params.commentId;

    try {
        if (!isValidObjectId(commentId)) {
            return res.status(400).json({ 
                message: 'ID inválido' 
            });
        }
        const editComment = await Comment.updateOne(
            { _id: commentId },
            { $set: updateField },
            { runValidators: true, new: true }
        ).select('creationDate post +isEdited')
            .populate({
                path: 'user',
                select: '-_id -password -role -email -createdAt -__v'
            })
            .populate({
                path: 'article',
                select: '-_id title'
            })
            .lean();

        if(!editComment) return res.status(404).json({ message: 'Comment not found' });

        res.status(200).json({ 
            message: 'Comentário editado!',
            comment: editComment.post,
            user: editComment.user, 
            article: editComment.article,
            created: relativeTime(editComment.creationDate),
            edited: editComment.isEdited
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.error('Error editing a comment', error);
    }
}

export const removeComment = async (req, res) => {
    const commentId = req.params.commentId;
    const articleId = req.params.articleId;

    try {
        if (!isValidObjectId(commentId)) {
            return res.status(400).json({ 
                message: 'ID inválido' 
            });
        }

        const [articleValid, comment] = await Promise.all([
            Article.findById(articleId).lean(),
            Comment.findOneAndDelete({ _id: commentId} )
        ])

        if(!articleValid) return res.status(400).json({ message: 'Article not found' });
        if(!comment) return res.status(400).json({ message: 'Comment not found' });

        await Article.updateOne({_id: articleId}, { $inc: { commentCount: -1 } })
        res.status(204).json({ message: 'Comment removed' });
    } catch (error) {
        console.error('Error removing comment', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}