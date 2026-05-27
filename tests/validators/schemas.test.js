import { describe, test, expect } from '@jest/globals';
import { signInSchema, signInErrorMap } from '../../src/validators/signIn.validation.js';
import { signUpSchema, signUpErrorMap } from '../../src/validators/signUp.validation.js';
import { commentSchema, commentErrorMap } from '../../src/validators/comment.validation.js';

describe('Validator schemas', () => {
    describe('signInSchema', () => {
        test('accepts valid credentials', () => {
            const { error } = signInSchema.validate({ email: 'user@example.com', password: 'Aa1$aaaa' });
            expect(error).toBeUndefined();
        });

        test('rejects invalid email', () => {
            const { error } = signInSchema.validate({ email: 'invalid-email', password: 'Aa1$aaaa' });
            expect(error).toBeDefined();
            expect(error.details[0].type).toBe('string.email');
        });

        test('rejects weak password', () => {
            const { error } = signInSchema.validate({ email: 'user@example.com', password: 'password' });
            expect(error).toBeDefined();
            expect(error.details[0].type).toBe('string.pattern.base');
        });
    });

    describe('signUpSchema', () => {
        test('accepts valid registration data', () => {
            const { error } = signUpSchema.validate({
                name: 'Usuário Teste',
                email: 'usuario@example.com',
                password: 'Teste123$'
            });
            expect(error).toBeUndefined();
        });

        test('rejects short name', () => {
            const { error } = signUpSchema.validate({
                name: 'Al',
                email: 'usuario@example.com',
                password: 'Teste123$'
            });
            expect(error).toBeDefined();
            expect(error.details[0].type).toBe('string.min');
        });

        test('rejects invalid email', () => {
            const { error } = signUpSchema.validate({
                name: 'Usuário Teste',
                email: 'invalid-email',
                password: 'Teste123$'
            });
            expect(error).toBeDefined();
            expect(error.details[0].type).toBe('string.email');
        });
    });

    describe('commentSchema', () => {
        test('accepts valid comment', () => {
            const { error } = commentSchema.validate({ post: 'Este é um comentário válido.' });
            expect(error).toBeUndefined();
        });

        test('rejects empty comment', () => {
            const { error } = commentSchema.validate({ post: '' });
            expect(error).toBeDefined();
            expect(error.details[0].type).toBe('string.empty');
        });

        test('rejects too long comment', () => {
            const longComment = 'a'.repeat(2001);
            const { error } = commentSchema.validate({ post: longComment });
            expect(error).toBeDefined();
            expect(error.details[0].type).toBe('string.max');
        });
    });
});
