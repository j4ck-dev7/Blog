import { describe, test, expect, jest, beforeEach } from '@jest/globals';

jest.unstable_mockModule('@paralleldrive/cuid2', () => ({
    isCuid: jest.fn((id) => {
        // Mock básico: retorna true para strings que começam com 'c' e têm 24 caracteres
        return typeof id === 'string' && id.length === 24 && id.startsWith('c');
    })
}));

const { isValidCuid } = await import('../../src/utils/isValidCuid.js');

describe('isValidCuid utility function', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return true for valid CUID', () => {
        const validCuid = 'clfjyq87d0000qz8r8r8r8r8r';
        const result = isValidCuid(validCuid);
        expect(result).toBe(true);
    });

    test('should return false for invalid CUID format', () => {
        const invalidCuid = 'not-a-valid-cuid';
        const result = isValidCuid(invalidCuid);
        expect(result).toBe(false);
    });

    test('should return false for empty string', () => {
        const result = isValidCuid('');
        expect(result).toBe(false);
    });

    test('should return false for null', () => {
        const result = isValidCuid(null);
        expect(result).toBe(false);
    });

    test('should return false for undefined', () => {
        const result = isValidCuid(undefined);
        expect(result).toBe(false);
    });

    test('should return false for number', () => {
        const result = isValidCuid(123456);
        expect(result).toBe(false);
    });

    test('should return false for object', () => {
        const result = isValidCuid({ id: 'test' });
        expect(result).toBe(false);
    });

    test('should return false for array', () => {
        const result = isValidCuid(['c', 'u', 'i', 'd']);
        expect(result).toBe(false);
    });

    test('should return false for string that does not start with c', () => {
        const result = isValidCuid('aaaaaaaaaaaaaaaaaaaaaaaa');
        expect(result).toBe(false);
    });

    test('should return false for string with wrong length', () => {
        const result = isValidCuid('c123');
        expect(result).toBe(false);
    });
});
