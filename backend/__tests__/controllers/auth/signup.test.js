/**
 * Authentication Signup Controller Tests
 * Tests for user registration functionality
 */

// Mock dependencies before importing the controller
jest.mock('../../../src/db/queries/authQueries');
jest.mock('../../../src/db/queries/tokenQueries');
jest.mock('../../../src/utils/password');
jest.mock('../../../src/utils/otp');

const { createUser, findUserByEmail, checkUserExists } = require('../../../src/db/queries/authQueries');
const { storeOTPToken } = require('../../../src/db/queries/tokenQueries');
const { hashPassword } = require('../../../src/utils/password');
const { generateOTPCode, storeOTP, sendOTPEmail } = require('../../../src/utils/otp');

// Import controller after mocking dependencies
const { handleSignup, handleResendSignupOTP } = require('../../../src/controllers/auth/signup');

describe('Signup Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = global.testUtils.mockRequest({
            body: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'securePassword123'
            }
        });
        res = global.testUtils.mockResponse();
        next = global.testUtils.mockNext();

        // Reset mocks
        jest.clearAllMocks();
        
        // Ensure mocks are reset to default implementations
        checkUserExists.mockReset();
        createUser.mockReset();
        hashPassword.mockReset();
        generateOTPCode.mockReset();
        storeOTP.mockReset();
        sendOTPEmail.mockReset();
    });

    describe('handleSignup', () => {
        const mockNewUser = { id: 'new-user-id-123' };
        const mockOTPCode = '123456';
        const mockPasswordHash = '$2b$10$mock.hash.value';

        describe('Success Cases', () => {
            it('should create new user successfully', async () => {
                // Arrange
                checkUserExists.mockResolvedValue(null);
                hashPassword.mockResolvedValue(mockPasswordHash);
                createUser.mockResolvedValue(mockNewUser);
                generateOTPCode.mockReturnValue(mockOTPCode);
                storeOTP.mockResolvedValue();
                sendOTPEmail.mockResolvedValue();

                // Act
                await handleSignup(req, res);

                // Assert
                expect(checkUserExists).toHaveBeenCalledWith('john@example.com');
                expect(hashPassword).toHaveBeenCalledWith('securePassword123');
                expect(createUser).toHaveBeenCalledWith({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@example.com',
                    passwordHash: mockPasswordHash,
                    isVerified: false
                });
                expect(generateOTPCode).toHaveBeenCalled();
                expect(storeOTP).toHaveBeenCalledWith(mockNewUser.id, 'john@example.com', mockOTPCode);
                expect(sendOTPEmail).toHaveBeenCalledWith('john@example.com', mockOTPCode, 'signup_verification');
                
                expect(res.status).toHaveBeenCalledWith(201);
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Account created! Please check your email and enter the verification code to complete setup.',
                    data: {
                        userId: mockNewUser.id,
                        email: 'john@example.com',
                        requiresVerification: true,
                        step: 'email_verification',
                        isExistingUser: false
                    }
                });
            });

            it('should handle existing unverified user', async () => {
                // Arrange
                const existingUser = { id: 'existing-user-id', isVerified: false };
                checkUserExists.mockResolvedValue(existingUser);
                generateOTPCode.mockReturnValue(mockOTPCode);
                storeOTP.mockResolvedValue();
                sendOTPEmail.mockResolvedValue();

                // Act
                await handleSignup(req, res);

                // Assert
                expect(checkUserExists).toHaveBeenCalledWith('john@example.com');
                expect(hashPassword).not.toHaveBeenCalled();
                expect(createUser).not.toHaveBeenCalled();
                expect(generateOTPCode).toHaveBeenCalled();
                expect(storeOTP).toHaveBeenCalledWith(existingUser.id, 'john@example.com', mockOTPCode);
                expect(sendOTPEmail).toHaveBeenCalledWith('john@example.com', mockOTPCode, 'signup_verification');
                
                expect(res.status).toHaveBeenCalledWith(201);
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Account exists but not verified. A new verification code has been sent to your email.',
                    data: {
                        userId: existingUser.id,
                        email: 'john@example.com',
                        requiresVerification: true,
                        step: 'email_verification',
                        isExistingUser: true
                    }
                });
            });

            it('should handle signup without lastName', async () => {
                // Arrange
                req.body.lastName = undefined;
                checkUserExists.mockResolvedValue(null);
                hashPassword.mockResolvedValue(mockPasswordHash);
                createUser.mockResolvedValue(mockNewUser);
                generateOTPCode.mockReturnValue(mockOTPCode);
                storeOTP.mockResolvedValue();
                sendOTPEmail.mockResolvedValue();

                // Act
                await handleSignup(req, res);

                // Assert
                expect(createUser).toHaveBeenCalledWith({
                    firstName: 'John',
                    lastName: '',
                    email: 'john@example.com',
                    passwordHash: mockPasswordHash,
                    isVerified: false
                });
            });

            it('should normalize email to lowercase', async () => {
                // Arrange
                req.body.email = 'JOHN@EXAMPLE.COM';
                checkUserExists.mockResolvedValue(null);
                hashPassword.mockResolvedValue(mockPasswordHash);
                createUser.mockResolvedValue(mockNewUser);
                generateOTPCode.mockReturnValue(mockOTPCode);
                storeOTP.mockResolvedValue();
                sendOTPEmail.mockResolvedValue();

                // Act
                await handleSignup(req, res);

                // Assert
                expect(checkUserExists).toHaveBeenCalledWith('JOHN@EXAMPLE.COM');
                expect(createUser).toHaveBeenCalledWith({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@example.com',
                    passwordHash: mockPasswordHash,
                    isVerified: false
                });
            });
        });

        describe('Validation Failures', () => {
            it('should reject signup with missing firstName', async () => {
                // Arrange
                req.body.firstName = undefined;

                // Act
                await handleSignup(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Required fields are missing: firstName, email, and password are required'
                });
                expect(checkUserExists).not.toHaveBeenCalled();
            });

            it('should reject signup with missing email', async () => {
                // Arrange
                req.body.email = undefined;

                // Act
                await handleSignup(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Required fields are missing: firstName, email, and password are required'
                });
            });

            it('should reject signup with missing password', async () => {
                // Arrange
                req.body.password = undefined;

                // Act
                await handleSignup(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Required fields are missing: firstName, email, and password are required'
                });
            });

            it('should reject signup with empty string fields', async () => {
                // Arrange
                req.body = {
                    firstName: '',
                    email: '',
                    password: ''
                };

                // Act
                await handleSignup(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Required fields are missing: firstName, email, and password are required'
                });
            });
        });

        describe('Business Logic Failures', () => {
            it('should reject signup for verified existing user', async () => {
                // Arrange
                const verifiedUser = { id: 'existing-user-id', isVerified: true };
                checkUserExists.mockResolvedValue(verifiedUser);

                // Act
                await handleSignup(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(409);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'User with this email already exists and is verified. Please try logging in instead.'
                });
                expect(createUser).not.toHaveBeenCalled();
            });
        });

        describe('Error Handling', () => {
            it('should handle database errors during user check', async () => {
                // Arrange
                const dbError = new Error('Database connection failed');
                checkUserExists.mockRejectedValue(dbError);

                // Act
                await handleSignup(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Account creation failed. Please try again.'
                });
            });

            it('should handle password hashing errors', async () => {
                // Arrange
                checkUserExists.mockResolvedValue(null);
                const hashError = new Error('Hashing failed');
                hashPassword.mockRejectedValue(hashError);

                // Act
                await handleSignup(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Account creation failed. Please try again.'
                });
            });

            it('should handle user creation errors', async () => {
                // Arrange
                checkUserExists.mockResolvedValue(null);
                hashPassword.mockResolvedValue(mockPasswordHash);
                const createError = new Error('User creation failed');
                createUser.mockRejectedValue(createError);

                // Act
                await handleSignup(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Account creation failed. Please try again.'
                });
            });

            it('should handle OTP generation/storage errors', async () => {
                // Arrange
                checkUserExists.mockResolvedValue(null);
                hashPassword.mockResolvedValue(mockPasswordHash);
                createUser.mockResolvedValue(mockNewUser);
                generateOTPCode.mockReturnValue(mockOTPCode);
                const otpError = new Error('OTP storage failed');
                storeOTP.mockRejectedValue(otpError);

                // Act
                await handleSignup(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Account creation failed. Please try again.'
                });
            });

            it('should handle email sending errors', async () => {
                // Arrange
                checkUserExists.mockResolvedValue(null);
                hashPassword.mockResolvedValue(mockPasswordHash);
                createUser.mockResolvedValue(mockNewUser);
                generateOTPCode.mockReturnValue(mockOTPCode);
                storeOTP.mockResolvedValue();
                const emailError = new Error('Email sending failed');
                sendOTPEmail.mockRejectedValue(emailError);

                // Act
                await handleSignup(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Account creation failed. Please try again.'
                });
            });

            it('should handle user creation returning null id', async () => {
                // Arrange
                checkUserExists.mockResolvedValue(null);
                hashPassword.mockResolvedValue(mockPasswordHash);
                createUser.mockResolvedValue({ id: null });

                // Act
                await handleSignup(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Account creation failed. Please try again.'
                });
            });
        });
    });

    describe('handleResendSignupOTP', () => {
        beforeEach(() => {
            req.body = { email: 'john@example.com' };
        });

        const mockOTPCode = '654321';

        describe('Success Cases', () => {
            it('should resend OTP for unverified user', async () => {
                // Arrange
                const unverifiedUser = { id: 'user-id-123', isVerified: false };
                checkUserExists.mockResolvedValue(unverifiedUser);
                generateOTPCode.mockReturnValue(mockOTPCode);
                storeOTP.mockResolvedValue();
                sendOTPEmail.mockResolvedValue();

                // Act
                await handleResendSignupOTP(req, res);

                // Assert
                expect(checkUserExists).toHaveBeenCalledWith('john@example.com');
                expect(generateOTPCode).toHaveBeenCalled();
                expect(storeOTP).toHaveBeenCalledWith(unverifiedUser.id, 'john@example.com', mockOTPCode);
                expect(sendOTPEmail).toHaveBeenCalledWith('john@example.com', mockOTPCode, 'signup_verification');
                
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.json).toHaveBeenCalledWith({
                    success: true,
                    message: 'Verification code resent successfully. Please check your email.',
                    data: {
                        email: 'john@example.com',
                        step: 'email_verification'
                    }
                });
            });
        });

        describe('Validation Failures', () => {
            it('should reject resend with missing email', async () => {
                // Arrange
                req.body.email = undefined;

                // Act
                await handleResendSignupOTP(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Email is required'
                });
                expect(checkUserExists).not.toHaveBeenCalled();
            });
        });

        describe('Business Logic Failures', () => {
            it('should reject resend for non-existent user', async () => {
                // Arrange
                checkUserExists.mockResolvedValue(null);

                // Act
                await handleResendSignupOTP(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'No account found with this email address. Please sign up first.'
                });
            });

            it('should reject resend for already verified user', async () => {
                // Arrange
                const verifiedUser = { id: 'user-id-123', isVerified: true };
                checkUserExists.mockResolvedValue(verifiedUser);

                // Act
                await handleResendSignupOTP(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Your account is already verified. Please try logging in instead.'
                });
            });
        });

        describe('Error Handling', () => {
            it('should handle database errors during user lookup', async () => {
                // Arrange
                const dbError = new Error('Database connection failed');
                checkUserExists.mockRejectedValue(dbError);

                // Act
                await handleResendSignupOTP(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Failed to resend verification code. Please try again.'
                });
            });

            it('should handle OTP storage errors', async () => {
                // Arrange
                const unverifiedUser = { id: 'user-id-123', isVerified: false };
                checkUserExists.mockResolvedValue(unverifiedUser);
                generateOTPCode.mockReturnValue(mockOTPCode);
                const otpError = new Error('OTP storage failed');
                storeOTP.mockRejectedValue(otpError);

                // Act
                await handleResendSignupOTP(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Failed to resend verification code. Please try again.'
                });
            });

            it('should handle email sending errors', async () => {
                // Arrange
                const unverifiedUser = { id: 'user-id-123', isVerified: false };
                checkUserExists.mockResolvedValue(unverifiedUser);
                generateOTPCode.mockReturnValue(mockOTPCode);
                storeOTP.mockResolvedValue();
                const emailError = new Error('Email sending failed');
                sendOTPEmail.mockRejectedValue(emailError);

                // Act
                await handleResendSignupOTP(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    success: false,
                    message: 'Failed to resend verification code. Please try again.'
                });
            });
        });
    });
});