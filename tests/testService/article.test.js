import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/repositories/articleRepository.js', () => ({
    allArticles: jest.fn(),
    findArticlesByTag: jest.fn(),
    findArticleBySlug: jest.fn(),
    countArticles: jest.fn(),
    countArticlesByTag: jest.fn(),
    incrementArticleViews: jest.fn(),
    searchArticles: jest.fn(),
    searchArticlesCount: jest.fn()
}));

jest.unstable_mockModule('../../src/repositories/commentRepository.js', () => ({
    getCommentsBySlug: jest.fn()
}));

jest.unstable_mockModule('../../src/config/redis.js', () => ({
    default: {
        get: jest.fn().mockReturnValue(undefined),
        setEx: jest.fn()
    }
}));

const { default: client } = await import('../../src/config/redis.js');
const { allArticles, countArticles } = await import('../../src/repositories/articleRepository.js');
const { getCommentsBySlug } = await import('../../src/repositories/commentRepository.js')
const { GetAllArticles } = await import('../../src/services/articleService.js');

describe('Article Service Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    test('Return all articles from MongoDB and save in Redis', async () => {
        allArticles.mockResolvedValue([
            
        ]);
        countArticles.mockResolvedValue(2);
        client.get.mockResolvedValue(undefined);

        const result = await GetAllArticles('1', '2');
        expect(result).toEqual({

        });
        expect(allArticles).toHaveBeenCalledWith(0, 2);
    });
});