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
const { allArticles, countArticles, incrementArticleViews, findArticleBySlug, findArticlesByTag, countArticlesByTag, searchArticles, searchArticlesCount } = await import('../../src/repositories/articleRepository.js');
const { getCommentsBySlug } = await import('../../src/repositories/commentRepository.js')
const { GetAllArticles, LoadArticleBySlug, FindArticlesByTag, SearchForArticles } = await import('../../src/services/articleService.js');

describe('Article Service Tests - GetAllArticles', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    test('Return all articles from MongoDB and save in Redis', async () => {
        allArticles.mockResolvedValue([
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
        ]);
        countArticles.mockResolvedValue(2);
        client.get.mockResolvedValue(undefined);

        const result = await GetAllArticles('1', '2');
        expect(result).toEqual(
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
        );
        expect(allArticles).toHaveBeenCalledWith(0, 2);
        expect(client.setEx).toHaveBeenCalledWith(
            'articles:page:1:limit:2',
            300,
            "{\"articles\":[{\"title\":\"crtyvg fghjd\",\"slug\":\"crtyvg-fghjd\",\"author\":\"admin\",\"banner\":\"assets/banner/img.png\",\"tags\":[\"tag1\",\"tag2\"],\"planRole\":\"free\",\"viewsCount\":1,\"likeCount\":0,\"commentCount\":0,\"creationDate\":\"2025-12-15T20:00:27.565Z\"},{\"title\":\"crtyvg fghj\",\"slug\":\"crtyvg-fghj\",\"author\":\"admin\",\"banner\":\"assets/banner/img.png\",\"tags\":[\"tag1\",\"tag2\"],\"planRole\":\"free\",\"viewsCount\":9,\"likeCount\":0,\"commentCount\":0,\"creationDate\":\"2025-12-15T20:00:27.565Z\"}],\"pagination\":{\"total\":2,\"pages\":1,\"currentPage\":1,\"limit\":2,\"hasNext\":false,\"hasPrev\":false}}"
        );
    });

    test('Return all articles from Redis', async () => {
        allArticles.mockResolvedValue(true);
        client.get.mockResolvedValue("{\"articles\":[{\"title\":\"crtyvg fghjd\",\"slug\":\"crtyvg-fghjd\",\"author\":\"admin\",\"banner\":\"assets/banner/img.png\",\"tags\":[\"tag1\",\"tag2\"],\"planRole\":\"free\",\"viewsCount\":1,\"likeCount\":0,\"commentCount\":0,\"creationDate\":\"2025-12-15T20:00:27.565Z\"},{\"title\":\"crtyvg fghj\",\"slug\":\"crtyvg-fghj\",\"author\":\"admin\",\"banner\":\"assets/banner/img.png\",\"tags\":[\"tag1\",\"tag2\"],\"planRole\":\"free\",\"viewsCount\":9,\"likeCount\":0,\"commentCount\":0,\"creationDate\":\"2025-12-15T20:00:27.565Z\"}],\"pagination\":{\"total\":2,\"pages\":1,\"currentPage\":1,\"limit\":2,\"hasNext\":false,\"hasPrev\":false}}");

        const result = await GetAllArticles('1', '2');
        expect(result).toEqual(
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
        );

        expect(allArticles).not.toHaveBeenCalledWith(0, 2);
        expect(client.get).toHaveBeenCalledWith('articles:page:1:limit:2');
    });

    test('Return error when articles not found', async () => {
        allArticles.mockResolvedValue([]);
        countArticles.mockResolvedValue(0);
        client.get.mockResolvedValue(undefined);

        await expect(GetAllArticles('1', '2')).rejects.toThrow('Articles not found');
        expect(allArticles).toHaveBeenCalledWith(0, 2);
        expect(countArticles).toHaveBeenCalledWith();
    });
});

