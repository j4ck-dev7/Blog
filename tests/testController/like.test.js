import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/services/likeService.js', () => ({
    allLikesUser: jest.fn(),
    addLike: jest.fn(),
    removeLike: jest.fn()
}));

const { allLikesUser, addLike, removeLike } = await import('../../src/services/likeService.js');
const { allLikes, like, DeleteLike } = await import('../../src/controllers/user/likeController.js');

describe('Like Controller Test', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });
    test('Return all Likes from controller', async () => {
        allLikesUser.mockResolvedValue([
            {
                id: '1',
                articleSlug: 'artigo-test1'
            },
            {
                id: '1',
                articleSlug: 'artigo-test2'
            },
        ])

        const req = {
            user: {
                _id: '1'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await allLikes(req, res);

        expect(res.status).toHaveBeenLastCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ 
            message: 'Likes obteined', 
            likes: [
                {
                    id: '1',
                    articleSlug: 'artigo-test1'
                },
                {
                    id: '1',
                    articleSlug: 'artigo-test2'
                },
        ]});
    });

    test('Return error when user is not register', async () => {
        allLikesUser.mockRejectedValue(new Error('User not authenticated, please login or register' ));

        const req = {
            user: {
                _id: ''
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await allLikes(req, res);

        expect(allLikesUser).toHaveBeenCalledWith('')
        expect(res.status).toHaveBeenLastCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not authenticated, please login or register' })
    });

    test('Return error when article are liked', async () => {
        addLike.mockRejectedValue(new Error('You already liked this article'));

        const req = {
            user: {
                _id: '1'
            },

            params: {
                articleSlug: 'article-test'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await like(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'You already liked this article' });
    });

    test('Return status code 204 when like article', async () => {
        addLike.mockResolvedValue(true)

        const req = {
            user: {
                _id: '1'
            },

            params: {
                articleSlug: 'article-test3'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await like(req, res);

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.json).toHaveBeenCalledWith({ message: 'Liked article' });
    });

    test('Return status code 404 when like not found for delete', async () => {
        removeLike.mockRejectedValue(new Error('Like does not exist'));

        const req = {
            user: {
                _id: '1'
            },

            params: {
                articleSlug: 'article-test3'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await DeleteLike(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Like does not exist' });
    });

    test('Return status code 204 when delete like', async () => {
        removeLike.mockResolvedValue({
            userId: '1',
            articleSlug: 'article-test3'
        })

        const req = {
            user: {
                _id: '1'
            },

            params: {
                slug: 'article-test3'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await DeleteLike(req, res);

        expect(removeLike).toHaveBeenCalledWith('1', 'article-test3')
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.json).toHaveBeenCalledWith({ message: 'Like removed' })
    })
})