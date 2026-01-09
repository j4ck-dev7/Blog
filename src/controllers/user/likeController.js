import { allLikesUser, addLike, removeLike } from "../../services/likeService.js";

export const like = async (req, res) => {
    const userId = req.user._id;
    const articleSlug = req.params.slug;

    try {
        await addLike(userId, articleSlug);
        res.status(204).json({ message: "Liked article" });
    } catch (error) {
        if(error.message === 'You already liked this article'){
            return  res.status(400).json({ message: 'You already liked this article' });
        }

        console.error('Error while liking an article', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const deleteLike = async (req, res) => {
    const articleSlug = req.params.slug;
    const likeId = req.params.likeId;

    try {
        await removeLike(likeId, articleSlug);
        res.status(204).json({ message: 'Like removed' });
    } catch (error) {
        if(error.message === 'Like does not exist'){
            return res.status(404).json({ message: 'Like does not exist' });
        }

        console.error('Error removing like', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const allLikes = async (req, res) => {
    const userId = req.user._id;
    if(userId === 'freeAccess') return res.status(401).json({ message: 'User not authenticated, please login or register' });

    try {
        const likes = await allLikesUser(userId);
        res.status(200).json({ message: 'Likes obteined', likes});
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        console.error('Server error:', error);
    }
}