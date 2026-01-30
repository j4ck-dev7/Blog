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
            {
                title: 'title1',
                banner: 'banner/',
                creationDate: 123456789,
                tags: ['tag1', 'tag2'],
                planRole: 'FREE',
                likeCount: 2,
                commentCount: 4,
                viewsCount: 20
            },
            {
                title: 'title2',
                banner: 'banner/',
                creationDate: 123456789,
                tags: ['tag1', 'tag2'],
                planRole: 'FREE',
                likeCount: 2,
                commentCount: 4,
                viewsCount: 20
            },
        ]);
        countArticles.mockResolvedValue(2);
        client.get.mockResolvedValue(undefined);

        const result = await GetAllArticles('1', '2');
        expect(result).toEqual({
            articles: [
                {
                    title: 'title1',
                    banner: 'banner/',
                    tags: [],
                    plan: 'FREE',
                    createdIn: '2024-01-29 10:00:00',
                    likeCount: 3,
                    commentCount: 5,
                    viewsCount: 20
                },
                {
                    title: 'title2',
                    banner: 'banner/',
                    tags: [],
                    plan: 'FREE',
                    createdIn: '2024-01-29 10:00:00',
                    likeCount: 3,
                    commentCount: 5,
                    viewsCount: 20
                },
            ],
            // pagination: {
            //     total: 2,
            //     pages: 1,
            //     currentPage: 1,
            //     limit: 2,
            //     hasNext: false,
            //     hasPrev: false
            // }
        });
        expect(allArticles).toHaveBeenCalledWith(0, 2);
    });
});