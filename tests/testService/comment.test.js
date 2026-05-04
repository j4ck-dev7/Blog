import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/repositories/commentRepository.js', () => ({
    getCommentsBySlug: jest.fn(),
    addComment: jest.fn(),
    editComment: jest.fn(),
    removeComment: jest.fn(),
    verifyComment: jest.fn()
}));

jest.unstable_mockModule('../../src/repositories/articleRepository.js', () => ({
    incrementArticleCommentCount: jest.fn(),
    decrementArticleCommentCount: jest.fn()
}))

jest.unstable_mockModule('../../src/config/logger.js', () => ({
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }
}));

const { addComment, editComment, removeComment, verifyComment } = await import('../../src/repositories/commentRepository.js');
const { incrementArticleCommentCount, decrementArticleCommentCount } = await import('../../src/repositories/articleRepository.js')
const { createComment, updateComment, deleteComment } = await import('../../src/services/commentService.js');

describe('Comment Service Test', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    test('Return comment created', async () => {
        addComment.mockResolvedValue({
            id: '1',
            articleSlug: 'article-test',
            post: 'comment',
            userName: 'test',
            userId: '1',
            creationDate: 1234567890
        });
        incrementArticleCommentCount.mockResolvedValue({
            modifiedCount: 1 
        });

        const result = await createComment('comment', '1', 'teste', 'article-test');

        expect(addComment).toHaveBeenCalledWith('comment', '1', 'teste', 'article-test');
        expect(incrementArticleCommentCount).toHaveBeenCalledWith('article-test');
        expect(result).toEqual({
            id: '1',
            articleSlug: 'article-test',
            post: 'comment',
            userName: 'test',
            userId: '1',
            creationDate: 1234567890
        })
    });

    test('Return error when comment not found | exists', async () => {
        verifyComment.mockResolvedValue(undefined);

        await expect(
            updateComment('1', 'comment')
        ).rejects.toThrow('Comment not found');
    });

    test('Return comment edited', async () => {
        verifyComment.mockResolvedValue({
            post: 'comment'
        })
        editComment.mockResolvedValue({
            id: '1',
            articleSlug: 'article-test',
            post: 'commentEdit',
            userName: 'test',
            userId: '1',
            creationDate: 1234567890
        });

        const result = await updateComment('1', 'commentEdit');

        expect(verifyComment).toHaveBeenCalledWith('1');
        expect(editComment).toHaveBeenCalledWith('1', 'commentEdit')
        expect(result).toEqual({
            id: '1',
            articleSlug: 'article-test',
            post: 'commentEdit',
            userName: 'test',
            userId: '1',
            creationDate: 1234567890
        })
    });

    test('Return error when comment not found | exists', async () => {
        verifyComment.mockResolvedValue(undefined);

        await expect(
            deleteComment('1', 'article-test')
        ).rejects.toThrow('Comment not found');
    });

    test('Return comment deleted', async () => {
        verifyComment.mockResolvedValue({
            post: 'comment'
        });
        decrementArticleCommentCount.mockResolvedValue({
            modifiedCount: 1 
        })
        removeComment.mockResolvedValue({
            id: '1',
            articleSlug: 'article-test',
            post: 'commentEdit',
            userName: 'test',
            userId: '1',
            creationDate: 1234567890
        });

        const result = await deleteComment('1', 'article-test');

        expect(verifyComment).toHaveBeenCalledWith('1');
        expect(decrementArticleCommentCount).toHaveBeenCalledWith('article-test');
        expect(removeComment).toHaveBeenCalledWith('1');
        expect(result).toEqual({
            id: '1',
            articleSlug: 'article-test',
            post: 'commentEdit',
            userName: 'test',
            userId: '1',
            creationDate: 1234567890
        })
    })
})