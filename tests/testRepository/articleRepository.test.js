import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/models/Article.js', () => ({
    default: {
        find: jest.fn(),
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
        countDocuments: jest.fn()
    }
}));

jest.unstable_mockModule('../../src/config/logger.js', () => ({
    logger: { debug: jest.fn(), error: jest.fn() }
}));

const Article = (await import('../../src/models/Article.js')).default;
const { logger } = await import('../../src/config/logger.js');
const {
    allArticles,
    findArticlesByTag,
    searchArticles,
    findArticleBySlug,
    findArticleBySlugWithPlanRole,
    incrementArticleViews,
    decrementArticleCommentCount,
    incrementArticleLikeCount,
    decrementArticleLikeCount,
    incrementArticleCommentCount,
    searchArticlesCount
} = await import('../../src/repositories/articleRepository.js');

describe('Article Repository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('allArticles', () => {
        test('should return all articles sorted by creationDate', async () => {
            const mockArticles = [
                { title: 'Article 1', slug: 'article-1', creationDate: '2024-01-01' },
                { title: 'Article 2', slug: 'article-2', creationDate: '2024-01-02' }
            ];

            const chainMethods = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockArticles)
            };

            Article.find.mockReturnValue(chainMethods);

            const result = await allArticles(0, 10);

            expect(Article.find).toHaveBeenCalledWith({});
            expect(chainMethods.sort).toHaveBeenCalledWith({ creationDate: -1 });
            expect(chainMethods.skip).toHaveBeenCalledWith(0);
            expect(chainMethods.limit).toHaveBeenCalledWith(10);
            expect(result).toEqual({ success: true, data: { articles: mockArticles } });
        });

        test('should throw error when query fails', async () => {
            const error = new Error('Database error');
            Article.find.mockImplementation(() => {
                throw error;
            });

            await expect(allArticles(0, 10)).rejects.toThrow('Database error');
            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe('findArticlesByTag', () => {
        test('should find articles by tag', async () => {
            const mockArticles = [
                { title: 'Article 1', slug: 'article-1', tags: ['javascript'] },
                { title: 'Article 2', slug: 'article-2', tags: ['javascript', 'web'] }
            ];

            const chainMethods = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockArticles)
            };

            Article.find.mockReturnValue(chainMethods);

            const result = await findArticlesByTag('javascript', 0, 10);

            expect(Article.find).toHaveBeenCalledWith({ tags: 'javascript' });
            expect(result).toEqual({ success: true, data: { articles: mockArticles } });
        });

        test('should return empty array when tag not found', async () => {
            const chainMethods = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue([])
            };

            Article.find.mockReturnValue(chainMethods);

            const result = await findArticlesByTag('nonexistent', 0, 10);

            expect(result).toEqual({ success: true, data: { articles: [] } });
        });
    });

    describe('searchArticles', () => {
        test('should search articles by query', async () => {
            const mockArticles = [
                {
                    _id: '1',
                    title: 'JavaScript Guide',
                    slug: 'javascript-guide',
                    summary: 'Guide summary',
                    creationDate: '2024-01-01',
                    author: 'author1'
                },
                {
                    _id: '2',
                    title: 'JavaScript Advanced',
                    slug: 'javascript-advanced',
                    summary: 'Advanced summary',
                    creationDate: '2024-02-01',
                    author: 'author2'
                }
            ];

            const chainMethods = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockArticles)
            };

            Article.find.mockReturnValue(chainMethods);

            const result = await searchArticles('JavaScript', 0, 10);

            expect(Article.find).toHaveBeenCalled();
            expect(result).toEqual({
                success: true,
                data: {
                    articles: [
                        {
                            id: '1',
                            title: 'JavaScript Guide',
                            summary: 'Guide summary',
                            slug: 'javascript-guide',
                            creationDate: '2024-01-01',
                            tags: undefined,
                            author: 'author1'
                        },
                        {
                            id: '2',
                            title: 'JavaScript Advanced',
                            summary: 'Advanced summary',
                            slug: 'javascript-advanced',
                            creationDate: '2024-02-01',
                            tags: undefined,
                            author: 'author2'
                        }
                    ]
                }
            });
        });
    });

    describe('findArticleBySlug', () => {
        test('should find article by slug', async () => {
            const mockArticle = { title: 'Article 1', slug: 'article-1', author: 'john' };

            const chainMethods = {
                select: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockArticle)
            };

            Article.findOne.mockReturnValue(chainMethods);

            const result = await findArticleBySlug('article-1');

            expect(Article.findOne).toHaveBeenCalledWith({ slug: 'article-1' });
            expect(result).toEqual({ success: true, data: { article: mockArticle } });
        });

        test('should return null when article not found', async () => {
            const chainMethods = {
                select: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(null)
            };

            Article.findOne.mockReturnValue(chainMethods);

            const result = await findArticleBySlug('nonexistent');

            expect(result).toEqual({ success: true, data: { article: null } });
        });
    });


    describe('findArticleBySlugWithPlanRole', () => {
        test('should return article with planRole', async () => {
            const mockArticle = { planRole: 'BASIC' };

            const chainMethods = {
                select: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockArticle)
            };

            Article.findOne.mockReturnValue(chainMethods);

            const result = await findArticleBySlugWithPlanRole('article-1');

            expect(result).toEqual({ success: true, data: { article: mockArticle } });
        });
    });

    describe('incrementArticleViews', () => {
        test('should increment viewsCount', async () => {
            const mockResult = {
                _id: '1',
                title: 'Article 1',
                slug: 'article-1',
                summary: 'Summary',
                creationDate: '2024-01-01',
                tags: ['test'],
                author: 'author1',
                content: 'content',
                viewsCount: 11,
                likeCount: 0,
                commentCount: 0,
                planRole: 'BASIC'
            };

            Article.findOneAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockResult) });

            const result = await incrementArticleViews('article-1');

            expect(Article.findOneAndUpdate).toHaveBeenCalledWith({ slug: 'article-1' }, { $inc: { viewsCount: 1 } }, { new: true });
            expect(result).toEqual({
                success: true,
                data: {
                    article: {
                        id: '1',
                        title: 'Article 1',
                        summary: 'Summary',
                        slug: 'article-1',
                        creationDate: '2024-01-01',
                        tags: ['test'],
                        author: 'author1',
                        content: 'content',
                        viewsCount: 11,
                        likeCount: 0,
                        commentCount: 0,
                        planRole: 'BASIC'
                    }
                }
            });
        });
    });

    describe('decrementArticleCommentCount', () => {
        test('should decrement commentCount', async () => {
            const mockResult = {
                _id: '1',
                title: 'Article 1',
                slug: 'article-1',
                summary: 'Summary',
                creationDate: '2024-01-01',
                tags: ['test'],
                author: 'author1',
                content: 'content',
                viewsCount: 10,
                likeCount: 0,
                commentCount: 4,
                planRole: 'BASIC'
            };

            Article.findOneAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockResult) });

            const result = await decrementArticleCommentCount('article-1');

            expect(Article.findOneAndUpdate).toHaveBeenCalledWith({ slug: 'article-1' }, { $inc: { commentCount: -1 } }, { new: true });
            expect(result).toEqual({
                success: true,
                data: {
                    article: {
                        id: '1',
                        title: 'Article 1',
                        summary: 'Summary',
                        slug: 'article-1',
                        creationDate: '2024-01-01',
                        tags: ['test'],
                        author: 'author1',
                        content: 'content',
                        viewsCount: 10,
                        likeCount: 0,
                        commentCount: 4,
                        planRole: 'BASIC'
                    }
                }
            });
        });
    });

    describe('incrementArticleLikeCount', () => {
        test('should increment likeCount', async () => {
            const mockResult = {
                _id: '1',
                title: 'Article 1',
                slug: 'article-1',
                summary: 'Summary',
                creationDate: '2024-01-01',
                tags: ['test'],
                author: 'author1',
                content: 'content',
                viewsCount: 10,
                likeCount: 5,
                commentCount: 0,
                planRole: 'BASIC'
            };

            Article.findOneAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockResult) });

            const result = await incrementArticleLikeCount('article-1');

            expect(Article.findOneAndUpdate).toHaveBeenCalledWith({ slug: 'article-1' }, { $inc: { likeCount: 1 } }, { new: true });
            expect(result).toEqual({
                success: true,
                data: {
                    article: {
                        id: '1',
                        title: 'Article 1',
                        summary: 'Summary',
                        slug: 'article-1',
                        creationDate: '2024-01-01',
                        tags: ['test'],
                        author: 'author1',
                        content: 'content',
                        viewsCount: 10,
                        likeCount: 5,
                        commentCount: 0,
                        planRole: 'BASIC'
                    }
                }
            });
        });
    });

    describe('decrementArticleLikeCount', () => {
        test('should decrement likeCount', async () => {
            const mockResult = {
                _id: '1',
                title: 'Article 1',
                slug: 'article-1',
                summary: 'Summary',
                creationDate: '2024-01-01',
                tags: ['test'],
                author: 'author1',
                content: 'content',
                viewsCount: 10,
                likeCount: 3,
                commentCount: 0,
                planRole: 'BASIC'
            };

            Article.findOneAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockResult) });

            const result = await decrementArticleLikeCount('article-1');

            expect(Article.findOneAndUpdate).toHaveBeenCalledWith({ slug: 'article-1' }, { $inc: { likeCount: -1 } }, { new: true });
            expect(result).toEqual({
                success: true,
                data: {
                    article: {
                        id: '1',
                        title: 'Article 1',
                        summary: 'Summary',
                        slug: 'article-1',
                        creationDate: '2024-01-01',
                        tags: ['test'],
                        author: 'author1',
                        content: 'content',
                        viewsCount: 10,
                        likeCount: 3,
                        commentCount: 0,
                        planRole: 'BASIC'
                    }
                }
            });
        });
    });

    describe('incrementArticleCommentCount', () => {
        test('should increment commentCount', async () => {
            const mockResult = {
                _id: '1',
                title: 'Article 1',
                slug: 'article-1',
                summary: 'Summary',
                creationDate: '2024-01-01',
                tags: ['test'],
                author: 'author1',
                content: 'content',
                viewsCount: 10,
                likeCount: 0,
                commentCount: 5,
                planRole: 'BASIC'
            };

            Article.findOneAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockResult) });

            const result = await incrementArticleCommentCount('article-1');

            expect(Article.findOneAndUpdate).toHaveBeenCalledWith({ slug: 'article-1' }, { $inc: { commentCount: 1 } }, { new: true });
            expect(result).toEqual({
                success: true,
                data: {
                    article: {
                        id: '1',
                        title: 'Article 1',
                        summary: 'Summary',
                        slug: 'article-1',
                        creationDate: '2024-01-01',
                        tags: ['test'],
                        author: 'author1',
                        content: 'content',
                        viewsCount: 10,
                        likeCount: 0,
                        commentCount: 5,
                        planRole: 'BASIC'
                    }
                }
            });
        });
    });

    describe('searchArticlesCount', () => {
        test('should return count of articles matching search query', async () => {
            Article.countDocuments.mockResolvedValue(42);

            const result = await searchArticlesCount('JavaScript');

            expect(Article.countDocuments).toHaveBeenCalledWith({ $text: { $search: 'JavaScript' } });
            expect(result).toEqual({ success: true, data: { count: 42 } });
        });

        test('should return 0 when no articles match', async () => {
            Article.countDocuments.mockResolvedValue(0);

            const result = await searchArticlesCount('nonexistent');

            expect(result).toEqual({ success: true, data: { count: 0 } });
        });
    });
});
