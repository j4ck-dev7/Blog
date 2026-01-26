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

        const result = await allLikesUser('1');

        expect(getLikes).toHaveBeenCalledWith('1')
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
            addLike('1', 'article-test')
        ).rejects.toThrow('You already liked this article');
    });

    test('return like', async () => {
        verifyUserLikeArticle.mockResolvedValue(undefined);
        incrementArticleLikeCount.mockResolvedValue({
            modifiedCount: 1 
        });
        createLike.mockResolvedValue({
            id: '1',
            userId: '2',
            articleSlug: 'article-test2',
            dateCreated: Date.now,

        });

        const result = await addLike('2', 'article-test2');

        expect(createLike).toHaveBeenCalledWith('2', 'article-test2');
        expect(incrementArticleLikeCount).toHaveBeenCalledWith('article-test2')
        expect(result).toEqual([
            {
                id: '1',
                userId: '2',
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
            removeLike('3', 'article-test')
        ).rejects.toThrow('Like does not exist');
    });

    test('Return delete like', async () => {
        verifyUserLikeArticle.mockResolvedValue(true);
        decrementArticleLikeCount.mockResolvedValue({
            modifiedCount: 1 
        })
        deleteLike.mockResolvedValue({
            id: '3',
            articleSlug: 'article-test',
            userId: '2',
            dateCreated: Date.now
        })

        const result = await removeLike('2', 'article-test');  
        expect(verifyUserLikeArticle).toHaveBeenCalledWith('2', 'article-test');
        expect(result).toEqual([
            { 
                id: '3',
                articleSlug: 'article-test',
                userId: '2',
                dateCreated: Date.now
            },
            { modifiedCount: 1 }
        ]);
    });
})