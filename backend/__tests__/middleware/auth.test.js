/**
 * Authentication Middleware Tests
 * Tests for JWT authentication and user verification middleware
 */

// Mock dependencies FIRST - before any imports
const mockVerifyAccessToken = jest.fn();
const mockFindUserById = jest.fn();

// Mock the modules before requiring the middleware
jest.mock('../../src/utils/jwt', () => ({
    verifyAccessToken: mockVerifyAccessToken
}));

jest.mock('../../src/db/queries/authQueries', () => ({
    findUserById: mockFindUserById
}));

// Mock console methods to avoid interference
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'debug').mockImplementation(() => {});

// NOW import the middleware after mocks are set up
const {
    authenticateToken,
    verifyUserExists,
    requireVerifiedEmail,
    optionalAuth,
    authenticate,
    authenticateVerified
} = require('../../src/middleware/auth');

describe('Authentication Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = global.testUtils.mockRequest();
        res = global.testUtils.mockResponse();
        next = global.testUtils.mockNext();
        
        // Clear all mocks including our custom mocks
        jest.clearAllMocks();
        mockVerifyAccessToken.mockClear();
        mockFindUserById.mockClear();
    });

    describe('authenticateToken', () => {
        const mockTokenPayload = {
            userId: 'test-user-id-123',
            email: 'test@example.com',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600
        };

        describe('Success Cases', () => {
            it('should authenticate valid bearer token', () => {
                // Arrange
                req.headers.authorization = 'Bearer valid-token-123';
                mockVerifyAccessToken.mockImplementation((token) => {
                    expect(token).toBe('valid-token-123');
                    return mockTokenPayload;
                });

                // Act
                authenticateToken(req, res, next);

                // Assert
                expect(mockVerifyAccessToken).toHaveBeenCalledWith('valid-token-123');
                expect(req.user).toEqual({
                    id: mockTokenPayload.userId,
                    userId: mockTokenPayload.userId,
                    email: mockTokenPayload.email,
                    sessionCreatedAt: new Date(mockTokenPayload.iat * 1000),
                    sessionExpiresAt: new Date(mockTokenPayload.exp * 1000)
                });
                expect(next).toHaveBeenCalled();
                expect(console.debug).toHaveBeenCalledWith('Token authentication process completed');
            });

            it('should handle authorization header variations', () => {
                // Test different valid formats
                const testCases = [
                    'Bearer token123',
                    'Bearer jwt.token.here',
                    'Bearer very-long-jwt-token-with-special-chars.123'
                ];

                testCases.forEach(authHeader => {
                    req = global.testUtils.mockRequest();
                    res = global.testUtils.mockResponse();
                    next = global.testUtils.mockNext();
                    
                    req.headers.authorization = authHeader;
                    mockVerifyAccessToken.mockReturnValue(mockTokenPayload);

                    authenticateToken(req, res, next);

                    const expectedToken = authHeader.substring(7);
                    expect(mockVerifyAccessToken).toHaveBeenCalledWith(expectedToken);
                    expect(next).toHaveBeenCalled();
                });
            });
        });

        describe('Missing Token Cases', () => {
            it('should reject request with no authorization header', () => {
                // Arrange
                delete req.headers.authorization;

                // Act
                authenticateToken(req, res, next);

                // Assert
                expect(mockVerifyAccessToken).not.toHaveBeenCalled();
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Access token is required'
                });
                expect(next).not.toHaveBeenCalled();
            });

            it('should reject empty authorization header', () => {
                // Arrange
                req.headers.authorization = '';

                // Act
                authenticateToken(req, res, next);

                // Assert
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Access token is required'
                });
            });

            it('should reject authorization header without Bearer prefix', () => {
                // Arrange
                req.headers.authorization = 'token123';

                // Act
                authenticateToken(req, res, next);

                // Assert
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Access token is required'
                });
            });

            it('should reject Bearer with no token', () => {
                // Arrange
                req.headers.authorization = 'Bearer ';

                // Act
                authenticateToken(req, res, next);

                // Assert
                expect(res.status).toHaveBeenCalledWith(401);
            });
        });

        describe('Token Verification Errors', () => {
            beforeEach(() => {
                req.headers.authorization = 'Bearer invalid-token';
            });

            it('should handle expired token', () => {
                // Arrange
                const expiredError = new Error('jwt expired');
                mockVerifyAccessToken.mockImplementation(() => {
                    throw expiredError;
                });

                // Act
                authenticateToken(req, res, next);

                // Assert
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Access token has expired'
                });
                expect(console.error).toHaveBeenCalledWith('Token authentication failed:', 'jwt expired');
            });

            it('should handle invalid token signatures', () => {
                // Arrange
                const invalidError = new Error('invalid signature');
                mockVerifyAccessToken.mockImplementation(() => {
                    throw invalidError;
                });

                // Act
                authenticateToken(req, res, next);

                // Assert
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Invalid access token'
                });
            });

            it('should handle malformed tokens', () => {
                // Arrange
                const malformedError = new Error('jwt malformed');
                mockVerifyAccessToken.mockImplementation(() => {
                    throw malformedError;
                });

                // Act
                authenticateToken(req, res, next);

                // Assert
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Invalid access token'
                });
            });

            it('should handle JsonWebTokenError', () => {
                // Arrange
                const jwtError = new Error('JsonWebTokenError: invalid token');
                mockVerifyAccessToken.mockImplementation(() => {
                    throw jwtError;
                });

                // Act
                authenticateToken(req, res, next);

                // Assert
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Invalid access token'
                });
            });

            it('should handle user deletion errors with clear auth header', () => {
                // Arrange
                const userDeletedError = new Error('user not found in database');
                mockVerifyAccessToken.mockImplementation(() => {
                    throw userDeletedError;
                });

                // Act
                authenticateToken(req, res, next);

                // Assert
                expect(res.setHeader).toHaveBeenCalledWith('X-Clear-Auth', 'true');
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Token verification failed'
                });
            });

            it('should handle generic token errors', () => {
                // Arrange
                const genericError = new Error('Token verification failed');
                mockVerifyAccessToken.mockImplementation(() => {
                    throw genericError;
                });

                // Act
                authenticateToken(req, res, next);

                // Assert
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Token verification failed'
                });
            });

            it('should handle non-Error exceptions', () => {
                // Arrange
                mockVerifyAccessToken.mockImplementation(() => {
                    throw 'String error';
                });

                // Act
                authenticateToken(req, res, next);

                // Assert
                expect(console.error).toHaveBeenCalledWith('Token authentication failed:', 'String error');
                expect(res.status).toHaveBeenCalledWith(401);
            });
        });
    });

    describe('verifyUserExists', () => {
        const mockUser = global.testUtils.mockUser();

        beforeEach(() => {
            req.user = {
                userId: 'test-user-id-123',
                email: 'test@example.com',
                id: 'test-user-id-123'
            };
        });

        describe('Success Cases', () => {
            it('should verify existing user and add full user data', async () => {
                // Arrange
                mockFindUserById.mockResolvedValue(mockUser);

                // Act
                await verifyUserExists(req, res, next);

                // Assert
                expect(mockFindUserById).toHaveBeenCalledWith('test-user-id-123');
                expect(req.user).toEqual({
                    ...req.user,
                    firstName: mockUser.firstName,
                    lastName: mockUser.lastName,
                    isVerified: mockUser.isVerified,
                    createdAt: mockUser.createdAt
                });
                expect(next).toHaveBeenCalled();
                expect(console.debug).toHaveBeenCalledWith('User verification process completed');
            });
        });

        describe('Missing User Context', () => {
            it('should reject request with no user context', async () => {
                // Arrange
                req.user = null;

                // Act
                await verifyUserExists(req, res, next);

                // Assert
                expect(mockFindUserById).not.toHaveBeenCalled();
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'User authentication required'
                });
                expect(next).not.toHaveBeenCalled();
            });

            it('should reject request with missing userId', async () => {
                // Arrange
                req.user = { email: 'test@example.com' };

                // Act
                await verifyUserExists(req, res, next);

                // Assert
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'User authentication required'
                });
            });
        });

        describe('User Not Found Cases', () => {
            it('should handle user not found in database', async () => {
                // Arrange
                mockFindUserById.mockResolvedValue(null);

                // Act
                await verifyUserExists(req, res, next);

                // Assert
                expect(res.setHeader).toHaveBeenCalledWith('X-Clear-Auth', 'true');
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'User not found or inactive'
                });
                expect(next).not.toHaveBeenCalled();
            });

            it('should handle email mismatch (user changed)', async () => {
                // Arrange
                const userWithDifferentEmail = { ...mockUser, email: 'different@example.com' };
                mockFindUserById.mockResolvedValue(userWithDifferentEmail);

                // Act
                await verifyUserExists(req, res, next);

                // Assert
                expect(res.setHeader).toHaveBeenCalledWith('X-Clear-Auth', 'true');
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'User not found or inactive'
                });
            });
        });

        describe('Error Handling', () => {
            it('should handle database errors', async () => {
                // Arrange
                const dbError = new Error('Database connection failed');
                mockFindUserById.mockRejectedValue(dbError);

                // Act
                await verifyUserExists(req, res, next);

                // Assert
                expect(console.error).toHaveBeenCalledWith('User verification failed:', 'Database connection failed');
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'User verification error'
                });
            });

            it('should handle non-Error exceptions', async () => {
                // Arrange
                mockFindUserById.mockRejectedValue('String error');

                // Act
                await verifyUserExists(req, res, next);

                // Assert
                expect(console.error).toHaveBeenCalledWith('User verification failed:', 'String error');
                expect(res.status).toHaveBeenCalledWith(500);
            });
        });
    });

    describe('requireVerifiedEmail', () => {
        describe('Success Cases', () => {
            it('should allow verified user', () => {
                // Arrange
                req.user = { isVerified: true };

                // Act
                requireVerifiedEmail(req, res, next);

                // Assert
                expect(next).toHaveBeenCalled();
                expect(console.debug).toHaveBeenCalledWith('Email verification check process completed');
            });
        });

        describe('Missing User Context', () => {
            it('should reject request with no user context', () => {
                // Arrange
                req.user = null;

                // Act
                requireVerifiedEmail(req, res, next);

                // Assert
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'User authentication required'
                });
                expect(next).not.toHaveBeenCalled();
            });
        });

        describe('Verification Required Cases', () => {
            it('should reject unverified user', () => {
                // Arrange
                req.user = { isVerified: false };

                // Act
                requireVerifiedEmail(req, res, next);

                // Assert
                expect(res.status).toHaveBeenCalledWith(403);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Email verification required to access this resource'
                });
                expect(next).not.toHaveBeenCalled();
            });

            it('should reject user with missing isVerified field', () => {
                // Arrange
                req.user = { email: 'test@example.com' };

                // Act
                requireVerifiedEmail(req, res, next);

                // Assert
                expect(res.status).toHaveBeenCalledWith(403);
            });
        });

        describe('Error Handling', () => {
            it('should handle middleware errors gracefully', () => {
                // Arrange
                // Force an error by overriding a property access
                const errorUser = {};
                Object.defineProperty(errorUser, 'isVerified', {
                    get() { throw new Error('Property access error'); }
                });
                req.user = errorUser;

                // Act
                requireVerifiedEmail(req, res, next);

                // Assert
                expect(console.error).toHaveBeenCalledWith('Email verification check failed:', 'Property access error');
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Verification check error'
                });
            });
        });
    });

    describe('optionalAuth', () => {
        const mockTokenPayload = {
            userId: 'test-user-id-123',
            email: 'test@example.com',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600
        };

        describe('Success Cases', () => {
            it('should authenticate when valid token provided', () => {
                // Arrange
                req.headers.authorization = 'Bearer valid-token-123';
                mockVerifyAccessToken.mockReturnValue(mockTokenPayload);

                // Act
                optionalAuth(req, res, next);

                // Assert
                expect(req.user).toEqual({
                    id: mockTokenPayload.userId,
                    userId: mockTokenPayload.userId,
                    email: mockTokenPayload.email,
                    sessionCreatedAt: new Date(mockTokenPayload.iat * 1000),
                    sessionExpiresAt: new Date(mockTokenPayload.exp * 1000)
                });
                expect(next).toHaveBeenCalled();
            });

            it('should continue without auth when no token provided', () => {
                // Arrange
                delete req.headers.authorization;

                // Act
                optionalAuth(req, res, next);

                // Assert
                expect(req.user).toBeNull();
                expect(next).toHaveBeenCalled();
                expect(mockVerifyAccessToken).not.toHaveBeenCalled();
            });

            it('should continue without auth when token is invalid', () => {
                // Arrange
                req.headers.authorization = 'Bearer invalid-token';
                mockVerifyAccessToken.mockImplementation(() => {
                    throw new Error('Invalid token');
                });

                // Act
                optionalAuth(req, res, next);

                // Assert
                expect(req.user).toBeNull();
                expect(next).toHaveBeenCalled();
            });
        });

        describe('Edge Cases', () => {
            it('should handle empty bearer token', () => {
                // Arrange
                req.headers.authorization = 'Bearer ';

                // Act
                optionalAuth(req, res, next);

                // Assert
                expect(req.user).toBeNull();
                expect(next).toHaveBeenCalled();
            });

            it('should handle malformed authorization header', () => {
                // Arrange
                req.headers.authorization = 'NotBearer token123';

                // Act
                optionalAuth(req, res, next);

                // Assert
                expect(req.user).toBeNull();
                expect(next).toHaveBeenCalled();
            });

            it('should handle middleware errors gracefully', () => {
                // Arrange
                req.headers.authorization = 'Bearer token123';
                mockVerifyAccessToken.mockImplementation(() => {
                    throw new Error('Unexpected error');
                });

                // Override next to throw error on first call but not second
                let callCount = 0;
                const originalNext = next;
                next = jest.fn(() => {
                    callCount++;
                    if (callCount === 1) {
                        throw new Error('Next function error');
                    }
                });

                // Act - wrap in try-catch since the error will bubble up
                try {
                    optionalAuth(req, res, next);
                } catch (error) {
                    // Error is expected and handled by the middleware
                }

                // Assert
                expect(req.user).toBeNull();
                expect(next).toHaveBeenCalledTimes(2); // Called twice - first throws, second succeeds
                expect(console.error).toHaveBeenCalledWith('Optional authentication failed:', 'Next function error');

                // Restore
                next = originalNext;
            });
        });
    });

    describe('authenticate (combined middleware)', () => {
        const mockTokenPayload = {
            userId: 'test-user-id-123',
            email: 'test@example.com',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600
        };
        const mockUser = global.testUtils.mockUser();

        describe('Success Cases', () => {
            it('should authenticate with valid token and existing user', async () => {
                // Arrange
                req.headers.authorization = 'Bearer valid-token-123';
                mockVerifyAccessToken.mockReturnValue(mockTokenPayload);
                mockFindUserById.mockResolvedValue(mockUser);

                // Act
                await authenticate(req, res, next);

                // Assert - need to wait for async operations
                await new Promise(resolve => setTimeout(resolve, 10));
                
                expect(mockVerifyAccessToken).toHaveBeenCalledWith('valid-token-123');
                expect(mockFindUserById).toHaveBeenCalledWith(mockTokenPayload.userId);
                expect(next).toHaveBeenCalled();
            });
        });

        describe('Token Failures', () => {
            it('should fail when token is missing', async () => {
                // Arrange
                delete req.headers.authorization;

                // Act
                await authenticate(req, res, next);

                // Assert
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Access token is required'
                });
                expect(next).not.toHaveBeenCalled();
            });

            it('should fail when token is invalid', async () => {
                // Arrange
                req.headers.authorization = 'Bearer invalid-token';
                mockVerifyAccessToken.mockImplementation(() => {
                    throw new Error('Invalid token');
                });

                // Act
                await authenticate(req, res, next);

                // Assert
                expect(res.status).toHaveBeenCalledWith(401);
                expect(next).not.toHaveBeenCalled();
            });
        });

        describe('User Verification Failures', () => {
            it('should fail when user does not exist', async () => {
                // Arrange
                req.headers.authorization = 'Bearer valid-token-123';
                mockVerifyAccessToken.mockReturnValue(mockTokenPayload);
                mockFindUserById.mockResolvedValue(null);

                // Act
                await authenticate(req, res, next);

                // Assert - need to wait for async operations
                await new Promise(resolve => setTimeout(resolve, 10));
                
                expect(res.setHeader).toHaveBeenCalledWith('X-Clear-Auth', 'true');
                expect(res.status).toHaveBeenCalledWith(401);
                expect(next).not.toHaveBeenCalled();
            });
        });
    });

    describe('authenticateVerified (full auth with verification)', () => {
        const mockTokenPayload = {
            userId: 'test-user-id-123',
            email: 'test@example.com',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600
        };
        const mockUser = global.testUtils.mockUser({ isVerified: true });

        describe('Success Cases', () => {
            it('should authenticate verified user', async () => {
                // Arrange
                req.headers.authorization = 'Bearer valid-token-123';
                mockVerifyAccessToken.mockReturnValue(mockTokenPayload);
                mockFindUserById.mockResolvedValue(mockUser);

                // Act
                await authenticateVerified(req, res, next);

                // Assert - need to wait for async operations
                await new Promise(resolve => setTimeout(resolve, 10));
                
                expect(next).toHaveBeenCalled();
            });
        });

        describe('Verification Failures', () => {
            it('should reject unverified user', async () => {
                // Arrange
                const unverifiedUser = { ...mockUser, isVerified: false };
                req.headers.authorization = 'Bearer valid-token-123';
                mockVerifyAccessToken.mockReturnValue(mockTokenPayload);
                mockFindUserById.mockResolvedValue(unverifiedUser);

                // Act
                await authenticateVerified(req, res, next);

                // Assert - need to wait for async operations
                await new Promise(resolve => setTimeout(resolve, 10));
                
                expect(res.status).toHaveBeenCalledWith(403);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Email verification required to access this resource'
                });
                expect(next).not.toHaveBeenCalled();
            });
        });
    });
});