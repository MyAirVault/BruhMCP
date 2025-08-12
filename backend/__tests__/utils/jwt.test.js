/**
 * JWT Utilities Tests
 * Tests for JWT token generation and verification functionality
 */

// Mock dependencies first
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn()
}));
jest.mock('../../src/db/queries/tokenQueries');
jest.mock('../../src/config/env', () => ({
    JWT_SECRET: 'test-jwt-secret-key-for-testing-purposes-only',
    JWT_REFRESH_SECRET: 'test-refresh-secret-key-for-testing-purposes-only'
}));

const jwt = require('jsonwebtoken');
const {
    generateAccessToken,
    generateRefreshToken,
    generatePasswordResetToken,
    verifyAccessToken,
    verifyRefreshToken,
    verifyPasswordResetToken,
    invalidateRefreshToken,
    invalidatePasswordResetToken
} = require('../../src/utils/jwt');

const { 
    storeRefreshToken, 
    storePasswordResetToken, 
    findValidRefreshToken, 
    findValidPasswordResetToken, 
    markTokenAsUsedByValue 
} = require('../../src/db/queries/tokenQueries');

// Mock environment variables
const mockEnv = {
    JWT_SECRET: 'test-jwt-secret-key-for-testing-purposes-only',
    JWT_REFRESH_SECRET: 'test-refresh-secret-key-for-testing-purposes-only'
};


