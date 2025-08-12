/**
 * Error Response Utilities Tests
 * Tests for standardized error response functionality
 */

const {
    createErrorResponse,
    sendErrorResponse,
    ErrorResponses,
    formatZodErrors,
    errorHandler
} = require('../../src/utils/errorResponse');

describe('Error Response Utilities', () => {
    let req, res, next;

    beforeEach(() => {
        req = global.testUtils.mockRequest();
        res = global.testUtils.mockResponse();
        next = global.testUtils.mockNext();
        jest.clearAllMocks();
    });

    describe('createErrorResponse', () => {
        describe('Success Cases', () => {
            it('should create basic error response', () => {
                // Act
                const result = createErrorResponse(400, 'VALIDATION_ERROR', 'Invalid input');

                // Assert
                expect(result).toMatchObject({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid input',
                        timestamp: expect.any(String)
                    }
                });
                expect(new Date(result.error.timestamp)).toBeInstanceOf(Date);
            });

            it('should include optional details', () => {
                // Arrange
                const details = [
                    { field: 'email', message: 'Invalid email', code: 'invalid_string' }
                ];

                // Act
                const result = createErrorResponse(400, 'VALIDATION_ERROR', 'Invalid input', { details });

                // Assert
                expect(result.error.details).toEqual(details);
            });

            it('should include all optional fields when provided', () => {
                // Arrange
                const options = {
                    details: [{ field: 'test', message: 'test error', code: 'test' }],
                    instanceId: 'instance-123',
                    userId: 'user-456',
                    reason: 'Test reason',
                    expiresAt: '2024-12-31T23:59:59Z',
                    plan: 'premium',
                    currentCount: 5,
                    maxInstances: 10,
                    upgradeMessage: 'Please upgrade',
                    metadata: { key: 'value' }
                };

                // Act
                const result = createErrorResponse(400, 'TEST_ERROR', 'Test message', options);

                // Assert
                expect(result.error).toMatchObject({
                    code: 'TEST_ERROR',
                    message: 'Test message',
                    details: options.details,
                    instanceId: options.instanceId,
                    userId: options.userId,
                    reason: options.reason,
                    expiresAt: options.expiresAt,
                    plan: options.plan,
                    currentCount: options.currentCount,
                    maxInstances: options.maxInstances,
                    upgradeMessage: options.upgradeMessage,
                    metadata: options.metadata
                });
            });

            it('should handle zero values correctly', () => {
                // Arrange
                const options = {
                    currentCount: 0,
                    maxInstances: 0
                };

                // Act
                const result = createErrorResponse(400, 'TEST_ERROR', 'Test message', options);

                // Assert
                expect(result.error.currentCount).toBe(0);
                expect(result.error.maxInstances).toBe(0);
            });
        });

        describe('Edge Cases', () => {
            it('should handle empty options object', () => {
                // Act
                const result = createErrorResponse(500, 'INTERNAL_ERROR', 'Server error', {});

                // Assert
                expect(result.error).toMatchObject({
                    code: 'INTERNAL_ERROR',
                    message: 'Server error',
                    timestamp: expect.any(String)
                });
            });

            it('should handle undefined options', () => {
                // Act
                const result = createErrorResponse(500, 'INTERNAL_ERROR', 'Server error', undefined);

                // Assert
                expect(result.error).toMatchObject({
                    code: 'INTERNAL_ERROR',
                    message: 'Server error',
                    timestamp: expect.any(String)
                });
            });

            it('should ignore invalid details array', () => {
                // Act
                const result = createErrorResponse(400, 'VALIDATION_ERROR', 'Invalid input', { 
                    details: 'not-an-array' 
                });

                // Assert
                expect(result.error.details).toBeUndefined();
            });
        });
    });

    describe('sendErrorResponse', () => {
        it('should send error response with correct status and body', () => {
            // Act
            sendErrorResponse(res, 400, 'VALIDATION_ERROR', 'Invalid input');

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid input',
                    timestamp: expect.any(String)
                }
            });
        });

        it('should send error response with options', () => {
            // Arrange
            const options = { instanceId: 'test-123' };

            // Act
            sendErrorResponse(res, 404, 'NOT_FOUND', 'Resource not found', options);

            // Assert
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                error: {
                    code: 'NOT_FOUND',
                    message: 'Resource not found',
                    instanceId: 'test-123',
                    timestamp: expect.any(String)
                }
            });
        });
    });

    describe('ErrorResponses', () => {
        describe('Authentication & Authorization', () => {
            it('should handle unauthorized error', () => {
                // Act
                ErrorResponses.unauthorized(res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Authentication required',
                        timestamp: expect.any(String)
                    }
                });
            });

            it('should handle unauthorized with custom message', () => {
                // Act
                ErrorResponses.unauthorized(res, 'Custom auth message');

                // Assert
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Custom auth message',
                        timestamp: expect.any(String)
                    }
                });
            });

            it('should handle forbidden error', () => {
                // Act
                ErrorResponses.forbidden(res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(403);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'FORBIDDEN',
                        message: 'Access denied',
                        timestamp: expect.any(String)
                    }
                });
            });

            it('should handle invalid token error', () => {
                // Act
                ErrorResponses.invalidToken(res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'INVALID_AUTH_TOKEN',
                        message: 'Invalid or expired authentication token',
                        timestamp: expect.any(String)
                    }
                });
            });

            it('should handle missing token error', () => {
                // Act
                ErrorResponses.missingToken(res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'MISSING_AUTH_TOKEN',
                        message: 'Authentication token required',
                        timestamp: expect.any(String)
                    }
                });
            });
        });

        describe('Validation', () => {
            it('should handle validation error', () => {
                // Arrange
                const details = [
                    { field: 'email', message: 'Invalid email', code: 'invalid_string' }
                ];

                // Act
                ErrorResponses.validation(res, 'Validation failed', details);

                // Assert
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Validation failed',
                        details: details,
                        timestamp: expect.any(String)
                    }
                });
            });

            it('should handle bad request error', () => {
                // Act
                ErrorResponses.badRequest(res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'BAD_REQUEST',
                        message: 'Bad request',
                        timestamp: expect.any(String)
                    }
                });
            });

            it('should handle invalid input error', () => {
                // Act
                ErrorResponses.invalidInput(res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'INVALID_INPUT',
                        message: 'Invalid input provided',
                        timestamp: expect.any(String)
                    }
                });
            });

            it('should handle missing field error', () => {
                // Act
                ErrorResponses.missingField(res, 'email');

                // Assert
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'MISSING_FIELD',
                        message: "Required field 'email' is missing",
                        timestamp: expect.any(String)
                    }
                });
            });
        });

        describe('Resource Management', () => {
            it('should handle not found error', () => {
                // Act
                ErrorResponses.notFound(res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Resource not found',
                        timestamp: expect.any(String)
                    }
                });
            });

            it('should handle not found with custom resource', () => {
                // Act
                ErrorResponses.notFound(res, 'User');

                // Assert
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'NOT_FOUND',
                        message: 'User not found',
                        timestamp: expect.any(String)
                    }
                });
            });

            it('should handle already exists error', () => {
                // Act
                ErrorResponses.alreadyExists(res, 'User');

                // Assert
                expect(res.status).toHaveBeenCalledWith(409);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'ALREADY_EXISTS',
                        message: 'User already exists',
                        timestamp: expect.any(String)
                    }
                });
            });
        });

        describe('Instance-specific', () => {
            it('should handle instance not found error', () => {
                // Act
                ErrorResponses.instanceNotFound(res, 'instance-123');

                // Assert
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'INSTANCE_NOT_FOUND',
                        message: 'MCP instance not found or access denied',
                        instanceId: 'instance-123',
                        timestamp: expect.any(String)
                    }
                });
            });

            it('should handle instance unavailable error', () => {
                // Act
                ErrorResponses.instanceUnavailable(res, 'instance-123');

                // Assert
                expect(res.status).toHaveBeenCalledWith(502);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'INSTANCE_NOT_AVAILABLE',
                        message: 'MCP instance is not available or not running',
                        instanceId: 'instance-123',
                        timestamp: expect.any(String)
                    }
                });
            });
        });

        describe('Service Management', () => {
            it('should handle service disabled error', () => {
                // Act
                ErrorResponses.serviceDisabled(res, 'TestService');

                // Assert
                expect(res.status).toHaveBeenCalledWith(503);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'SERVICE_DISABLED',
                        message: 'TestService service is currently disabled',
                        timestamp: expect.any(String)
                    }
                });
            });

            it('should handle service unavailable error', () => {
                // Act
                ErrorResponses.serviceUnavailable(res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(503);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'SERVICE_UNAVAILABLE',
                        message: 'Service is temporarily unavailable',
                        timestamp: expect.any(String)
                    }
                });
            });
        });

        describe('Rate Limiting', () => {
            it('should handle rate limited error', () => {
                // Act
                ErrorResponses.rateLimited(res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(429);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'RATE_LIMITED',
                        message: 'Too many requests',
                        timestamp: expect.any(String)
                    }
                });
            });
        });

        describe('Server Errors', () => {
            it('should handle internal error', () => {
                // Act
                ErrorResponses.internal(res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: 'Internal server error',
                        timestamp: expect.any(String)
                    }
                });
            });

            it('should handle database error', () => {
                // Act
                ErrorResponses.databaseError(res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'DATABASE_ERROR',
                        message: 'Database operation failed',
                        timestamp: expect.any(String)
                    }
                });
            });
        });

        describe('External API Errors', () => {
            it('should handle external API error', () => {
                // Act
                ErrorResponses.externalApiError(res, 'GoogleAPI', 'Connection timeout');

                // Assert
                expect(res.status).toHaveBeenCalledWith(502);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'EXTERNAL_API_ERROR',
                        message: 'GoogleAPI: Connection timeout',
                        timestamp: expect.any(String)
                    }
                });
            });

            it('should handle invalid credentials error', () => {
                // Act
                ErrorResponses.credentialsInvalid(res, 'TestService');

                // Assert
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'INVALID_CREDENTIALS',
                        message: 'Invalid credentials for TestService',
                        timestamp: expect.any(String)
                    }
                });
            });
        });
    });

    describe('formatZodErrors', () => {
        it('should format Zod errors correctly', () => {
            // Arrange
            const zodError = {
                errors: [
                    {
                        path: ['email'],
                        message: 'Invalid email',
                        code: 'invalid_string'
                    },
                    {
                        path: ['password', 'length'],
                        message: 'Too short',
                        code: 'too_small'
                    }
                ]
            };

            // Act
            const result = formatZodErrors(zodError);

            // Assert
            expect(result).toEqual([
                {
                    field: 'email',
                    message: 'Invalid email',
                    code: 'invalid_string'
                },
                {
                    field: 'password.length',
                    message: 'Too short',
                    code: 'too_small'
                }
            ]);
        });

        it('should handle empty error array', () => {
            // Arrange
            const zodError = { errors: [] };

            // Act
            const result = formatZodErrors(zodError);

            // Assert
            expect(result).toEqual([]);
        });

        it('should handle nested paths', () => {
            // Arrange
            const zodError = {
                errors: [{
                    path: ['user', 'profile', 'settings', 'theme'],
                    message: 'Invalid theme',
                    code: 'invalid_enum'
                }]
            };

            // Act
            const result = formatZodErrors(zodError);

            // Assert
            expect(result).toEqual([{
                field: 'user.profile.settings.theme',
                message: 'Invalid theme',
                code: 'invalid_enum'
            }]);
        });
    });

    describe('errorHandler', () => {
        beforeEach(() => {
            console.error = jest.fn();
        });

        describe('Success Cases', () => {
            it('should handle ValidationError', () => {
                // Arrange
                const error = new Error('Validation failed');
                error.name = 'ValidationError';

                // Act
                errorHandler(error, req, res, next);

                // Assert
                expect(console.error).toHaveBeenCalledWith(
                    `Unhandled error on ${req.method} ${req.originalUrl}:`,
                    error
                );
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Validation failed',
                        details: [],
                        timestamp: expect.any(String)
                    }
                });
            });

            it('should handle UnauthorizedError', () => {
                // Arrange
                const error = new Error('Unauthorized access');
                error.name = 'UnauthorizedError';

                // Act
                errorHandler(error, req, res, next);

                // Assert
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Unauthorized access',
                        timestamp: expect.any(String)
                    }
                });
            });

            it('should handle generic errors as internal server error', () => {
                // Arrange
                const error = new Error('Something went wrong');

                // Act
                errorHandler(error, req, res, next);

                // Assert
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: 'An unexpected error occurred',
                        metadata: {
                            path: req.originalUrl,
                            method: req.method
                        },
                        timestamp: expect.any(String)
                    }
                });
            });
        });

        describe('Edge Cases', () => {
            it('should handle response already sent', () => {
                // Arrange
                const error = new Error('Test error');
                res.headersSent = true;

                // Act
                errorHandler(error, req, res, next);

                // Assert
                expect(next).toHaveBeenCalledWith(error);
                expect(res.status).not.toHaveBeenCalled();
                expect(res.json).not.toHaveBeenCalled();
            });

            it('should handle errors without message', () => {
                // Arrange
                const error = new Error();
                error.message = '';

                // Act
                errorHandler(error, req, res, next);

                // Assert
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: 'An unexpected error occurred',
                        metadata: {
                            path: req.originalUrl,
                            method: req.method
                        },
                        timestamp: expect.any(String)
                    }
                });
            });

            it('should handle non-Error objects', () => {
                // Arrange
                const error = 'String error';

                // Act
                errorHandler(error, req, res, next);

                // Assert
                expect(console.error).toHaveBeenCalledWith(
                    `Unhandled error on ${req.method} ${req.originalUrl}:`,
                    error
                );
                expect(res.status).toHaveBeenCalledWith(500);
            });
        });
    });

    describe('Integration Tests', () => {
        it('should work with all error types together', () => {
            // Test that all error response helpers work consistently
            const errorTypes = [
                () => ErrorResponses.unauthorized(res),
                () => ErrorResponses.forbidden(res),
                () => ErrorResponses.validation(res),
                () => ErrorResponses.notFound(res),
                () => ErrorResponses.internal(res),
                () => ErrorResponses.rateLimited(res)
            ];

            errorTypes.forEach(errorFn => {
                res.status.mockClear();
                res.json.mockClear();
                errorFn();
                
                expect(res.status).toHaveBeenCalledTimes(1);
                expect(res.json).toHaveBeenCalledTimes(1);
                
                const jsonCall = res.json.mock.calls[0][0];
                expect(jsonCall.error).toMatchObject({
                    code: expect.any(String),
                    message: expect.any(String),
                    timestamp: expect.any(String)
                });
            });
        });
    });
});