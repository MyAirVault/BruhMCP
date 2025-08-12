/**
 * Local Development Authentication Controller Tests
 * Tests for local development authentication functionality
 */

const {
    localLoginOrRegister,
    getEnvironmentInfo,
    testCredentials
} = require('../../../src/local_development/controllers/localAuthController');

// Mock dependencies first
jest.mock('../../../src/local_development/services/localUserService');
jest.mock('../../../src/utils/jwt');
jest.mock('../../../src/local_development/config/localMode');
jest.mock('../../../src/utils/errorResponse');

// Import mocked modules
const { localUserService } = require('../../../src/local_development/services/localUserService');
const { generateAccessToken } = require('../../../src/utils/jwt');
const { getLocalModeConfig } = require('../../../src/local_development/config/localMode');
const { ErrorResponses, formatZodErrors } = require('../../../src/utils/errorResponse');

describe('Local Authentication Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = global.testUtils.mockRequest();
        res = global.testUtils.mockResponse();
        next = global.testUtils.mockNext();

        // Clear all mocks
        jest.clearAllMocks();
        
        // Setup default mock implementations
        localUserService.loginOrRegister = jest.fn();
        localUserService.verifyCredentials = jest.fn();
        generateAccessToken.mockReturnValue = jest.fn();
        getLocalModeConfig.mockReturnValue = jest.fn();
        ErrorResponses.validation = jest.fn();
        ErrorResponses.invalidInput = jest.fn();
        ErrorResponses.unauthorized = jest.fn();
        ErrorResponses.internal = jest.fn();
        formatZodErrors.mockReturnValue = jest.fn().mockReturnValue([]);
    });

    describe('localLoginOrRegister', () => {
        const mockUser = global.testUtils.mockUser();
        const mockJwtToken = 'mock-jwt-token-123';

        describe('Success Cases', () => {
            it('should login existing user successfully', async () => {
                // Arrange
                req.body = {
                    email: 'test@example.com',
                    password: 'password123'
                };
                
                localUserService.loginOrRegister.mockResolvedValue({
                    success: true,
                    user: mockUser,
                    isNewUser: false
                });
                generateAccessToken.mockReturnValue(mockJwtToken);

                // Act
                await localLoginOrRegister(req, res);

                // Assert
                expect(localUserService.loginOrRegister).toHaveBeenCalledWith('test@example.com', 'password123');
                expect(generateAccessToken).toHaveBeenCalledWith({
                    userId: mockUser.id,
                    email: mockUser.email
                });
                expect(res.cookie).toHaveBeenCalledWith('authToken', mockJwtToken, {
                    httpOnly: true,
                    secure: false, // NODE_ENV !== 'production'
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000
                });
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Logged in successfully',
                    user: mockUser,
                    isNewUser: false
                });
            });

            it('should register new user successfully', async () => {
                // Arrange
                req.body = {
                    email: 'newuser@example.com',
                    password: 'newpassword123'
                };
                
                localUserService.loginOrRegister.mockResolvedValue({
                    success: true,
                    user: mockUser,
                    isNewUser: true
                });
                generateAccessToken.mockReturnValue(mockJwtToken);

                // Act
                await localLoginOrRegister(req, res);

                // Assert
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Account created and logged in successfully',
                    user: mockUser,
                    isNewUser: true
                });
            });

            it('should use secure cookie in production', async () => {
                // Arrange
                const originalEnv = process.env.NODE_ENV;
                process.env.NODE_ENV = 'production';
                
                req.body = {
                    email: 'test@example.com',
                    password: 'password123'
                };
                
                localUserService.loginOrRegister.mockResolvedValue({
                    success: true,
                    user: mockUser,
                    isNewUser: false
                });
                generateAccessToken.mockReturnValue(mockJwtToken);

                // Act
                await localLoginOrRegister(req, res);

                // Assert
                expect(res.cookie).toHaveBeenCalledWith('authToken', mockJwtToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000
                });

                // Cleanup
                process.env.NODE_ENV = originalEnv;
            });
        });

        describe('Validation Failures', () => {
            it('should handle invalid email format', async () => {
                // Arrange
                req.body = {
                    email: 'invalid-email',
                    password: 'password123'
                };

                // Act
                await localLoginOrRegister(req, res);

                // Assert
                expect(ErrorResponses.validation).toHaveBeenCalledWith(
                    res,
                    'Invalid request parameters',
                    expect.any(Array)
                );
                expect(localUserService.loginOrRegister).not.toHaveBeenCalled();
            });

            it('should handle short password', async () => {
                // Arrange
                req.body = {
                    email: 'test@example.com',
                    password: '123'
                };

                // Act
                await localLoginOrRegister(req, res);

                // Assert
                expect(ErrorResponses.validation).toHaveBeenCalled();
            });

            it('should handle additional email validation failure', async () => {
                // Arrange
                req.body = {
                    email: 'test@',
                    password: 'password123'
                };

                // Act
                await localLoginOrRegister(req, res);

                // Assert  
                expect(ErrorResponses.invalidInput).toHaveBeenCalledWith(res, 'Invalid email format');
            });
        });

        describe('Authentication Failures', () => {
            it('should handle login/register failure', async () => {
                // Arrange
                req.body = {
                    email: 'test@example.com',
                    password: 'password123'
                };
                
                localUserService.loginOrRegister.mockResolvedValue({
                    success: false,
                    message: 'Authentication failed'
                });

                // Act
                await localLoginOrRegister(req, res);

                // Assert
                expect(ErrorResponses.unauthorized).toHaveBeenCalledWith(res, 'Authentication failed');
                expect(generateAccessToken).not.toHaveBeenCalled();
            });

            it('should handle missing user in successful response', async () => {
                // Arrange
                req.body = {
                    email: 'test@example.com',
                    password: 'password123'
                };
                
                localUserService.loginOrRegister.mockResolvedValue({
                    success: true,
                    user: null,
                    isNewUser: false
                });

                // Act
                await localLoginOrRegister(req, res);

                // Assert
                expect(ErrorResponses.internal).toHaveBeenCalledWith(res, 'User authentication failed');
            });
        });

        describe('Error Handling', () => {
            it('should handle service errors', async () => {
                // Arrange
                req.body = {
                    email: 'test@example.com',
                    password: 'password123'
                };
                
                const serviceError = new Error('Database connection failed');
                localUserService.loginOrRegister.mockRejectedValue(serviceError);

                // Act
                await localLoginOrRegister(req, res);

                // Assert
                expect(ErrorResponses.internal).toHaveBeenCalledWith(res, 'An unexpected error occurred');
            });

            it('should handle JWT generation errors', async () => {
                // Arrange
                req.body = {
                    email: 'test@example.com',
                    password: 'password123'
                };
                
                localUserService.loginOrRegister.mockResolvedValue({
                    success: true,
                    user: mockUser,
                    isNewUser: false
                });
                
                const jwtError = new Error('JWT generation failed');
                generateAccessToken.mockImplementation(() => {
                    throw jwtError;
                });

                // Act
                await localLoginOrRegister(req, res);

                // Assert
                expect(ErrorResponses.internal).toHaveBeenCalledWith(res, 'An unexpected error occurred');
            });
        });

        describe('Edge Cases', () => {
            it('should handle missing request body', async () => {
                // Arrange
                req.body = {};

                // Act
                await localLoginOrRegister(req, res);

                // Assert
                expect(ErrorResponses.validation).toHaveBeenCalled();
            });

            it('should handle null request body', async () => {
                // Arrange
                req.body = null;

                // Act
                await localLoginOrRegister(req, res);

                // Assert
                expect(ErrorResponses.validation).toHaveBeenCalled();
            });
        });
    });

    describe('getEnvironmentInfo', () => {
        const mockConfig = {
            isLocalMode: true,
            localModeEnabled: true,
            environment: 'development'
        };

        describe('Success Cases', () => {
            it('should return environment configuration', async () => {
                // Arrange
                getLocalModeConfig.mockReturnValue(mockConfig);

                // Act
                await getEnvironmentInfo(req, res);

                // Assert
                expect(getLocalModeConfig).toHaveBeenCalled();
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    ...mockConfig
                });
            });
        });

        describe('Error Handling', () => {
            it('should handle config retrieval errors', async () => {
                // Arrange
                const configError = new Error('Config retrieval failed');
                getLocalModeConfig.mockImplementation(() => {
                    throw configError;
                });

                // Act
                await getEnvironmentInfo(req, res);

                // Assert
                expect(ErrorResponses.internal).toHaveBeenCalledWith(res, 'An unexpected error occurred');
            });
        });
    });

    describe('testCredentials', () => {
        const mockUser = global.testUtils.mockUser();

        describe('Success Cases', () => {
            it('should validate credentials successfully', async () => {
                // Arrange
                req.body = {
                    email: 'test@example.com',
                    password: 'password123'
                };
                
                localUserService.verifyCredentials.mockResolvedValue({
                    success: true,
                    user: mockUser
                });

                // Act
                await testCredentials(req, res);

                // Assert
                expect(localUserService.verifyCredentials).toHaveBeenCalledWith('test@example.com', 'password123');
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Credentials are valid',
                    user: mockUser
                });
            });
        });

        describe('Validation Failures', () => {
            it('should handle invalid credentials', async () => {
                // Arrange
                req.body = {
                    email: 'test@example.com',
                    password: 'wrongpassword'
                };
                
                localUserService.verifyCredentials.mockResolvedValue({
                    success: false,
                    message: 'Invalid credentials'
                });

                // Act
                await testCredentials(req, res);

                // Assert
                expect(ErrorResponses.unauthorized).toHaveBeenCalledWith(res, 'Invalid credentials');
            });

            it('should handle validation schema errors', async () => {
                // Arrange
                req.body = {
                    email: 'invalid-email',
                    password: 'pass'
                };

                // Act
                await testCredentials(req, res);

                // Assert
                expect(ErrorResponses.validation).toHaveBeenCalled();
                expect(localUserService.verifyCredentials).not.toHaveBeenCalled();
            });
        });

        describe('Error Handling', () => {
            it('should handle service errors', async () => {
                // Arrange
                req.body = {
                    email: 'test@example.com',
                    password: 'password123'
                };
                
                const serviceError = new Error('Service failed');
                localUserService.verifyCredentials.mockRejectedValue(serviceError);

                // Act
                await testCredentials(req, res);

                // Assert
                expect(ErrorResponses.internal).toHaveBeenCalledWith(res, 'An unexpected error occurred');
            });
        });
    });
});