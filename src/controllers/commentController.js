import { createComment, updateComment, deleteComment } from "../services/commentService.js";

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
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        console.error('Error when commenting on the article', error);
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
    } catch (error) {
        if(error.message === 'Comment not found'){
            return res.status(404).json({ message: 'Comment not found' });
        }

        console.error('Error editing a comment', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const removeComment = async (req, res) => {
    const commentId = req.params.commentId;
    const articleSlug = req.params.slug;

    try {
        await deleteComment(commentId, articleSlug);
        res.status(204).json({ message: 'Comment removed' });
    } catch (error) {
        if(error.message === 'Comment not found'){
            return res.status(404).json({ message: 'Comment not found' });
        }
        
        console.error('Error removing comment', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}