import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/lib/prisma.js', () => ({
    prisma: {
        like: {
            findMany: jest.fn(),
            create: jest.fn(),
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
    getLikes,
    createLike,
    deleteLike,
    verifyExistsLikeId,
    verifyUserLikeArticle
} = await import('../../src/repositories/likeRepository.js');

describe('Like Repository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getLikes', () => {
        test('should return all likes for a user', async () => {
            const mockLikes = [
                { articleSlug: 'article-1', id: 'like-1' },
                { articleSlug: 'article-2', id: 'like-2' }
            ];

            prisma.like.findMany.mockResolvedValue(mockLikes);

            const result = await getLikes('user-1');

            expect(prisma.like.findMany).toHaveBeenCalledWith({
                where: { userId: 'user-1' },
                select: {
                    articleSlug: true,
                    id: true
                }
            });
            expect(result).toEqual(mockLikes);
        });

        test('should return empty array when user has no likes', async () => {
            prisma.like.findMany.mockResolvedValue([]);

            const result = await getLikes('user-without-likes');

            expect(result).toEqual([]);
        });
    });

    describe('createLike', () => {
        test('should create a new like', async () => {
            const mockLike = {
                id: 'like-1',
                userId: 'user-1',
                articleSlug: 'article-1'
            };

            prisma.like.create.mockResolvedValue(mockLike);

            const result = await createLike('user-1', 'article-1');

            expect(prisma.like.create).toHaveBeenCalledWith({
                data: {
                    userId: 'user-1',
                    articleSlug: 'article-1'
                }
            });
            expect(result).toEqual(mockLike);
        });
    });

    describe('deleteLike', () => {
        test('should delete a like', async () => {
            const mockDeletedLike = {
                id: 'like-1',
                userId: 'user-1',
                articleSlug: 'article-1'
            };

            prisma.like.delete.mockResolvedValue(mockDeletedLike);

            const result = await deleteLike('like-1');

            expect(prisma.like.delete).toHaveBeenCalledWith({
                where: { id: 'like-1' }
            });
            expect(result).toEqual(mockDeletedLike);
        });
    });

    describe('verifyExistsLikeId', () => {
        test('should return like when exists', async () => {
            const mockLike = { id: 'like-1' };

            prisma.like.findFirst.mockResolvedValue(mockLike);

            const result = await verifyExistsLikeId('like-1');

            expect(prisma.like.findFirst).toHaveBeenCalledWith({
                where: { id: 'like-1' },
                select: { id: true }
            });
            expect(result).toEqual(mockLike);
        });

        test('should return null when like does not exist', async () => {
            prisma.like.findFirst.mockResolvedValue(null);

            const result = await verifyExistsLikeId('nonexistent');

            expect(result).toBeNull();
        });
    });

    describe('verifyUserLikeArticle', () => {
        test('should return like when user liked article', async () => {
            const mockLike = { id: 'like-1' };

            prisma.like.findFirst.mockResolvedValue(mockLike);

            const result = await verifyUserLikeArticle('user-1', 'article-1');

            expect(prisma.like.findFirst).toHaveBeenCalledWith({
                where: {
                    userId: 'user-1',
                    articleSlug: 'article-1'
                },
                select: { id: true }
            });
            expect(result).toEqual(mockLike);
        });

        test('should return null when user did not like article', async () => {
            prisma.like.findFirst.mockResolvedValue(null);

            const result = await verifyUserLikeArticle('user-1', 'article-1');

            expect(result).toBeNull();
        });
    });
});
