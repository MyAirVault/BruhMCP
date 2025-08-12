/**
 * Authentication Login Controller Tests
 * Tests for user login functionality
 */

// Mock dependencies first
jest.mock('../../../src/db/queries/authQueries');
jest.mock('../../../src/utils/password');
jest.mock('../../../src/utils/jwt');

// Import the functions after mocking
const { handleLogin } = require('../../../src/controllers/auth/login');
const { findUserByEmail } = require('../../../src/db/queries/authQueries');
const { verifyPassword } = require('../../../src/utils/password');
const { generateAccessToken, generateRefreshToken } = require('../../../src/utils/jwt');

describe('Login Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = global.testUtils.mockRequest({
            body: {
                email: 'test@example.com',
                password: 'testPassword123'
            }
        });
        res = global.testUtils.mockResponse();
        next = global.testUtils.mockNext();

        // Reset mocks and set up mock functions
        jest.clearAllMocks();
        
        // Set up mock implementations
        findUserByEmail.mockReset ? findUserByEmail.mockReset() : null;
        verifyPassword.mockReset ? verifyPassword.mockReset() : null;
        generateAccessToken.mockReset ? generateAccessToken.mockReset() : null;
        generateRefreshToken.mockReset ? generateRefreshToken.mockReset() : null;
    });

    describe('handleLogin', () => {
        const mockUser = global.testUtils.mockUser();

        describe('Success Cases', () => {
            it('should login verified user successfully', async () => {
                // Arrange
                findUserByEmail.mockResolvedValue(mockUser);
                verifyPassword.mockResolvedValue(true);
                generateAccessToken.mockReturnValue('mock-access-token');
                generateRefreshToken.mockResolvedValue('mock-refresh-token');

                // Act
                await handleLogin(req, res);

                // Assert
                expect(findUserByEmail).toHaveBeenCalledWith('test@example.com');
                expect(verifyPassword).toHaveBeenCalledWith('testPassword123', mockUser.password_hash);
                expect(generateAccessToken).toHaveBeenCalledWith({
                    userId: mockUser.id,
                    email: mockUser.email
                });
                expect(generateRefreshToken).toHaveBeenCalledWith({
                    userId: mockUser.id,
                    email: mockUser.email
                });
                
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Login successful',
                    data: {
                        user: {
                            id: mockUser.id,
                            email: mockUser.email,
                            firstName: mockUser.firstName,
                            lastName: mockUser.lastName,
                            isVerified: true
                        },
                        tokens: {
                            accessToken: 'mock-access-token',
                            refreshToken: 'mock-refresh-token'
                        }
                    }
                });
            });

            it('should handle unverified user with valid password', async () => {
                // Arrange
                const unverifiedUser = { ...mockUser, isVerified: false };
                findUserByEmail.mockResolvedValue(unverifiedUser);
                verifyPassword.mockResolvedValue(true);

                // Act
                await handleLogin(req, res);

                // Assert
                expect(verifyPassword).toHaveBeenCalledWith('testPassword123', unverifiedUser.password_hash);
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Account verification required',
                    code: 'VERIFICATION_REQUIRED',
                    data: {
                        email: unverifiedUser.email,
                        requiresVerification: true,
                        redirectToOTP: true,
                        step: 'otp_verification'
                    }
                });
            });
        });

        describe('Authentication Failures', () => {
            it('should reject login with non-existent user', async () => {
                // Arrange
                findUserByEmail.mockResolvedValue(null);

                // Act
                await handleLogin(req, res);

                // Assert
                expect(findUserByEmail).toHaveBeenCalledWith('test@example.com');
                expect(verifyPassword).not.toHaveBeenCalled();
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Incorrect email or password. Please check your credentials and try again.'
                });
            });

            it('should reject login with invalid password for verified user', async () => {
                // Arrange
                findUserByEmail.mockResolvedValue(mockUser);
                verifyPassword.mockResolvedValue(false);

                // Act
                await handleLogin(req, res);

                // Assert
                expect(verifyPassword).toHaveBeenCalledWith('testPassword123', mockUser.password_hash);
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Incorrect email or password. Please check your credentials and try again.'
                });
            });

            it('should reject login with invalid password for unverified user', async () => {
                // Arrange
                const unverifiedUser = { ...mockUser, isVerified: false };
                findUserByEmail.mockResolvedValue(unverifiedUser);
                verifyPassword.mockResolvedValue(false);

                // Act
                await handleLogin(req, res);

                // Assert
                expect(verifyPassword).toHaveBeenCalledWith('testPassword123', unverifiedUser.password_hash);
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Incorrect email or password. Please check your credentials and try again.'
                });
            });
        });

        describe('Input Validation', () => {
            it('should handle missing email', async () => {
                // Arrange
                req.body = { password: 'testPassword123' };

                // Act
                await handleLogin(req, res);

                // Assert
                expect(findUserByEmail).toHaveBeenCalledWith(undefined);
                // The function should still proceed and fail at user lookup
            });

            it('should handle missing password', async () => {
                // Arrange
                req.body = { email: 'test@example.com' };

                // Act
                await handleLogin(req, res);

                // Assert
                expect(findUserByEmail).toHaveBeenCalledWith('test@example.com');
                // Will fail at password verification if user is found
            });

            it('should handle empty request body', async () => {
                // Arrange
                req.body = {};

                // Act
                await handleLogin(req, res);

                // Assert
                expect(findUserByEmail).toHaveBeenCalledWith(undefined);
            });
        });

        describe('Error Handling', () => {
            it('should handle database errors during user lookup', async () => {
                // Arrange
                const dbError = new Error('Database connection failed');
                findUserByEmail.mockRejectedValue(dbError);

                // Act
                await handleLogin(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Login failed'
                });
            });

            it('should handle password verification errors', async () => {
                // Arrange
                findUserByEmail.mockResolvedValue(mockUser);
                const passwordError = new Error('Password verification failed');
                verifyPassword.mockRejectedValue(passwordError);

                // Act
                await handleLogin(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Login failed'
                });
            });

            it('should handle token generation errors', async () => {
                // Arrange
                findUserByEmail.mockResolvedValue(mockUser);
                verifyPassword.mockResolvedValue(true);
                const tokenError = new Error('Token generation failed');
                generateAccessToken.mockImplementation(() => {
                    throw tokenError;
                });

                // Act
                await handleLogin(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Login failed'
                });
            });

            it('should handle refresh token generation errors', async () => {
                // Arrange
                findUserByEmail.mockResolvedValue(mockUser);
                verifyPassword.mockResolvedValue(true);
                generateAccessToken.mockReturnValue('mock-access-token');
                const tokenError = new Error('Refresh token generation failed');
                generateRefreshToken.mockRejectedValue(tokenError);

                // Act
                await handleLogin(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Login failed'
                });
            });
        });

        describe('Edge Cases', () => {
            it('should handle null user from database', async () => {
                // Arrange
                findUserByEmail.mockResolvedValue(null);

                // Act
                await handleLogin(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Incorrect email or password. Please check your credentials and try again.'
                });
            });

            it('should handle user with missing password hash', async () => {
                // Arrange
                const userWithoutPassword = { ...mockUser, password_hash: null };
                findUserByEmail.mockResolvedValue(userWithoutPassword);
                // The verifyPassword won't be called because the error occurs before it

                // Act
                await handleLogin(req, res);

                // Assert
                // When password_hash is null, accessing .length throws an error caught by the controller
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Login failed'
                });
            });

            it('should handle boolean isVerified values correctly', async () => {
                // Arrange
                const userWithBooleanVerified = { ...mockUser, isVerified: 1 };
                findUserByEmail.mockResolvedValue(userWithBooleanVerified);
                verifyPassword.mockResolvedValue(true);
                generateAccessToken.mockReturnValue('mock-access-token');
                generateRefreshToken.mockResolvedValue('mock-refresh-token');

                // Act
                await handleLogin(req, res);

                // Assert
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Login successful',
                    data: {
                        user: {
                            id: userWithBooleanVerified.id,
                            email: userWithBooleanVerified.email,
                            firstName: userWithBooleanVerified.firstName,
                            lastName: userWithBooleanVerified.lastName,
                            isVerified: true // Should convert truthy to boolean
                        },
                        tokens: {
                            accessToken: 'mock-access-token',
                            refreshToken: 'mock-refresh-token'
                        }
                    }
                });
            });
        });
    });
});