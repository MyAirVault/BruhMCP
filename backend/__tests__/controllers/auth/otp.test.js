/**
 * OTP Controller Tests
 * Tests for OTP generation, sending, and verification functionality
 */

// Mock dependencies first
jest.mock('../../../src/db/queries/authQueries');
jest.mock('../../../src/utils/otp');
jest.mock('../../../src/utils/jwt');

const { handleSendOTP, handleVerifyOTP } = require('../../../src/controllers/auth/otp');
const { findUserByEmail } = require('../../../src/db/queries/authQueries');
const { 
    generateOTPCode, 
    storeOTP, 
    verifyOTP, 
    checkOTPRateLimit, 
    sendOTPEmail 
} = require('../../../src/utils/otp');
const { 
    generateAccessToken, 
    generateRefreshToken
} = require('../../../src/utils/jwt');

describe('OTP Controller', () => {
    let req, res;
    
    beforeEach(() => {
        req = global.testUtils.mockRequest();
        res = global.testUtils.mockResponse();
        jest.clearAllMocks();
        console.error = jest.fn();
        console.debug = jest.fn();
    });

    describe('handleSendOTP', () => {
        const mockUser = {
            id: 'test-user-id-123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User'
        };

        describe('Success Cases', () => {
            it('should send OTP successfully', async () => {
                // Arrange
                req.body = { email: 'test@example.com' };
                
                findUserByEmail.mockResolvedValue(mockUser);
                checkOTPRateLimit.mockResolvedValue({
                    canRequest: true,
                    remainingRequests: 3,
                    message: 'OK'
                });
                generateOTPCode.mockReturnValue('123456');
                storeOTP.mockResolvedValue();
                sendOTPEmail.mockResolvedValue();

                // Act
                await handleSendOTP(req, res);

                // Assert
                expect(findUserByEmail).toHaveBeenCalledWith('test@example.com');
                expect(checkOTPRateLimit).toHaveBeenCalledWith(mockUser.id);
                expect(generateOTPCode).toHaveBeenCalled();
                expect(storeOTP).toHaveBeenCalledWith(mockUser.id, 'test@example.com', '123456');
                expect(sendOTPEmail).toHaveBeenCalledWith('test@example.com', '123456', 'verification');
                
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Verification code sent to your email',
                    data: {
                        remainingRequests: 2
                    }
                });
                expect(console.debug).toHaveBeenCalledWith('Send OTP process completed');
            });

            it('should handle case where user has different email case', async () => {
                // Arrange
                req.body = { email: 'TEST@EXAMPLE.COM' };
                
                findUserByEmail.mockResolvedValue(mockUser);
                checkOTPRateLimit.mockResolvedValue({
                    canRequest: true,
                    remainingRequests: 5,
                    message: 'OK'
                });
                generateOTPCode.mockReturnValue('654321');
                storeOTP.mockResolvedValue();
                sendOTPEmail.mockResolvedValue();

                // Act
                await handleSendOTP(req, res);

                // Assert
                expect(findUserByEmail).toHaveBeenCalledWith('TEST@EXAMPLE.COM');
                expect(storeOTP).toHaveBeenCalledWith(mockUser.id, 'TEST@EXAMPLE.COM', '654321');
                expect(sendOTPEmail).toHaveBeenCalledWith('TEST@EXAMPLE.COM', '654321', 'verification');
            });
        });

        describe('User Not Found Cases', () => {
            it('should return 404 when user does not exist', async () => {
                // Arrange
                req.body = { email: 'nonexistent@example.com' };
                findUserByEmail.mockResolvedValue(null);

                // Act
                await handleSendOTP(req, res);

                // Assert
                expect(findUserByEmail).toHaveBeenCalledWith('nonexistent@example.com');
                expect(checkOTPRateLimit).not.toHaveBeenCalled();
                expect(generateOTPCode).not.toHaveBeenCalled();
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'User not found'
                });
            });

            it('should return 404 when user is undefined', async () => {
                // Arrange
                req.body = { email: 'test@example.com' };
                findUserByEmail.mockResolvedValue(undefined);

                // Act
                await handleSendOTP(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'User not found'
                });
            });
        });

        describe('Rate Limit Cases', () => {
            it('should return 429 when rate limit exceeded', async () => {
                // Arrange
                req.body = { email: 'test@example.com' };
                
                findUserByEmail.mockResolvedValue(mockUser);
                checkOTPRateLimit.mockResolvedValue({
                    canRequest: false,
                    remainingRequests: 0,
                    message: 'Too many OTP requests. Please try again later.'
                });

                // Act
                await handleSendOTP(req, res);

                // Assert
                expect(findUserByEmail).toHaveBeenCalledWith('test@example.com');
                expect(checkOTPRateLimit).toHaveBeenCalledWith(mockUser.id);
                expect(generateOTPCode).not.toHaveBeenCalled();
                expect(storeOTP).not.toHaveBeenCalled();
                expect(sendOTPEmail).not.toHaveBeenCalled();
                
                expect(res.status).toHaveBeenCalledWith(429);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Too many OTP requests. Please try again later.'
                });
            });

            it('should handle different rate limit messages', async () => {
                // Arrange
                req.body = { email: 'test@example.com' };
                
                findUserByEmail.mockResolvedValue(mockUser);
                checkOTPRateLimit.mockResolvedValue({
                    canRequest: false,
                    remainingRequests: 0,
                    message: 'Rate limit exceeded. Wait 60 seconds.'
                });

                // Act
                await handleSendOTP(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(429);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Rate limit exceeded. Wait 60 seconds.'
                });
            });
        });

        describe('Error Handling', () => {
            it('should handle database errors', async () => {
                // Arrange
                req.body = { email: 'test@example.com' };
                const dbError = new Error('Database connection failed');
                findUserByEmail.mockRejectedValue(dbError);

                // Act
                await handleSendOTP(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('Send OTP failed:', 'Database connection failed');
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Failed to send verification code'
                });
                expect(console.debug).toHaveBeenCalledWith('Send OTP process completed');
            });

            it('should handle OTP generation errors', async () => {
                // Arrange
                req.body = { email: 'test@example.com' };
                
                findUserByEmail.mockResolvedValue(mockUser);
                checkOTPRateLimit.mockResolvedValue({
                    canRequest: true,
                    remainingRequests: 3,
                    message: 'OK'
                });
                generateOTPCode.mockImplementation(() => {
                    throw new Error('OTP generation failed');
                });

                // Act
                await handleSendOTP(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('Send OTP failed:', 'OTP generation failed');
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Failed to send verification code'
                });
            });

            it('should handle OTP storage errors', async () => {
                // Arrange
                req.body = { email: 'test@example.com' };
                
                findUserByEmail.mockResolvedValue(mockUser);
                checkOTPRateLimit.mockResolvedValue({
                    canRequest: true,
                    remainingRequests: 3,
                    message: 'OK'
                });
                generateOTPCode.mockReturnValue('123456');
                storeOTP.mockRejectedValue(new Error('Failed to store OTP'));

                // Act
                await handleSendOTP(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('Send OTP failed:', 'Failed to store OTP');
                expect(res.status).toHaveBeenCalledWith(500);
            });

            it('should handle email sending errors', async () => {
                // Arrange
                req.body = { email: 'test@example.com' };
                
                findUserByEmail.mockResolvedValue(mockUser);
                checkOTPRateLimit.mockResolvedValue({
                    canRequest: true,
                    remainingRequests: 3,
                    message: 'OK'
                });
                generateOTPCode.mockReturnValue('123456');
                storeOTP.mockResolvedValue();
                sendOTPEmail.mockRejectedValue(new Error('Email service failed'));

                // Act
                await handleSendOTP(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('Send OTP failed:', 'Email service failed');
                expect(res.status).toHaveBeenCalledWith(500);
            });

            it('should handle non-Error exceptions', async () => {
                // Arrange
                req.body = { email: 'test@example.com' };
                findUserByEmail.mockRejectedValue('String error');

                // Act
                await handleSendOTP(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('Send OTP failed:', 'String error');
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Failed to send verification code'
                });
            });
        });
    });

    describe('handleVerifyOTP', () => {
        const mockUser = {
            id: 'test-user-id-123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            isVerified: true
        };

        describe('Success Cases', () => {
            it('should verify OTP successfully and generate tokens', async () => {
                // Arrange
                req.body = { email: 'test@example.com', otp: '123456' };
                
                verifyOTP.mockResolvedValue({
                    success: true,
                    message: 'OTP verified successfully',
                    user: mockUser
                });
                generateAccessToken.mockReturnValue('mock-access-token');
                generateRefreshToken.mockResolvedValue('mock-refresh-token');

                // Act
                await handleVerifyOTP(req, res);

                // Assert
                expect(verifyOTP).toHaveBeenCalledWith('test@example.com', '123456');
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
                    message: 'Email verified and login successful',
                    data: {
                        user: {
                            id: mockUser.id,
                            email: mockUser.email,
                            firstName: mockUser.firstName,
                            lastName: mockUser.lastName,
                            isVerified: mockUser.isVerified
                        },
                        tokens: {
                            accessToken: 'mock-access-token',
                            refreshToken: 'mock-refresh-token'
                        },
                        verificationCompleted: true,
                        loginMethod: 'otp_verification'
                    }
                });
                expect(console.debug).toHaveBeenCalledWith('OTP verification process completed');
            });

            it('should handle user with different name formats', async () => {
                // Arrange
                req.body = { email: 'test@example.com', otp: '123456' };
                
                const userWithoutLastName = {
                    ...mockUser,
                    lastName: null
                };
                
                verifyOTP.mockResolvedValue({
                    success: true,
                    message: 'OTP verified successfully',
                    user: userWithoutLastName
                });
                generateAccessToken.mockReturnValue('mock-access-token');
                generateRefreshToken.mockResolvedValue('mock-refresh-token');

                // Act
                await handleVerifyOTP(req, res);

                // Assert
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Email verified and login successful',
                    data: expect.objectContaining({
                        user: expect.objectContaining({
                            lastName: null
                        })
                    })
                });
            });
        });

        describe('OTP Verification Failures', () => {
            it('should return 400 when OTP verification fails', async () => {
                // Arrange
                req.body = { email: 'test@example.com', otp: '999999' };
                
                verifyOTP.mockResolvedValue({
                    success: false,
                    message: 'Invalid OTP code'
                });

                // Act
                await handleVerifyOTP(req, res);

                // Assert
                expect(verifyOTP).toHaveBeenCalledWith('test@example.com', '999999');
                expect(generateAccessToken).not.toHaveBeenCalled();
                expect(generateRefreshToken).not.toHaveBeenCalled();
                
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Invalid OTP code'
                });
            });

            it('should handle expired OTP', async () => {
                // Arrange
                req.body = { email: 'test@example.com', otp: '123456' };
                
                verifyOTP.mockResolvedValue({
                    success: false,
                    message: 'OTP has expired'
                });

                // Act
                await handleVerifyOTP(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'OTP has expired'
                });
            });

            it('should handle multiple failed attempts', async () => {
                // Arrange
                req.body = { email: 'test@example.com', otp: '123456' };
                
                verifyOTP.mockResolvedValue({
                    success: false,
                    message: 'Too many failed attempts. OTP blocked.'
                });

                // Act
                await handleVerifyOTP(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Too many failed attempts. OTP blocked.'
                });
            });
        });

        describe('Missing User Data Cases', () => {
            it('should return 500 when verification succeeds but user data is missing', async () => {
                // Arrange
                req.body = { email: 'test@example.com', otp: '123456' };
                
                verifyOTP.mockResolvedValue({
                    success: true,
                    message: 'OTP verified successfully',
                    user: null
                });

                // Act
                await handleVerifyOTP(req, res);

                // Assert
                expect(verifyOTP).toHaveBeenCalledWith('test@example.com', '123456');
                expect(generateAccessToken).not.toHaveBeenCalled();
                expect(generateRefreshToken).not.toHaveBeenCalled();
                
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Verification successful but user data missing'
                });
            });

            it('should return 500 when user data is undefined', async () => {
                // Arrange
                req.body = { email: 'test@example.com', otp: '123456' };
                
                verifyOTP.mockResolvedValue({
                    success: true,
                    message: 'OTP verified successfully'
                    // Missing user field
                });

                // Act
                await handleVerifyOTP(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Verification successful but user data missing'
                });
            });
        });

        describe('Token Generation Errors', () => {
            it('should handle access token generation errors', async () => {
                // Arrange
                req.body = { email: 'test@example.com', otp: '123456' };
                
                verifyOTP.mockResolvedValue({
                    success: true,
                    message: 'OTP verified successfully',
                    user: mockUser
                });
                generateAccessToken.mockImplementation(() => {
                    throw new Error('Access token generation failed');
                });

                // Act
                await handleVerifyOTP(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('OTP verification failed:', 'Access token generation failed');
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Email verification failed'
                });
            });

            it('should handle refresh token generation errors', async () => {
                // Arrange
                req.body = { email: 'test@example.com', otp: '123456' };
                
                verifyOTP.mockResolvedValue({
                    success: true,
                    message: 'OTP verified successfully',
                    user: mockUser
                });
                generateAccessToken.mockReturnValue('mock-access-token');
                generateRefreshToken.mockRejectedValue(new Error('Refresh token generation failed'));

                // Act
                await handleVerifyOTP(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('OTP verification failed:', 'Refresh token generation failed');
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Email verification failed'
                });
            });
        });

        describe('Database and Service Errors', () => {
            it('should handle OTP verification service errors', async () => {
                // Arrange
                req.body = { email: 'test@example.com', otp: '123456' };
                verifyOTP.mockRejectedValue(new Error('OTP verification service error'));

                // Act
                await handleVerifyOTP(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('OTP verification failed:', 'OTP verification service error');
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Email verification failed'
                });
                expect(console.debug).toHaveBeenCalledWith('OTP verification process completed');
            });

            it('should handle non-Error exceptions', async () => {
                // Arrange
                req.body = { email: 'test@example.com', otp: '123456' };
                verifyOTP.mockRejectedValue('String error in verification');

                // Act
                await handleVerifyOTP(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('OTP verification failed:', 'String error in verification');
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Email verification failed'
                });
            });
        });

        describe('Edge Cases', () => {
            it('should handle empty request body', async () => {
                // Arrange
                req.body = {};
                verifyOTP.mockResolvedValue({
                    success: false,
                    message: 'Missing email or OTP'
                });

                // Act
                await handleVerifyOTP(req, res);

                // Assert
                expect(verifyOTP).toHaveBeenCalledWith(undefined, undefined);
                expect(res.status).toHaveBeenCalledWith(400);
            });

            it('should handle null values in request', async () => {
                // Arrange
                req.body = { email: null, otp: null };
                verifyOTP.mockResolvedValue({
                    success: false,
                    message: 'Invalid email or OTP format'
                });

                // Act
                await handleVerifyOTP(req, res);

                // Assert
                expect(verifyOTP).toHaveBeenCalledWith(null, null);
                expect(res.status).toHaveBeenCalledWith(400);
            });
        });
    });
});