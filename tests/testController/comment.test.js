import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/services/commentService.js', () => ({
    createComment: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn()
}));

jest.unstable_mockModule('../../src/config/logger.js', () => ({
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() }
}));

jest.unstable_mockModule('../../src/config/requestMeta.js', () => ({
    getRequestMeta: jest.fn().mockImplementation((req, extra) => ({ ip: req?.ip || '127.0.0.1', agent: req?.headers?.['user-agent'] || 'test-agent', route: req?.originalUrl || req?.url || '/', method: req?.method || 'GET', userId: extra?.userId || req?.user?._id || null, ...extra }))
}));

const { createComment, updateComment, deleteComment } = await import('../../src/services/commentService.js');
const { comment, EditComment, removeComment } = await import('../../src/controllers/commentController.js');

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
            post: 'commentEdit'
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

        expect(updateComment).toHaveBeenCalledWith('1', 'commentEdit');
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
            articleSlug: 'article-test'
        });

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
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.json).toHaveBeenCalledWith({ message: 'Comment removed' })
    });
})