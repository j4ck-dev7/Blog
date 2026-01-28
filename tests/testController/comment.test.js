import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/services/commentService.js', () => ({
    createComment: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn()
}));

const { createComment, updateComment, deleteComment } = await import('../../src/services/commentService.js');
const { comment, EditComment, removeComment } = await import('../../src/controllers/user/commentController.js');

describe('Comment Controller Test', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    test('Return comment with status code 201', async () => {
        createComment.mockResolvedValue(true);

        const req = {
            params: {
                slug: 'article-test',
            },

            user: {
                _id: '1',
                name: 'Test'
            },

            body: {
                post: 'comment'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await comment(req, res);

        expect(createComment).toHaveBeenCalledWith('comment', '1', 'Test', 'article-test');
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: 'Comment added' })
    });

    test('Return error with status code 404 when comment not found | exists', async () => {
        updateComment.mockRejectedValue(new Error('Comment not found'));

        const req = {
            params: {
                commentId: '1'
            },

            body: {
                post: 'commentEdit'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await EditComment(req, res);

        expect(updateComment).toHaveBeenCalledWith('1', 'commentEdit');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Comment not found' })
    });

    test('Return comment edited with status code 204', async () => {
        updateComment.mockResolvedValue({
            id: '1',
            post: 'commentEdit',
            userName: 'teste',
            userId: '1',
            articleSlug: 'article-test',
            creationDate: 1234567890
        });

        const req = {
            body: {
                post: 'commentEdit'
            },

            params: {
                commentId: '1'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await EditComment(req, res);

        expect(updateComment).toHaveBeenCalledWith({
            id: '1',
            post: 'commentEdit',
            userName: 'teste',
            userId: '1',
            articleSlug: 'article-test',
            creationDate: 1234567890
        });
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.json).toHaveBeenCalledWith({ message: 'Comment edited' })
    });

    test('Return error with status code 404 when comment not found | exists', async () => {
        deleteComment.mockRejectedValue(new Error('Comment not found'));

        const req = {
            params: {
                commentId: '1',
                slug: 'article-test'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await removeComment(req, res);

        expect(deleteComment).toHaveBeenCalledWith('1', 'article-test');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Comment not found' })
    });

    test('Return comment removed with status code 204', async () => {
        deleteComment.mockResolvedValue({
            id: '1',
            post: 'comment',
            userName: 'teste',
            userId: '1',
            articleSlug: 'article-test',
            creationDate: 1234567890
        });

        const req = {
            body: {
                post: 'comment'
            },

            params: {
                commentId: '1'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await removeComment(req, res);

        expect(deleteComment).toHaveBeenCalledWith({
            id: '1',
            post: 'comment',
            userName: 'teste',
            userId: '1',
            articleSlug: 'article-test',
            creationDate: 1234567890
        });
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.json).toHaveBeenCalledWith({ message: 'Comment removed' })
    });
})