import { describe, test, beforeEach, expect, jest } from '@jest/globals';

jest.unstable_mockModule('../../src/services/articleService.js', () => ({
    GetAllArticles: jest.fn(),
    LoadArticleBySlug: jest.fn(),
    SearchForArticles: jest.fn(),
    FindArticlesByTag: jest.fn()
}));

const { GetAllArticles, LoadArticleBySlug, SearchForArticles, FindArticlesByTag } = await import('../../src/services/articleService.js');
const { allArticles, loadArticle, findArticleByTag, searchArticles } = await import('../../src/controllers/user/articleController.js');

describe('Article Controller Test - allArticles', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    test('Return all articles with status code 200', async () => {
        GetAllArticles.mockResolvedValue(
            {
                articles: [
                    {
                        title: 'crtyvg fghjd',
                        slug: 'crtyvg-fghjd',
                        author: 'admin',
                        banner: 'assets/banner/img.png',
                        tags: ['tag1', 'tag2'],
                        planRole: 'free',
                        viewsCount: 1,
                        likeCount: 0,
                        commentCount: 0,
                        creationDate: '2025-12-15T20:00:27.565Z'
                    },
                    {
                        title: 'crtyvg fghj',
                        slug: 'crtyvg-fghj',
                        author: 'admin',
                        banner: 'assets/banner/img.png',
                        tags: ['tag1', 'tag2'],
                        planRole: 'free',
                        viewsCount: 9,
                        likeCount: 0,
                        commentCount: 0,
                        creationDate: '2025-12-15T20:00:27.565Z'
                    }
                ],
                pagination: {
                    total: 2,
                    pages: 1,
                    currentPage: 1,
                    limit: 2,
                    hasNext: false,
                    hasPrev: false
                }
            }
        )

        const req = {
            query: {
                page: 1,
                limit: 2
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await allArticles(req, res);

        expect(GetAllArticles).toHaveBeenCalledWith(1, 2);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining(
            {
                message: 'Articles obtained',
                articles: [
                    {
                        title: 'crtyvg fghjd',
                        slug: 'crtyvg-fghjd',
                        author: 'admin',
                        banner: 'assets/banner/img.png',
                        tags: ['tag1', 'tag2'],
                        planRole: 'free',
                        viewsCount: 1,
                        likeCount: 0,
                        commentCount: 0,
                        creationDate: '2025-12-15T20:00:27.565Z'
                    },
                    {
                        title: 'crtyvg fghj',
                        slug: 'crtyvg-fghj',
                        author: 'admin',
                        banner: 'assets/banner/img.png',
                        tags: ['tag1', 'tag2'],
                        planRole: 'free',
                        viewsCount: 9,
                        likeCount: 0,
                        commentCount: 0,
                        creationDate: '2025-12-15T20:00:27.565Z'
                    }
                ],
                pagination: {
                    total: 2,
                    pages: 1,
                    currentPage: 1,
                    limit: 2,
                    hasNext: false,
                    hasPrev: false
                }
            }
        ))
    });

    test('Return error when articles not found with status code 404', async () => {
        GetAllArticles.mockRejectedValue(new Error('Articles not found'));

        const req = {
            query: {
                page: 1,
                limit: 2
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await allArticles(req, res);

        expect(GetAllArticles).toHaveBeenCalledWith(1, 2);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Articles not found'
        }));
    });
});

describe('Article Controller Test - loadArticle', () => {
    test('Return article with status code 200', async () => {
        LoadArticleBySlug.mockResolvedValue(
            {
                title: 'crtyvg fghjd',
                slug: 'crtyvg-fghjd',
                author: 'admin',
                banner: 'assets/banner/img.png',
                tags: ['tag1', 'tag2'],
                planRole: 'free',
                viewsCount: 1,
                likeCount: 0,
                commentCount: 0,
                creationDate: '2025-12-15T20:00:27.565Z'
            }    
        )

        const req = {
            params: {
                slug: 'crtyvg-fghjd'
            }
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await loadArticle(req, res);

        expect(LoadArticleBySlug).toHaveBeenCalledWith('crtyvg-fghjd');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            {
                message: 'Article loaded',
                article: {
                    title: 'crtyvg fghjd',
                    slug: 'crtyvg-fghjd',
                    author: 'admin',
                    banner: 'assets/banner/img.png',
                    tags: ['tag1', 'tag2'],
                    planRole: 'free',
                    viewsCount: 1,
                    likeCount: 0,
                    commentCount: 0,
                    creationDate: '2025-12-15T20:00:27.565Z'
                }
            }
        )
    })
})