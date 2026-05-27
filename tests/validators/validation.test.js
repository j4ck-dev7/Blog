import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('../../src/config/logger.js', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    }
}));

jest.unstable_mockModule('../../src/config/requestMeta.js', () => ({
    getRequestMeta: jest.fn().mockReturnValue({ ip: '127.0.0.1' })
}));

const { validate } = await import('../../src/middlewares/validation.js');
const { logger } = await import('../../src/config/logger.js');
const { getRequestMeta } = await import('../../src/config/requestMeta.js');

describe('validate middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('calls next when validation passes', () => {
        const schema = {
            validate: jest.fn().mockReturnValue({ error: undefined })
        };
        const errorMap = {};
        const req = { body: { email: 'user@example.com', password: 'Aa1$aaaa' }, ip: '127.0.0.1' };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        validate(schema, errorMap)(req, res, next);

        expect(schema.validate).toHaveBeenCalledWith(req.body, { abortEarly: true });
        expect(logger.info).toHaveBeenCalledWith('IP 127.0.0.1 passou na validação', { ip: '127.0.0.1' });
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    test('returns 400 and mapped message when validation fails with known error type', () => {
        const schema = {
            validate: jest.fn().mockReturnValue({
                error: {
                    details: [
                        { type: 'string.empty', context: { label: 'email' } }
                    ]
                }
            })
        };
        const errorMap = {
            'string.empty': {
                logMsg: c => `enviou ${c} vazio`, userMsg: 'Preencha os campos obrigatórios'
            }
        };
        const req = { body: { email: '' }, ip: '127.0.0.1' };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        validate(schema, errorMap)(req, res, next);

        expect(logger.warn).toHaveBeenCalledWith('IP 127.0.0.1 enviou email vazio', { ip: '127.0.0.1' });
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Preencha os campos obrigatórios' });
        expect(next).not.toHaveBeenCalled();
    });

    test('returns 400 and generic message when validation fails with unknown error type', () => {
        const schema = {
            validate: jest.fn().mockReturnValue({
                error: {
                    details: [
                        { type: 'any.unknown', context: { label: 'senha' } }
                    ]
                }
            })
        };
        const errorMap = {};
        const req = { body: { password: '123' }, ip: '127.0.0.1' };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        validate(schema, errorMap)(req, res, next);

        expect(logger.error).toHaveBeenCalledWith('Validação desconhecida [any.unknown] no campo "senha"', { ip: '127.0.0.1' });
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Erro de validação' });
        expect(next).not.toHaveBeenCalled();
    });
});
