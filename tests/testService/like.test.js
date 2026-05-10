import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/repositories/likeRepository.js', () => ({
    getLikes: jest.fn(),
    createLike: jest.fn(),
    deleteLike: jest.fn(),
    verifyUserLikeArticle: jest.fn()
}));

jest.unstable_mockModule('../../src/repositories/articleRepository.js', () => ({
    incrementArticleLikeCount: jest.fn(),
    decrementArticleLikeCount: jest.fn()
}))

jest.unstable_mockModule('../../src/config/logger.js', () => ({
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }
}));

const { getLikes, createLike, deleteLike, verifyUserLikeArticle } = await import('../../src/repositories/likeRepository.js');
const { decrementArticleLikeCount, incrementArticleLikeCount } = await import('../../src/repositories/articleRepository.js');
const { allLikesUser, addLike, removeLike } = await import('../../src/services/likeService.js');

describe('Like Service Test', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    test('Return all likes', async () => {
        getLikes.mockResolvedValue([
            {
                articleSlug: 'artigo-test1',
                id: '1'
            },
            {
                articleSlug: 'artigo-test2',
                id: '2'
            },
        ]);

        const result = await allLikesUser('cjld2cjxh0000qzrmn831i7rn');

        expect(getLikes).toHaveBeenCalledWith('cjld2cjxh0000qzrmn831i7rn')
        expect(result).toEqual([
            {
                articleSlug: 'artigo-test1',
                id: '1'
            },
            {
                articleSlug: 'artigo-test2',
                id: '2'
            },
        ]);
    });

    test('return error liked the article exist', async () => {
        verifyUserLikeArticle.mockResolvedValue(true);
        
        await expect(
            addLike('cjld2cjxh0000qzrmn831i7rn', 'article-test')
        ).rejects.toThrow('You already liked this article');
    });

    test('return like', async () => {
        verifyUserLikeArticle.mockResolvedValue(undefined);
        incrementArticleLikeCount.mockResolvedValue({
            modifiedCount: 1 
        });
        createLike.mockResolvedValue({
            id: '1',
            userId: 'cjld2cjxh0000qzrmn831i7rn',
            articleSlug: 'article-test2',
            dateCreated: Date.now,

        });

        const result = await addLike('cjld2cjxh0000qzrmn831i7rn', 'article-test2');

        expect(createLike).toHaveBeenCalledWith('cjld2cjxh0000qzrmn831i7rn', 'article-test2');
        expect(incrementArticleLikeCount).toHaveBeenCalledWith('article-test2')
        expect(result).toEqual([
            {
                id: '1',
                userId: 'cjld2cjxh0000qzrmn831i7rn',
                articleSlug: 'article-test2',
                dateCreated: Date.now
            },
            {
                modifiedCount: 1
            }
        ]);
    });

    test('return error when like not exist', async () => {
        verifyUserLikeArticle.mockResolvedValue(undefined);
        
        await expect(
            removeLike('cjld2cjxh0000qzrmn831i7rn', 'article-test')
        ).rejects.toThrow('Like does not exist');
    });

    test('Return delete like', async () => {
        verifyUserLikeArticle.mockResolvedValue({
            id: 'tz4a98xxat96iws9zmbrgj3a'
        });
        decrementArticleLikeCount.mockResolvedValue({
            modifiedCount: 1 
        })
        deleteLike.mockResolvedValue({
            id: 'tz4a98xxat96iws9zmbrgj3a',
            articleSlug: 'article-test',
            userId: 'cjld2cjxh0000qzrmn831i7rn',
            dateCreated: Date.now
        })

        const result = await removeLike('cjld2cjxh0000qzrmn831i7rn', 'article-test');  
        expect(verifyUserLikeArticle).toHaveBeenCalledWith('cjld2cjxh0000qzrmn831i7rn', 'article-test');
        expect(result).toEqual([
            { 
                id: 'tz4a98xxat96iws9zmbrgj3a',
                articleSlug: 'article-test',
                userId: 'cjld2cjxh0000qzrmn831i7rn',
                dateCreated: Date.now
            },
            { modifiedCount: 1 }
        ]);
    });
})