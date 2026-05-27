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
    decrementArticleCommentCount: jest.fn(),
    articleExistsBySlug: jest.fn()
}))

jest.unstable_mockModule('../../src/repositories/userRepository.js', () => ({
    findUserById: jest.fn()
}))

jest.unstable_mockModule('../../src/config/logger.js', () => ({
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }
}));

const { addComment, editComment, removeComment, verifyComment } = await import('../../src/repositories/commentRepository.js');
const { incrementArticleCommentCount, decrementArticleCommentCount, articleExistsBySlug } = await import('../../src/repositories/articleRepository.js')
const { findUserById } = await import('../../src/repositories/userRepository.js');
const { createComment, updateComment, deleteComment } = await import('../../src/services/commentService.js');

describe('Comment Service Test', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    test('Return comment created', async () => {
        const validUserId = 'ckzj0qwz80000jg63c3glyb1h';
        findUserById.mockResolvedValue({ success: true, data: { user: { id: validUserId, name: 'teste' } } });
        articleExistsBySlug.mockResolvedValue({ success: true, data: { article: { id: 'article-1' } } });
        addComment.mockResolvedValue({
            success: true,
            data: {
                comment: {
                    id: 'ckzj0qwz80000jg63c3glyb1i',
                    articleSlug: 'article-test',
                    post: 'comment',
                    userName: 'teste',
                    userId: validUserId,
                    creationDate: 1234567890
                }
            }
        });
        incrementArticleCommentCount.mockResolvedValue({
            modifiedCount: 1 
        });

        const result = await createComment({ comment: 'comment', userId: validUserId, articleSlug: 'article-test' });

        expect(findUserById).toHaveBeenCalledWith(validUserId);
        expect(articleExistsBySlug).toHaveBeenCalledWith('article-test');
        expect(addComment).toHaveBeenCalledWith('comment', validUserId, 'teste', 'article-test');
        expect(incrementArticleCommentCount).toHaveBeenCalledWith('article-test');
        expect(result).toEqual({
            success: true,
            data: {
                comment: {
                    id: 'ckzj0qwz80000jg63c3glyb1i',
                    articleSlug: 'article-test',
                    post: 'comment',
                    userName: 'teste',
                    userId: validUserId,
                    creationDate: 1234567890
                }
            }
        })
    });

    test('Return error when comment not found | exists', async () => {
        const validCommentId = 'ckzj0qwz80000jg63c3glyb1i';
        const validUserId = 'ckzj0qwz80000jg63c3glyb1h';

        verifyComment.mockResolvedValue({ success: true, data: { comment: null } });

        await expect(
            updateComment({ commentId: validCommentId, commentEdit: 'comment', userId: validUserId })
        ).rejects.toThrow('Comment not found');
    });

    test('Return comment edited', async () => {
        const validCommentId = 'ckzj0qwz80000jg63c3glyb1i';
        const validUserId = 'ckzj0qwz80000jg63c3glyb1h';

        verifyComment.mockResolvedValue({
            success: true,
            data: {
                comment: {
                    id: validCommentId,
                    userId: validUserId,
                    articleSlug: 'article-test'
                }
            }
        });
        editComment.mockResolvedValue({
            id: validCommentId,
            articleSlug: 'article-test',
            post: 'commentEdit',
            userName: 'test',
            userId: validUserId,
            creationDate: 1234567890
        });

        const result = await updateComment({ commentId: validCommentId, commentEdit: 'commentEdit', userId: validUserId });

        expect(verifyComment).toHaveBeenCalledWith({ commentId: validCommentId });
        expect(editComment).toHaveBeenCalledWith(validCommentId, 'commentEdit')
        expect(result).toEqual({
            id: validCommentId,
            articleSlug: 'article-test',
            post: 'commentEdit',
            userName: 'test',
            userId: validUserId,
            creationDate: 1234567890
        })
    });

    test('Return error when comment not found | exists', async () => {
        const validCommentId = 'ckzj0qwz80000jg63c3glyb1i';
        const validUserId = 'ckzj0qwz80000jg63c3glyb1h';

        verifyComment.mockResolvedValue({ success: true, data: { comment: null } });

        await expect(
            deleteComment({ commentId: validCommentId, userId: validUserId })
        ).rejects.toThrow('Comment or user not found');
    });

    test('Return comment deleted', async () => {
        const validCommentId = 'ckzj0qwz80000jg63c3glyb1i';
        const validUserId = 'ckzj0qwz80000jg63c3glyb1h';

        verifyComment.mockResolvedValue({
            success: true,
            data: {
                comment: {
                    id: validCommentId,
                    userId: validUserId,
                    articleSlug: 'article-test'
                }
            }
        });
        decrementArticleCommentCount.mockResolvedValue({
            modifiedCount: 1 
        })
        removeComment.mockResolvedValue({
            success: true,
            data: {
                comment: {
                    id: validCommentId,
                    articleSlug: 'article-test',
                    post: 'commentEdit',
                    userName: 'test',
                    userId: validUserId,
                    creationDate: 1234567890
                }
            }
        });

        const result = await deleteComment({ commentId: validCommentId, userId: validUserId });

        expect(verifyComment).toHaveBeenCalledWith({ commentId: validCommentId });
        expect(decrementArticleCommentCount).toHaveBeenCalledWith('article-test');
        expect(removeComment).toHaveBeenCalledWith(validCommentId);
        expect(result).toEqual({
            success: true,
            data: {
                comment: {
                    id: validCommentId,
                    articleSlug: 'article-test',
                    post: 'commentEdit',
                    userName: 'test',
                    userId: validUserId,
                    creationDate: 1234567890
                }
            }
        })
    })
})