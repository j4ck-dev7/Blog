import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/config/logger.js', () => ({
    logger: { debug: jest.fn(), error: jest.fn(), warn: jest.fn() }
}));

const { updateCounterService } = await import('../../src/utils/updateConterService.js');
const { logger } = await import('../../src/config/logger.js');

describe('updateCounterService utility function', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully update counter when result has modifiedCount > 0', async () => {
        const slug = 'test-article';
        const mockResult = { modifiedCount: 1, acknowledged: true };
        const counterFn = jest.fn().mockResolvedValue(mockResult);

        const result = await updateCounterService(slug, counterFn);

        expect(counterFn).toHaveBeenCalledWith(slug);
        expect(result).toEqual(mockResult);
        expect(logger.debug).toHaveBeenCalledWith('updateCounterService called', { slug });
    });

    test('should throw error when slug is not provided', async () => {
        const counterFn = jest.fn();

        await expect(updateCounterService(null, counterFn)).rejects.toThrow('Invalid slug');
        await expect(updateCounterService('', counterFn)).rejects.toThrow('Invalid slug');
        await expect(updateCounterService(undefined, counterFn)).rejects.toThrow('Invalid slug');
    });

    test('should throw error when counterFn returns null', async () => {
        const slug = 'test-article';
        const counterFn = jest.fn().mockResolvedValue(null);

        await expect(updateCounterService(slug, counterFn)).rejects.toThrow('Update operation failed');
        expect(logger.error).toHaveBeenCalledWith(
            'updateCounterService: no result returned',
            { slug }
        );
    });

    test('should throw error when counterFn returns undefined', async () => {
        const slug = 'test-article';
        const counterFn = jest.fn().mockResolvedValue(undefined);

        await expect(updateCounterService(slug, counterFn)).rejects.toThrow('Update operation failed');
    });

    test('should throw error when acknowledged is false', async () => {
        const slug = 'test-article';
        const mockResult = { acknowledged: false };
        const counterFn = jest.fn().mockResolvedValue(mockResult);

        await expect(updateCounterService(slug, counterFn)).rejects.toThrow('Update operation failed');
        expect(logger.error).toHaveBeenCalledWith(
            'updateCounterService: update not acknowledged',
            { slug, res: mockResult }
        );
    });

    test('should warn when modifiedCount is 0', async () => {
        const slug = 'test-article';
        const mockResult = { modifiedCount: 0, acknowledged: true };
        const counterFn = jest.fn().mockResolvedValue(mockResult);

        const result = await updateCounterService(slug, counterFn);

        expect(logger.warn).toHaveBeenCalledWith(
            'updateCounterService: no documents modified',
            { slug }
        );
        expect(result).toEqual(mockResult);
    });

    test('should propagate counterFn errors', async () => {
        const slug = 'test-article';
        const testError = new Error('Database connection failed');
        const counterFn = jest.fn().mockRejectedValue(testError);

        await expect(updateCounterService(slug, counterFn)).rejects.toThrow('Database connection failed');
        expect(logger.error).toHaveBeenCalledWith(
            'updateCounterService error',
            { err: testError, slug }
        );
    });

    test('should handle result without acknowledged property', async () => {
        const slug = 'test-article';
        const mockResult = { modifiedCount: 1 }; // sem acknowledged
        const counterFn = jest.fn().mockResolvedValue(mockResult);

        const result = await updateCounterService(slug, counterFn);

        expect(result).toEqual(mockResult);
    });
});