describe('Article Service Tests - loadArticleBySlug', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Return article and comments by slug', async () => {
        findArticleBySlug.mockResolvedValue(
            {
                title: 'crtyvg fghjd',
                author: 'admin',
                banner: 'assets/banner/img.png',
                content: 'Content',
                tags: ['tag1', 'tag2'],
                planRole: 'free',
                likeCount: 0,
                creationDate: '2025-12-15T20:00:27.565Z'
            }
        );
        getCommentsBySlug.mockResolvedValue([
            {
                userName: 'test',
                post: 'test',
                creationDate: '2025-12-15T20:00:27.565Z'
            },
            {
                userName: 'test1',
                post: 'test1',
                creationDate: '2025-12-15T20:00:27.565Z'
            }
        ]);
        incrementArticleViews.mockResolvedValue({
            modifiedCount: 1 
        });

        const result = await LoadArticleBySlug('crtyvg-fghjd');
        expect(result).toEqual(
            {
                article: {
                    title: 'crtyvg fghjd',
                    author: 'admin',
                    banner: 'assets/banner/img.png',
                    content: 'Content',
                    tags: ['tag1', 'tag2'],
                    planRole: 'free',
                    likeCount: 0,
                    creationDate: '2025-12-15T20:00:27.565Z'
                },
                comment: [
                    {
                        userName: 'test',
                        post: 'test',
                        creationDate: '2025-12-15T20:00:27.565Z'
                    },
                    {
                        userName: 'test1',
                        post: 'test1',
                        creationDate: '2025-12-15T20:00:27.565Z'
                    }
                ]
            }
        );
        expect(findArticleBySlug).toHaveBeenCalledWith('crtyvg-fghjd');
        expect(getCommentsBySlug).toHaveBeenCalledWith('crtyvg-fghjd');
        expect(incrementArticleViews).toHaveBeenCalledWith('crtyvg-fghjd');
    });

    test('Return error when article not found by slug', async () => {
        findArticleBySlug.mockResolvedValue(undefined);
        getCommentsBySlug.mockResolvedValue([]);

        await expect(LoadArticleBySlug('article-slug')).rejects.toThrow('Article not found');
        expect(findArticleBySlug).toHaveBeenCalledWith('article-slug');
        expect(getCommentsBySlug).toHaveBeenCalledWith('article-slug');
        expect(incrementArticleViews).toHaveBeenCalledTimes(0);
    });
});

describe('Article Service Tests - findArticlesBytag', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Return articles by tag from MongoDB', async () => {
        findArticlesByTag.mockResolvedValue([
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
                tags: ['tag1', 'tag3'],
                planRole: 'free',
                viewsCount: 9,
                likeCount: 0,
                commentCount: 0,
                creationDate: '2025-12-15T20:00:27.565Z'
            }
        ]);
        countArticlesByTag.mockResolvedValue(2);

        const result = await FindArticlesByTag('tag3', '1', '2');
        expect(result).toEqual({
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
                    tags: ['tag1', 'tag3'],
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
        });
        expect(findArticlesByTag).toHaveBeenCalledWith('tag3', 0, 2);
        expect(countArticlesByTag).toHaveBeenCalledWith('tag3');
    });

    test('Return error when articles not found by tag', async () => {
        findArticlesByTag.mockResolvedValue([]);
        countArticlesByTag.mockResolvedValue(0);

        await expect(FindArticlesByTag('tag', '1', '2')).rejects.toThrow('Articles not found');
        expect(findArticlesByTag).toHaveBeenCalledWith('tag', 0, 2);
        expect(countArticlesByTag).toHaveBeenCalledWith('tag')
    });
});

describe('Article Service Tests - SearchForArticles', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Return articles by serach query from MongoDB', async () => {
        searchArticles.mockResolvedValue([
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
                tags: ['tag1', 'tag3'],
                planRole: 'free',
                viewsCount: 9,
                likeCount: 0,
                commentCount: 0,
                creationDate: '2025-12-15T20:00:27.565Z'
            }
        ]);
        searchArticlesCount.mockResolvedValue(2);

        const result = await SearchForArticles('crt', '1', '2');
        expect(result).toEqual({
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
                    tags: ['tag1', 'tag3'],
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
        });
        expect(searchArticles).toHaveBeenCalledWith('crt', 0, 2);
        expect(searchArticlesCount).toHaveBeenCalledWith('crt')
    });

    test('Return error when articles not found by serach query', async () => {
        searchArticles.mockResolvedValue([]);
        searchArticlesCount.mockResolvedValue(0);

        await expect(SearchForArticles('crt', '1', '2')).rejects.toThrow('Articles not found');
        expect(searchArticles).toHaveBeenCalledWith('crt', 0, 2);
        expect(searchArticlesCount).toHaveBeenCalledWith('crt');
    })
})