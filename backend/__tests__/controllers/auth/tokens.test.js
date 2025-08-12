/**
 * Token Controller Tests
 * Tests for token refresh and logout functionality
 */

// Mock dependencies first
jest.mock('../../../src/db/queries/authQueries');
jest.mock('../../../src/utils/jwt');

const { handleRefreshToken, handleLogout } = require('../../../src/controllers/auth/tokens');
const { findUserById } = require('../../../src/db/queries/authQueries');
const { 
    generateAccessToken, 
    generateRefreshToken,
    verifyRefreshToken,
    invalidateRefreshToken
} = require('../../../src/utils/jwt');

describe('Token Controller', () => {
    let req, res;
    
    beforeEach(() => {
        req = global.testUtils.mockRequest();
        res = global.testUtils.mockResponse();
        jest.clearAllMocks();
        console.error = jest.fn();
        console.debug = jest.fn();
    });

    describe('handleRefreshToken', () => {
        const mockUser = {
            id: 'test-user-id-123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User'
        };

        const mockDecodedToken = {
            userId: mockUser.id,
            email: mockUser.email,
            type: 'refresh'
        };

        describe('Success Cases', () => {
            it('should refresh tokens successfully', async () => {
                // Arrange
                req.body = { refreshToken: 'valid-refresh-token' };
                
                verifyRefreshToken.mockResolvedValue(mockDecodedToken);
                findUserById.mockResolvedValue(mockUser);
                generateAccessToken.mockReturnValue('new-access-token');
                generateRefreshToken.mockResolvedValue('new-refresh-token');
                invalidateRefreshToken.mockResolvedValue();

                // Act
                await handleRefreshToken(req, res);

                // Assert
                expect(verifyRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
                expect(findUserById).toHaveBeenCalledWith(mockUser.id);
                expect(generateAccessToken).toHaveBeenCalledWith({
                    userId: mockUser.id,
                    email: mockUser.email
                });
                expect(generateRefreshToken).toHaveBeenCalledWith({
                    userId: mockUser.id,
                    email: mockUser.email
                });
                expect(invalidateRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
                
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Tokens refreshed successfully',
                    data: {
                        tokens: {
                            accessToken: 'new-access-token',
                            refreshToken: 'new-refresh-token'
                        }
                    }
                });
                expect(console.debug).toHaveBeenCalledWith('Token refresh process completed');
            });

            it('should handle refresh token with different user data', async () => {
                // Arrange
                const differentUser = {
                    id: 'different-user-id-456',
                    email: 'different@example.com',
                    firstName: 'Different',
                    lastName: 'User'
                };
                
                const differentDecodedToken = {
                    userId: differentUser.id,
                    email: differentUser.email,
                    type: 'refresh'
                };

                req.body = { refreshToken: 'valid-refresh-token-2' };
                
                verifyRefreshToken.mockResolvedValue(differentDecodedToken);
                findUserById.mockResolvedValue(differentUser);
                generateAccessToken.mockReturnValue('new-access-token-2');
                generateRefreshToken.mockResolvedValue('new-refresh-token-2');
                invalidateRefreshToken.mockResolvedValue();

                // Act
                await handleRefreshToken(req, res);

                // Assert
                expect(findUserById).toHaveBeenCalledWith(differentUser.id);
                expect(generateAccessToken).toHaveBeenCalledWith({
                    userId: differentUser.id,
                    email: differentUser.email
                });
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Tokens refreshed successfully',
                    data: {
                        tokens: {
                            accessToken: 'new-access-token-2',
                            refreshToken: 'new-refresh-token-2'
                        }
                    }
                });
            });
        });

        describe('User Not Found Cases', () => {
            it('should return 401 and set clear auth header when user not found', async () => {
                // Arrange
                req.body = { refreshToken: 'valid-refresh-token' };
                
                verifyRefreshToken.mockResolvedValue(mockDecodedToken);
                findUserById.mockResolvedValue(null);

                // Act
                await handleRefreshToken(req, res);

                // Assert
                expect(verifyRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
                expect(findUserById).toHaveBeenCalledWith(mockUser.id);
                expect(generateAccessToken).not.toHaveBeenCalled();
                expect(generateRefreshToken).not.toHaveBeenCalled();
                expect(invalidateRefreshToken).not.toHaveBeenCalled();
                
                expect(res.setHeader).toHaveBeenCalledWith('X-Clear-Auth', 'true');
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'User not found'
                });
            });

            it('should handle undefined user result', async () => {
                // Arrange
                req.body = { refreshToken: 'valid-refresh-token' };
                
                verifyRefreshToken.mockResolvedValue(mockDecodedToken);
                findUserById.mockResolvedValue(undefined);

                // Act
                await handleRefreshToken(req, res);

                // Assert
                expect(res.setHeader).toHaveBeenCalledWith('X-Clear-Auth', 'true');
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'User not found'
                });
            });
        });

        describe('Token Verification Failures', () => {
            it('should return 401 for expired refresh token', async () => {
                // Arrange
                req.body = { refreshToken: 'expired-refresh-token' };
                
                verifyRefreshToken.mockRejectedValue(new Error('Token expired'));

                // Act
                await handleRefreshToken(req, res);

                // Assert
                expect(verifyRefreshToken).toHaveBeenCalledWith('expired-refresh-token');
                expect(findUserById).not.toHaveBeenCalled();
                
                expect(res.setHeader).toHaveBeenCalledWith('X-Clear-Auth', 'true');
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Invalid or expired refresh token'
                });
                expect(console.debug).toHaveBeenCalledWith('Token refresh process completed');
            });

            it('should return 401 for invalid refresh token', async () => {
                // Arrange
                req.body = { refreshToken: 'invalid-refresh-token' };
                
                verifyRefreshToken.mockRejectedValue(new Error('Invalid token signature'));

                // Act
                await handleRefreshToken(req, res);

                // Assert
                expect(res.setHeader).toHaveBeenCalledWith('X-Clear-Auth', 'true');
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Invalid or expired refresh token'
                });
            });

            it('should return 401 for malformed refresh token', async () => {
                // Arrange
                req.body = { refreshToken: 'malformed-token' };
                
                verifyRefreshToken.mockRejectedValue(new Error('Token is malformed'));

                // Act
                await handleRefreshToken(req, res);

                // Assert
                expect(res.setHeader).toHaveBeenCalledWith('X-Clear-Auth', 'true');
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Invalid or expired refresh token'
                });
            });

            it('should return 401 for signature verification failure', async () => {
                // Arrange
                req.body = { refreshToken: 'token-with-bad-signature' };
                
                verifyRefreshToken.mockRejectedValue(new Error('JWT signature verification failed'));

                // Act
                await handleRefreshToken(req, res);

                // Assert
                expect(res.setHeader).toHaveBeenCalledWith('X-Clear-Auth', 'true');
                expect(res.status).toHaveBeenCalledWith(401);
            });
        });

        describe('Token Generation Errors', () => {
            it('should handle access token generation errors', async () => {
                // Arrange
                req.body = { refreshToken: 'valid-refresh-token' };
                
                verifyRefreshToken.mockResolvedValue(mockDecodedToken);
                findUserById.mockResolvedValue(mockUser);
                generateAccessToken.mockImplementation(() => {
                    throw new Error('Access token generation failed');
                });

                // Act
                await handleRefreshToken(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('Token refresh failed:', 'Access token generation failed');
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Token refresh failed'
                });
            });

            it('should handle refresh token generation errors', async () => {
                // Arrange
                req.body = { refreshToken: 'valid-refresh-token' };
                
                verifyRefreshToken.mockResolvedValue(mockDecodedToken);
                findUserById.mockResolvedValue(mockUser);
                generateAccessToken.mockReturnValue('new-access-token');
                generateRefreshToken.mockRejectedValue(new Error('Refresh token generation failed'));

                // Act
                await handleRefreshToken(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('Token refresh failed:', 'Refresh token generation failed');
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Token refresh failed'
                });
            });

            it('should handle token invalidation errors', async () => {
                // Arrange
                req.body = { refreshToken: 'valid-refresh-token' };
                
                verifyRefreshToken.mockResolvedValue(mockDecodedToken);
                findUserById.mockResolvedValue(mockUser);
                generateAccessToken.mockReturnValue('new-access-token');
                generateRefreshToken.mockResolvedValue('new-refresh-token');
                invalidateRefreshToken.mockRejectedValue(new Error('Database error during token cleanup'));

                // Act
                await handleRefreshToken(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('Token refresh failed:', 'Database error during token cleanup');
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Token refresh failed'
                });
            });
        });

        describe('Database Errors', () => {
            it('should handle user lookup database errors', async () => {
                // Arrange
                req.body = { refreshToken: 'valid-refresh-token' };
                
                verifyRefreshToken.mockResolvedValue(mockDecodedToken);
                findUserById.mockRejectedValue(new Error('Database connection failed'));

                // Act
                await handleRefreshToken(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('Token refresh failed:', 'Database connection failed');
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Token refresh failed'
                });
            });

            it('should handle non-Error exceptions', async () => {
                // Arrange
                req.body = { refreshToken: 'valid-refresh-token' };
                
                verifyRefreshToken.mockRejectedValue('String error during verification');

                // Act
                await handleRefreshToken(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('Token refresh failed:', 'String error during verification');
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Token refresh failed'
                });
            });
        });
    });

    describe('handleLogout', () => {
        describe('Success Cases', () => {
            it('should logout successfully with refresh token', async () => {
                // Arrange
                req.body = { refreshToken: 'valid-refresh-token' };
                invalidateRefreshToken.mockResolvedValue();

                // Act
                await handleLogout(req, res);

                // Assert
                expect(invalidateRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Logged out successfully'
                });
                expect(console.debug).toHaveBeenCalledWith('Logout process completed');
            });

            it('should logout successfully without refresh token', async () => {
                // Arrange
                req.body = {};

                // Act
                await handleLogout(req, res);

                // Assert
                expect(invalidateRefreshToken).not.toHaveBeenCalled();
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Logged out successfully'
                });
                expect(console.debug).toHaveBeenCalledWith('Logout process completed');
            });

            it('should logout successfully with null refresh token', async () => {
                // Arrange
                req.body = { refreshToken: null };

                // Act
                await handleLogout(req, res);

                // Assert
                expect(invalidateRefreshToken).not.toHaveBeenCalled();
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Logged out successfully'
                });
            });

            it('should logout successfully with undefined refresh token', async () => {
                // Arrange
                req.body = { refreshToken: undefined };

                // Act
                await handleLogout(req, res);

                // Assert
                expect(invalidateRefreshToken).not.toHaveBeenCalled();
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Logged out successfully'
                });
            });

            it('should logout successfully with empty string refresh token', async () => {
                // Arrange
                req.body = { refreshToken: '' };

                // Act
                await handleLogout(req, res);

                // Assert
                expect(invalidateRefreshToken).not.toHaveBeenCalled();
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Logged out successfully'
                });
            });
        });

        describe('Token Invalidation Errors', () => {
            it('should still return success when token invalidation fails', async () => {
                // Arrange
                req.body = { refreshToken: 'some-refresh-token' };
                invalidateRefreshToken.mockRejectedValue(new Error('Token invalidation failed'));

                // Act
                await handleLogout(req, res);

                // Assert
                expect(invalidateRefreshToken).toHaveBeenCalledWith('some-refresh-token');
                expect(console.error).toHaveBeenCalledWith('Logout failed:', 'Token invalidation failed');
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Logged out successfully'
                });
                expect(console.debug).toHaveBeenCalledWith('Logout process completed');
            });

            it('should handle database errors during token invalidation', async () => {
                // Arrange
                req.body = { refreshToken: 'valid-refresh-token' };
                invalidateRefreshToken.mockRejectedValue(new Error('Database connection failed'));

                // Act
                await handleLogout(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('Logout failed:', 'Database connection failed');
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Logged out successfully'
                });
            });

            it('should handle non-existent token errors gracefully', async () => {
                // Arrange
                req.body = { refreshToken: 'non-existent-token' };
                invalidateRefreshToken.mockRejectedValue(new Error('Token not found'));

                // Act
                await handleLogout(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('Logout failed:', 'Token not found');
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Logged out successfully'
                });
            });

            it('should handle non-Error exceptions', async () => {
                // Arrange
                req.body = { refreshToken: 'some-token' };
                invalidateRefreshToken.mockRejectedValue('String error during invalidation');

                // Act
                await handleLogout(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('Logout failed:', 'String error during invalidation');
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Logged out successfully'
                });
            });
        });

        describe('Edge Cases', () => {
            it('should handle missing request body', async () => {
                // Arrange
                req.body = undefined;

                // Act
                await handleLogout(req, res);

                // Assert
                expect(invalidateRefreshToken).not.toHaveBeenCalled();
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Logged out successfully'
                });
            });

            it('should handle request body being null', async () => {
                // Arrange
                req.body = null;

                // Act
                await handleLogout(req, res);

                // Assert
                expect(invalidateRefreshToken).not.toHaveBeenCalled();
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Logged out successfully'
                });
            });

            it('should handle boolean refresh token value', async () => {
                // Arrange
                req.body = { refreshToken: false };

                // Act
                await handleLogout(req, res);

                // Assert
                expect(invalidateRefreshToken).not.toHaveBeenCalled();
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Logged out successfully'
                });
            });

            it('should handle numeric refresh token value', async () => {
                // Arrange
                req.body = { refreshToken: 0 };

                // Act
                await handleLogout(req, res);

                // Assert
                expect(invalidateRefreshToken).not.toHaveBeenCalled();
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Logged out successfully'
                });
            });

            it('should handle very long refresh token', async () => {
                // Arrange
                const longToken = 'a'.repeat(10000);
                req.body = { refreshToken: longToken };
                invalidateRefreshToken.mockResolvedValue();

                // Act
                await handleLogout(req, res);

                // Assert
                expect(invalidateRefreshToken).toHaveBeenCalledWith(longToken);
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Logged out successfully'
                });
            });
        });
    });
});