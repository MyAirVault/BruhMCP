/**
 * Password Utilities Tests
 * Tests for password hashing, verification, and validation functionality
 */

// Mock dependencies first
jest.mock('bcryptjs');
jest.mock('../../src/config/env', () => ({
    BCRYPT_ROUNDS: 10
}));

const bcrypt = require('bcryptjs');
const {
    hashPassword,
    verifyPassword,
    validatePasswordStrength,
    generateRandomPassword
} = require('../../src/utils/password');

// Create mocked functions
const mockHashFn = jest.fn();
const mockCompareFn = jest.fn();

// Assign mocked functions to bcrypt
bcrypt.hash = mockHashFn;
bcrypt.compare = mockCompareFn;


describe('Password Utilities', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockHashFn.mockReset();
        mockCompareFn.mockReset();
        console.log = jest.fn();
        console.error = jest.fn();
        console.debug = jest.fn();
    });

    describe('hashPassword', () => {
        describe('Success Cases', () => {
            it('should hash password successfully', async () => {
                // Arrange
                const password = 'testPassword123!';
                const expectedHash = '$2b$10$mock.hash.value';
                mockHashFn.mockResolvedValue(expectedHash);

                // Act
                const result = await hashPassword(password);

                // Assert
                expect(mockHashFn).toHaveBeenCalledWith(password, 10);
                expect(result).toBe(expectedHash);
                expect(console.debug).toHaveBeenCalledWith('Password hashing process completed');
            });

            it('should handle minimum length password', async () => {
                // Arrange
                const password = 'testPass'; // 8 characters
                const expectedHash = '$2b$10$mock.hash.value';
                mockHashFn.mockResolvedValue(expectedHash);

                // Act
                const result = await hashPassword(password);

                // Assert
                expect(mockHashFn).toHaveBeenCalledWith(password, 10);
                expect(result).toBe(expectedHash);
            });
        });

        describe('Validation Failures', () => {
            it('should reject empty password', async () => {
                // Act & Assert
                await expect(hashPassword('')).rejects.toThrow('Invalid password provided');
                await expect(hashPassword(null)).rejects.toThrow('Invalid password provided');
                await expect(hashPassword(undefined)).rejects.toThrow('Invalid password provided');
            });

            it('should reject non-string password', async () => {
                // Act & Assert
                await expect(hashPassword(123)).rejects.toThrow('Invalid password provided');
                await expect(hashPassword({})).rejects.toThrow('Invalid password provided');
                await expect(hashPassword([])).rejects.toThrow('Invalid password provided');
            });

            it('should reject password shorter than 8 characters', async () => {
                // Act & Assert
                await expect(hashPassword('short')).rejects.toThrow('Password must be at least 8 characters long');
                await expect(hashPassword('1234567')).rejects.toThrow('Password must be at least 8 characters long');
            });
        });

        describe('Error Handling', () => {
            it('should handle bcrypt hashing errors', async () => {
                // Arrange
                const password = 'testPassword123!';
                const bcryptError = new Error('Bcrypt hashing failed');
                mockHashFn.mockRejectedValue(bcryptError);

                // Act & Assert
                await expect(hashPassword(password)).rejects.toThrow('Bcrypt hashing failed');
                expect(console.error).toHaveBeenCalledWith('Password hashing failed:', 'Bcrypt hashing failed');
            });

            it('should handle non-Error exceptions', async () => {
                // Arrange
                const password = 'testPassword123!';
                const stringError = 'String error';
                mockHashFn.mockRejectedValue(stringError);

                // Act & Assert
                try {
                    await hashPassword(password);
                    fail('Expected hashPassword to throw');
                } catch (error) {
                    expect(error).toBe(stringError);
                }
                expect(console.error).toHaveBeenCalledWith('Password hashing failed:', 'String error');
            });
        });
    });

    describe('verifyPassword', () => {
        describe('Success Cases', () => {
            it('should verify correct password successfully', async () => {
                // Arrange
                const password = 'testPassword123!';
                const hash = '$2b$10$mock.hash.value';
                mockCompareFn.mockResolvedValue(true);

                // Act
                const result = await verifyPassword(password, hash);

                // Assert
                expect(mockCompareFn).toHaveBeenCalledWith(password, hash);
                expect(result).toBe(true);
                expect(console.debug).toHaveBeenCalledWith('Password verification process completed');
            });

            it('should return false for incorrect password', async () => {
                // Arrange
                const password = 'wrongPassword';
                const hash = '$2b$10$mock.hash.value';
                mockCompareFn.mockResolvedValue(false);

                // Act
                const result = await verifyPassword(password, hash);

                // Assert
                expect(mockCompareFn).toHaveBeenCalledWith(password, hash);
                expect(result).toBe(false);
            });
        });

        describe('Validation Failures', () => {
            it('should reject invalid password', async () => {
                // Act & Assert
                await expect(verifyPassword('', 'hash')).rejects.toThrow('Invalid password provided');
                await expect(verifyPassword(null, 'hash')).rejects.toThrow('Invalid password provided');
                await expect(verifyPassword(123, 'hash')).rejects.toThrow('Invalid password provided');
            });

            it('should reject invalid hash', async () => {
                // Act & Assert
                await expect(verifyPassword('password', '')).rejects.toThrow('Invalid hash provided');
                await expect(verifyPassword('password', null)).rejects.toThrow('Invalid hash provided');
                await expect(verifyPassword('password', 123)).rejects.toThrow('Invalid hash provided');
            });
        });

        describe('Error Handling', () => {
            it('should handle bcrypt comparison errors', async () => {
                // Arrange
                const password = 'testPassword123!';
                const hash = '$2b$10$mock.hash.value';
                const bcryptError = new Error('Bcrypt comparison failed');
                mockCompareFn.mockRejectedValue(bcryptError);

                // Act & Assert
                await expect(verifyPassword(password, hash)).rejects.toThrow('Bcrypt comparison failed');
                expect(console.error).toHaveBeenCalledWith('Password verification failed:', 'Bcrypt comparison failed');
            });
        });
    });

    describe('validatePasswordStrength', () => {
        describe('Success Cases', () => {
            it('should validate strong password', () => {
                // Arrange
                const strongPassword = 'MyStr0ng!Password';

                // Act
                const result = validatePasswordStrength(strongPassword);

                // Assert
                expect(result.isValid).toBe(true);
                expect(result.errors).toHaveLength(0);
                expect(console.debug).toHaveBeenCalledWith('Password validation process completed');
            });

            it('should validate password with all requirements', () => {
                // Arrange
                const validPassword = 'Test123!@#';

                // Act
                const result = validatePasswordStrength(validPassword);

                // Assert
                expect(result.isValid).toBe(true);
                expect(result.errors).toHaveLength(0);
            });
        });

        describe('Validation Failures', () => {
            it('should reject password without lowercase letter', () => {
                // Arrange
                const password = 'TEST123!@#';

                // Act
                const result = validatePasswordStrength(password);

                // Assert
                expect(result.isValid).toBe(false);
                expect(result.errors).toContain('Password must contain at least one lowercase letter');
            });

            it('should reject password without uppercase letter', () => {
                // Arrange
                const password = 'test123!@#';

                // Act
                const result = validatePasswordStrength(password);

                // Assert
                expect(result.isValid).toBe(false);
                expect(result.errors).toContain('Password must contain at least one uppercase letter');
            });

            it('should reject password without numbers', () => {
                // Arrange
                const password = 'TestPassword!@#';

                // Act
                const result = validatePasswordStrength(password);

                // Assert
                expect(result.isValid).toBe(false);
                expect(result.errors).toContain('Password must contain at least one number');
            });

            it('should reject password without special characters', () => {
                // Arrange
                const password = 'TestPassword123';

                // Act
                const result = validatePasswordStrength(password);

                // Assert
                expect(result.isValid).toBe(false);
                expect(result.errors).toContain('Password must contain at least one special character');
            });

            it('should reject password shorter than 8 characters', () => {
                // Arrange
                const password = 'Test1!';

                // Act
                const result = validatePasswordStrength(password);

                // Assert
                expect(result.isValid).toBe(false);
                expect(result.errors).toContain('Password must be at least 8 characters long');
            });

            it('should reject password longer than 128 characters', () => {
                // Arrange
                const password = 'A'.repeat(129); // 129 characters - all uppercase, no numbers, no special chars

                // Act
                const result = validatePasswordStrength(password);

                // Assert
                expect(result.isValid).toBe(false);
                expect(result.errors).toContain('Password must be less than 128 characters long');
            });

            it('should reject common weak passwords', () => {
                // Arrange
                const commonPasswords = ['password', '123456', 'qwerty', 'password123'];

                commonPasswords.forEach(password => {
                    // Act
                    const result = validatePasswordStrength(password);

                    // Assert
                    expect(result.isValid).toBe(false);
                    expect(result.errors).toContain('Password is too common and easily guessable');
                });
            });

            it('should reject case-insensitive common passwords', () => {
                // Arrange
                const password = 'PASSWORD';

                // Act
                const result = validatePasswordStrength(password);

                // Assert
                expect(result.isValid).toBe(false);
                expect(result.errors).toContain('Password is too common and easily guessable');
            });

            it('should accumulate multiple validation errors', () => {
                // Arrange
                const weakPassword = '123'; // Too short, no letters, no special chars

                // Act
                const result = validatePasswordStrength(weakPassword);

                // Assert
                expect(result.isValid).toBe(false);
                expect(result.errors).toContain('Password must be at least 8 characters long');
                expect(result.errors).toContain('Password must contain at least one lowercase letter');
                expect(result.errors).toContain('Password must contain at least one uppercase letter');
                expect(result.errors).toContain('Password must contain at least one special character');
            });
        });

        describe('Input Validation', () => {
            it('should handle null/undefined password', () => {
                // Act
                const result1 = validatePasswordStrength(null);
                const result2 = validatePasswordStrength(undefined);

                // Assert
                expect(result1.isValid).toBe(false);
                expect(result1.errors).toContain('Password is required');
                expect(result2.isValid).toBe(false);
                expect(result2.errors).toContain('Password is required');
            });

            it('should handle non-string password', () => {
                // Act
                const result = validatePasswordStrength(123);

                // Assert
                expect(result.isValid).toBe(false);
                expect(result.errors).toContain('Password is required');
            });
        });

        describe('Error Handling', () => {
            it('should handle validation errors gracefully', () => {
                // This test verifies that the function doesn't crash even if internal errors occur
                // The function is designed to return validation errors rather than throw exceptions
                // So we test it returns proper validation errors for a weak password
                const result = validatePasswordStrength('test');

                // Assert - Should return validation errors, not crash
                expect(result.isValid).toBe(false);
                expect(result.errors.length).toBeGreaterThan(0);
                expect(result.errors).toContain('Password must be at least 8 characters long');
                expect(console.debug).toHaveBeenCalledWith('Password validation process completed');
            });
        });
    });

    describe('generateRandomPassword', () => {
        describe('Success Cases', () => {
            it('should generate password with default length', () => {
                // Act
                const password = generateRandomPassword();

                // Assert
                expect(password).toBeDefined();
                expect(password.length).toBe(12);
                expect(typeof password).toBe('string');
                expect(console.debug).toHaveBeenCalledWith('Random password generation process completed');
            });

            it('should generate password with custom length', () => {
                // Arrange
                const customLength = 16;

                // Act
                const password = generateRandomPassword(customLength);

                // Assert
                expect(password.length).toBe(customLength);
            });

            it('should generate password meeting strength requirements', () => {
                // Act
                const password = generateRandomPassword(12);

                // Assert - Validate the generated password meets requirements
                const validation = validatePasswordStrength(password);
                expect(validation.isValid).toBe(true);
            });

            it('should generate different passwords on multiple calls', () => {
                // Act
                const password1 = generateRandomPassword(12);
                const password2 = generateRandomPassword(12);

                // Assert
                expect(password1).not.toBe(password2);
            });

            it('should handle minimum length', () => {
                // Act
                const password = generateRandomPassword(8);

                // Assert
                expect(password.length).toBe(8);
            });

            it('should handle maximum length', () => {
                // Act
                const password = generateRandomPassword(128);

                // Assert
                expect(password.length).toBe(128);
            });
        });

        describe('Validation Failures', () => {
            it('should reject length shorter than 8', () => {
                // Act & Assert
                expect(() => generateRandomPassword(7)).toThrow('Password length must be between 8 and 128 characters');
                expect(() => generateRandomPassword(0)).toThrow('Password length must be between 8 and 128 characters');
                expect(() => generateRandomPassword(-1)).toThrow('Password length must be between 8 and 128 characters');
            });

            it('should reject length longer than 128', () => {
                // Act & Assert
                expect(() => generateRandomPassword(129)).toThrow('Password length must be between 8 and 128 characters');
                expect(() => generateRandomPassword(200)).toThrow('Password length must be between 8 and 128 characters');
            });
        });

        describe('Password Composition', () => {
            it('should contain at least one character from each category', () => {
                // Act
                const password = generateRandomPassword(12);

                // Assert
                expect(/[a-z]/.test(password)).toBe(true); // lowercase
                expect(/[A-Z]/.test(password)).toBe(true); // uppercase  
                expect(/[0-9]/.test(password)).toBe(true); // numbers
                expect(/[!@#$%^&*(),.?":{}|<>]/.test(password)).toBe(true); // special chars
            });

            it('should shuffle characters to avoid predictable patterns', () => {
                // This is hard to test directly, but we can check that the first 4 characters
                // are not always the same pattern (lower, upper, number, special)
                const passwords = [];
                for (let i = 0; i < 10; i++) {
                    passwords.push(generateRandomPassword(12));
                }

                // Check that we have variety in the first characters
                const firstChars = passwords.map(p => p[0]);
                const uniqueFirstChars = new Set(firstChars);
                
                // Should have some variety (not all the same)
                expect(uniqueFirstChars.size).toBeGreaterThan(1);
            });
        });

        describe('Error Handling', () => {
            it('should handle Math.random errors gracefully', () => {
                // Arrange - Mock Math.random to throw
                const originalMathRandom = Math.random;
                Math.random = jest.fn(() => {
                    throw new Error('Math.random failed');
                });

                // Act & Assert
                expect(() => generateRandomPassword(12)).toThrow('Math.random failed');
                expect(console.error).toHaveBeenCalledWith('Random password generation failed:', 'Math.random failed');

                // Cleanup
                Math.random = originalMathRandom;
            });

            it('should handle non-Error exceptions', () => {
                // Arrange
                const originalMathRandom = Math.random;
                Math.random = jest.fn(() => {
                    throw 'String error';
                });

                // Act & Assert
                expect(() => generateRandomPassword(12)).toThrow('String error');
                expect(console.error).toHaveBeenCalledWith('Random password generation failed:', 'String error');

                // Cleanup
                Math.random = originalMathRandom;
            });
        });
    });

    describe('Edge Cases and Integration', () => {
        it('should work with generated passwords in hash/verify cycle', async () => {
            // Arrange
            const generatedPassword = generateRandomPassword(16);
            const expectedHash = '$2b$10$mock.hash.for.generated.password';
            mockHashFn.mockResolvedValue(expectedHash);
            mockCompareFn.mockResolvedValue(true);

            // Act
            const hash = await hashPassword(generatedPassword);
            const isValid = await verifyPassword(generatedPassword, hash);

            // Assert
            expect(hash).toBe(expectedHash);
            expect(isValid).toBe(true);
        });

        it('should validate generated passwords as strong', () => {
            // Act
            const password = generateRandomPassword(20);
            const validation = validatePasswordStrength(password);

            // Assert
            expect(validation.isValid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });
    });
});