import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/config/logger.js', () => ({
    logger: { info: jest.fn(), warn: jest.fn() }
}));

jest.unstable_mockModule('../../src/config/requestMeta.js', () => ({
    getRequestMeta: jest.fn().mockImplementation((req, extra) => ({ ip: req?.ip || '127.0.0.1', route: req?.originalUrl || req?.url || '/', method: req?.method || 'GET', ...extra }))
}));

const { loggerMiddleware } = await import('../../src/middlewares/loggerMiddleware.js');
const { logger } = await import('../../src/config/logger.js');
const { getRequestMeta } = await import('../../src/config/requestMeta.js');

describe('loggerMiddleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('logs info and calls original send when statusCode < 400', () => {
        const originalSend = jest.fn().mockImplementation(function(data) { return data; });
        const req = { method: 'GET', originalUrl: '/' };
        const res = { statusCode: 200, send: originalSend };
        const next = jest.fn();

        loggerMiddleware(req, res, next);

        // call the replaced send
        const result = res.send('ok');

        expect(result).toBe('ok');
        expect(logger.info).toHaveBeenCalled();
        expect(logger.warn).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
    });

    test('logs info and warn when statusCode >= 400', () => {
        const originalSend = jest.fn().mockImplementation(function(data) { return data; });
        const req = { method: 'POST', originalUrl: '/x' };
        const res = { statusCode: 500, send: originalSend };
        const next = jest.fn();

        loggerMiddleware(req, res, next);

        const body = { error: 'fail' };
        const result = res.send(body);

        expect(result).toBe(body);
        expect(logger.info).toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
    });
});
