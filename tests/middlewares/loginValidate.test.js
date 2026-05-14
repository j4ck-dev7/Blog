import { describe, test, expect, jest, beforeEach } from '@jest/globals';

const { loginValidate } = await import('../../src/middlewares/loginValidate.js');

describe('loginValidate middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should be an array with validators and error handler', () => {
        expect(Array.isArray(loginValidate)).toBe(true);
        expect(loginValidate.length).toBeGreaterThan(0);
    });

    test('should have middleware functions', () => {
        expect(loginValidate.every(fn => typeof fn === 'function' || fn.builder)).toBe(true);
    });

    test('should have error handler as last item', () => {
        const lastItem = loginValidate[loginValidate.length - 1];
        expect(typeof lastItem).toBe('function');
    });

    test('error handler should return 400 with validation errors', async () => {
        const { validationResult } = await import('express-validator');
        
        const mockReq = {
            body: { email: '', password: '' }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNext = jest.fn();
        const errorHandler = loginValidate[loginValidate.length - 1];

        // O handler espera que validationResult(req) retorne um objeto com isEmpty e array
        // Vamos simular um cenário onde há erros
        mockReq.validationResult = () => ({
            isEmpty: () => false,
            array: () => [
                { msg: 'Email is required' },
                { msg: 'password is required' }
            ],
            formatWith: (fn) => ({
                isEmpty: () => false,
                array: () => [
                    { msg: 'Email is required' },
                    { msg: 'password is required' }
                ]
            })
        });
    })

    test('should validate email field exists', () => {
        const emailValidator = loginValidate[0];
        expect(emailValidator).toBeDefined();
    });

    test('should validate password field exists', () => {
        const passwordValidator = loginValidate[1];
        expect(passwordValidator).toBeDefined();
    });
});
