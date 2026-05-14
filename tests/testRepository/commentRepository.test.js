import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/lib/prisma.js', () => ({
    prisma: {
        comment: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findFirst: jest.fn()
        }
    }
}));

jest.unstable_mockModule('../../src/config/logger.js', () => ({
    logger: { debug: jest.fn(), info: jest.fn(), error: jest.fn() }
}));

const { prisma } = await import('../../src/lib/prisma.js');
const { logger } = await import('../../src/config/logger.js');
const {
    getCommentsBySlug,
    addComment,
    editComment,
    removeComment,
    verifyComment
} = await import('../../src/repositories/commentRepository.js');

describe('Comment Repository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getCommentsBySlug', () => {
        test('should return comments for a given slug', async () => {
            const mockComments = [
                { userName: 'john', post: 'Great article!', creationDate: '2024-01-01' },
                { userName: 'jane', post: 'Thanks for sharing!', creationDate: '2024-01-02' }
            ];

            prisma.comment.findMany.mockResolvedValue(mockComments);

            const result = await getCommentsBySlug('article-slug');

            expect(prisma.comment.findMany).toHaveBeenCalledWith({
                where: { articleSlug: 'article-slug' },
                select: {
                    userName: true,
                    post: true,
                    creationDate: true
                }
            });
            expect(result).toEqual(mockComments);
        });

        test('should return empty array when no comments found', async () => {
            prisma.comment.findMany.mockResolvedValue([]);

            const result = await getCommentsBySlug('article-without-comments');

            expect(result).toEqual([]);
        });
    });

    describe('addComment', () => {
        test('should create a new comment', async () => {
            const mockComment = {
                id: 'comment-1',
                post: 'This is a comment',
                userId: 'user-1',
                userName: 'john',
                articleSlug: 'article-1',
                creationDate: '2024-01-01'
            };

            prisma.comment.create.mockResolvedValue(mockComment);

            const result = await addComment('This is a comment', 'user-1', 'john', 'article-1');

            expect(prisma.comment.create).toHaveBeenCalledWith({
                data: {
                    post: 'This is a comment',
                    userId: 'user-1',
                    userName: 'john',
                    articleSlug: 'article-1'
                }
            });
            expect(result).toEqual(mockComment);
        });
    });

    describe('editComment', () => {
        test('should update comment text', async () => {
            const mockUpdatedComment = {
                id: 'comment-1',
                post: 'Updated comment text',
                userId: 'user-1'
            };

            prisma.comment.update.mockResolvedValue(mockUpdatedComment);

            const result = await editComment('comment-1', 'Updated comment text');

            expect(prisma.comment.update).toHaveBeenCalledWith({
                where: { id: 'comment-1' },
                data: { post: 'Updated comment text' }
            });
            expect(result).toEqual(mockUpdatedComment);
        });
    });

    describe('removeComment', () => {
        test('should delete a comment', async () => {
            const mockDeletedComment = {
                id: 'comment-1',
                post: 'Deleted comment'
            };

            prisma.comment.delete.mockResolvedValue(mockDeletedComment);

            const result = await removeComment('comment-1');

            expect(prisma.comment.delete).toHaveBeenCalledWith({
                where: { id: 'comment-1' }
            });
            expect(result).toEqual(mockDeletedComment);
        });
    });

    describe('verifyComment', () => {
        test('should return comment when exists', async () => {
            const mockComment = { post: 'Test comment' };

            prisma.comment.findFirst.mockResolvedValue(mockComment);

            const result = await verifyComment('comment-1');

            expect(prisma.comment.findFirst).toHaveBeenCalledWith({
                where: { id: 'comment-1' },
                select: { post: true }
            });
            expect(result).toEqual(mockComment);
        });

        test('should return null when comment does not exist', async () => {
            prisma.comment.findFirst.mockResolvedValue(null);

            const result = await verifyComment('nonexistent');

            expect(result).toBeNull();
        });
    });
});