describe('JWT Utilities', () => {
    const mockPayload = {
        userId: 'test-user-id-123',
        email: 'test@example.com'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        console.log = jest.fn();
        console.error = jest.fn();
        console.debug = jest.fn();
    });

    describe('generateAccessToken', () => {
        describe('Success Cases', () => {
            it('should generate access token successfully', () => {
                // Arrange
                const mockToken = 'mock-access-token';
                jwt.sign.mockReturnValue(mockToken);

                // Act
                const result = generateAccessToken(mockPayload);

                // Assert
                expect(jwt.sign).toHaveBeenCalledWith(
                    {
                        userId: mockPayload.userId,
                        email: mockPayload.email,
                        type: 'access'
                    },
                    mockEnv.JWT_SECRET,
                    {
                        expiresIn: '2h',
                        issuer: 'microsaas-auth',
                        audience: 'microsaas-client'
                    }
                );
                expect(result).toBe(mockToken);
                expect(console.debug).toHaveBeenCalledWith('Access token generation process completed');
            });
        });

        describe('Validation Failures', () => {
            it('should reject empty payload', () => {
                // Act & Assert
                expect(() => generateAccessToken(null)).toThrow('Invalid payload for access token generation');
                expect(() => generateAccessToken(undefined)).toThrow('Invalid payload for access token generation');
                expect(() => generateAccessToken({})).toThrow('Invalid payload for access token generation');
            });

            it('should reject payload without userId', () => {
                // Arrange
                const invalidPayload = { email: 'test@example.com' };

                // Act & Assert
                expect(() => generateAccessToken(invalidPayload)).toThrow('Invalid payload for access token generation');
            });

            it('should reject payload without email', () => {
                // Arrange
                const invalidPayload = { userId: 'test-user-id' };

                // Act & Assert
                expect(() => generateAccessToken(invalidPayload)).toThrow('Invalid payload for access token generation');
            });
        });

        describe('Error Handling', () => {
            it('should handle JWT signing errors', () => {
                // Arrange
                const signingError = new Error('JWT signing failed');
                jwt.sign.mockImplementation(() => {
                    throw signingError;
                });

                // Act & Assert
                expect(() => generateAccessToken(mockPayload)).toThrow('JWT signing failed');
                expect(console.error).toHaveBeenCalledWith('Access token generation failed:', 'JWT signing failed');
            });
        });
    });

    describe('generateRefreshToken', () => {
        describe('Success Cases', () => {
            it('should generate and store refresh token successfully', async () => {
                // Arrange
                const mockToken = 'mock-refresh-token';
                jwt.sign.mockReturnValue(mockToken);
                storeRefreshToken.mockResolvedValue();

                // Act
                const result = await generateRefreshToken(mockPayload);

                // Assert
                expect(jwt.sign).toHaveBeenCalledWith(
                    {
                        userId: mockPayload.userId,
                        email: mockPayload.email,
                        type: 'refresh'
                    },
                    mockEnv.JWT_REFRESH_SECRET,
                    {
                        expiresIn: '30d',
                        issuer: 'microsaas-auth',
                        audience: 'microsaas-client'
                    }
                );
                expect(storeRefreshToken).toHaveBeenCalledWith(mockPayload.userId, mockToken, 30);
                expect(result).toBe(mockToken);
                expect(console.debug).toHaveBeenCalledWith('Refresh token generation process completed');
            });
        });

        describe('Validation Failures', () => {
            it('should reject invalid payloads', async () => {
                // Act & Assert
                await expect(generateRefreshToken(null)).rejects.toThrow('Invalid payload for refresh token generation');
                await expect(generateRefreshToken({})).rejects.toThrow('Invalid payload for refresh token generation');
            });
        });

        describe('Error Handling', () => {
            it('should handle JWT signing errors', async () => {
                // Arrange
                const signingError = new Error('JWT signing failed');
                jwt.sign.mockImplementation(() => {
                    throw signingError;
                });

                // Act & Assert
                await expect(generateRefreshToken(mockPayload)).rejects.toThrow('JWT signing failed');
                expect(console.error).toHaveBeenCalledWith('Refresh token generation failed:', 'JWT signing failed');
            });

            it('should handle database storage errors', async () => {
                // Arrange
                const mockToken = 'mock-refresh-token';
                jwt.sign.mockReturnValue(mockToken);
                const dbError = new Error('Database storage failed');
                storeRefreshToken.mockRejectedValue(dbError);

                // Act & Assert
                await expect(generateRefreshToken(mockPayload)).rejects.toThrow('Database storage failed');
                expect(console.error).toHaveBeenCalledWith('Refresh token generation failed:', 'Database storage failed');
            });
        });
    });

    describe('generatePasswordResetToken', () => {
        describe('Success Cases', () => {
            it('should generate and store password reset token successfully', async () => {
                // Arrange
                const mockToken = 'mock-reset-token';
                jwt.sign.mockReturnValue(mockToken);
                storePasswordResetToken.mockResolvedValue();

                // Act
                const result = await generatePasswordResetToken(mockPayload);

                // Assert
                expect(jwt.sign).toHaveBeenCalledWith(
                    {
                        userId: mockPayload.userId,
                        email: mockPayload.email,
                        type: 'password_reset'
                    },
                    mockEnv.JWT_SECRET,
                    {
                        expiresIn: '1h',
                        issuer: 'microsaas-auth',
                        audience: 'microsaas-client'
                    }
                );
                expect(storePasswordResetToken).toHaveBeenCalledWith(mockPayload.userId, mockToken, 1);
                expect(result).toBe(mockToken);
            });
        });

        describe('Validation Failures', () => {
            it('should reject invalid payloads', async () => {
                // Act & Assert
                await expect(generatePasswordResetToken(null)).rejects.toThrow('Invalid payload for password reset token generation');
            });
        });
    });

    describe('verifyAccessToken', () => {
        const mockDecodedToken = {
            userId: 'test-user-id-123',
            email: 'test@example.com',
            type: 'access',
            iat: 1234567890,
            exp: 1234567890
        };

        describe('Success Cases', () => {
            it('should verify access token successfully', () => {
                // Arrange
                const mockToken = 'valid-access-token';
                jwt.verify.mockReturnValue(mockDecodedToken);

                // Act
                const result = verifyAccessToken(mockToken);

                // Assert
                expect(jwt.verify).toHaveBeenCalledWith(
                    mockToken,
                    mockEnv.JWT_SECRET,
                    {
                        issuer: 'microsaas-auth',
                        audience: 'microsaas-client'
                    }
                );
                expect(result).toEqual(mockDecodedToken);
                expect(console.debug).toHaveBeenCalledWith('Access token verification process completed');
            });
        });

        describe('Validation Failures', () => {
            it('should reject missing token', () => {
                // Act & Assert
                expect(() => verifyAccessToken('')).toThrow('No token provided');
                expect(() => verifyAccessToken(null)).toThrow('No token provided');
                expect(() => verifyAccessToken(undefined)).toThrow('No token provided');
            });

            it('should reject string decoded token', () => {
                // Arrange
                jwt.verify.mockReturnValue('string-token');

                // Act & Assert
                expect(() => verifyAccessToken('invalid-token')).toThrow('Invalid token format');
            });

            it('should reject wrong token type', () => {
                // Arrange
                const wrongTypeToken = { ...mockDecodedToken, type: 'refresh' };
                jwt.verify.mockReturnValue(wrongTypeToken);

                // Act & Assert
                expect(() => verifyAccessToken('wrong-type-token')).toThrow('Invalid token type');
            });
        });

        describe('Error Handling', () => {
            it('should handle JWT verification errors', () => {
                // Arrange
                const verificationError = new Error('Token expired');
                jwt.verify.mockImplementation(() => {
                    throw verificationError;
                });

                // Act & Assert
                expect(() => verifyAccessToken('expired-token')).toThrow('Token expired');
                expect(console.error).toHaveBeenCalledWith('Access token verification failed:', 'Token expired');
            });
        });
    });

    describe('verifyRefreshToken', () => {
        const mockDecodedToken = {
            userId: 'test-user-id-123',
            email: 'test@example.com',
            type: 'refresh'
        };

        const mockTokenRecord = {
            id: 'token-record-id',
            token: 'valid-refresh-token',
            is_used: false
        };

        describe('Success Cases', () => {
            it('should verify refresh token successfully', async () => {
                // Arrange
                const mockToken = 'valid-refresh-token';
                jwt.verify.mockReturnValue(mockDecodedToken);
                findValidRefreshToken.mockResolvedValue(mockTokenRecord);

                // Act
                const result = await verifyRefreshToken(mockToken);

                // Assert
                expect(jwt.verify).toHaveBeenCalledWith(
                    mockToken,
                    mockEnv.JWT_REFRESH_SECRET,
                    {
                        issuer: 'microsaas-auth',
                        audience: 'microsaas-client'
                    }
                );
                expect(findValidRefreshToken).toHaveBeenCalledWith(mockToken);
                expect(result).toEqual(mockDecodedToken);
            });
        });

        describe('Validation Failures', () => {
            it('should reject missing token', async () => {
                // Act & Assert
                await expect(verifyRefreshToken('')).rejects.toThrow('No refresh token provided');
            });

            it('should reject token not found in database', async () => {
                // Arrange
                jwt.verify.mockReturnValue(mockDecodedToken);
                findValidRefreshToken.mockResolvedValue(null);

                // Act & Assert
                await expect(verifyRefreshToken('unknown-token')).rejects.toThrow('Invalid or expired refresh token');
            });
        });
    });

    describe('verifyPasswordResetToken', () => {
        const mockDecodedToken = {
            userId: 'test-user-id-123',
            email: 'test@example.com',
            type: 'password_reset'
        };

        const mockTokenRecord = {
            id: 'token-record-id',
            token: 'valid-reset-token',
            is_used: false
        };

        describe('Success Cases', () => {
            it('should verify password reset token successfully', async () => {
                // Arrange
                const mockToken = 'valid-reset-token';
                jwt.verify.mockReturnValue(mockDecodedToken);
                findValidPasswordResetToken.mockResolvedValue(mockTokenRecord);

                // Act
                const result = await verifyPasswordResetToken(mockToken);

                // Assert
                expect(jwt.verify).toHaveBeenCalledWith(
                    mockToken,
                    mockEnv.JWT_SECRET,
                    {
                        issuer: 'microsaas-auth',
                        audience: 'microsaas-client'
                    }
                );
                expect(findValidPasswordResetToken).toHaveBeenCalledWith(mockToken);
                expect(result).toEqual(mockDecodedToken);
            });
        });

        describe('Validation Failures', () => {
            it('should reject missing token', async () => {
                // Act & Assert
                await expect(verifyPasswordResetToken('')).rejects.toThrow('No password reset token provided');
            });

            it('should reject token not found in database', async () => {
                // Arrange
                jwt.verify.mockReturnValue(mockDecodedToken);
                findValidPasswordResetToken.mockResolvedValue(null);

                // Act & Assert
                await expect(verifyPasswordResetToken('unknown-token')).rejects.toThrow('Invalid or expired password reset token');
            });
        });
    });

    describe('invalidateRefreshToken', () => {
        describe('Success Cases', () => {
            it('should invalidate refresh token successfully', async () => {
                // Arrange
                const mockToken = 'token-to-invalidate';
                markTokenAsUsedByValue.mockResolvedValue();

                // Act
                await invalidateRefreshToken(mockToken);

                // Assert
                expect(markTokenAsUsedByValue).toHaveBeenCalledWith(mockToken, 'refresh');
                expect(console.debug).toHaveBeenCalledWith('Refresh token invalidation process completed');
            });
        });

        describe('Validation Failures', () => {
            it('should reject missing token', async () => {
                // Act & Assert
                await expect(invalidateRefreshToken('')).rejects.toThrow('No refresh token provided');
                await expect(invalidateRefreshToken(null)).rejects.toThrow('No refresh token provided');
            });
        });

        describe('Error Handling', () => {
            it('should handle database errors', async () => {
                // Arrange
                const mockToken = 'token-to-invalidate';
                const dbError = new Error('Database operation failed');
                markTokenAsUsedByValue.mockRejectedValue(dbError);

                // Act & Assert
                await expect(invalidateRefreshToken(mockToken)).rejects.toThrow('Database operation failed');
                expect(console.error).toHaveBeenCalledWith('Refresh token invalidation failed:', 'Database operation failed');
            });
        });
    });

    describe('invalidatePasswordResetToken', () => {
        describe('Success Cases', () => {
            it('should invalidate password reset token successfully', async () => {
                // Arrange
                const mockToken = 'reset-token-to-invalidate';
                markTokenAsUsedByValue.mockResolvedValue();

                // Act
                await invalidatePasswordResetToken(mockToken);

                // Assert
                expect(markTokenAsUsedByValue).toHaveBeenCalledWith(mockToken, 'password_reset');
                expect(console.debug).toHaveBeenCalledWith('Password reset token invalidation process completed');
            });
        });

        describe('Validation Failures', () => {
            it('should reject missing token', async () => {
                // Act & Assert
                await expect(invalidatePasswordResetToken('')).rejects.toThrow('No password reset token provided');
            });
        });

        describe('Error Handling', () => {
            it('should handle database errors', async () => {
                // Arrange
                const mockToken = 'reset-token-to-invalidate';
                const dbError = new Error('Database operation failed');
                markTokenAsUsedByValue.mockRejectedValue(dbError);

                // Act & Assert
                await expect(invalidatePasswordResetToken(mockToken)).rejects.toThrow('Database operation failed');
                expect(console.error).toHaveBeenCalledWith('Password reset token invalidation failed:', 'Database operation failed');
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle non-Error exceptions', () => {
            // Arrange
            jwt.sign.mockImplementation(() => {
                throw 'String error';
            });

            // Act & Assert
            expect(() => generateAccessToken(mockPayload)).toThrow('String error');
            expect(console.error).toHaveBeenCalledWith('Access token generation failed:', 'String error');
        });

        it('should handle JWT secret errors', () => {
            // Arrange
            jwt.sign.mockImplementation(() => {
                throw new Error('secret required');
            });

            // Act & Assert
            expect(() => generateAccessToken(mockPayload)).toThrow('secret required');
        });
    });
});