/**
 * Store API Key Controller Tests
 * Tests for storing API key functionality
 */

// Mock dependencies first
jest.mock('../../../src/db/queries/apiKeysQueries.js');
jest.mock('../../../src/db/queries/mcpTypesQueries.js');
jest.mock('../../../src/controllers/apiKeys/schemas.js');

const { storeAPIKeyHandler } = require('../../../src/controllers/apiKeys/storeAPIKey');
const { storeAPIKey } = require('../../../src/db/queries/apiKeysQueries.js');
const { getMCPTypeById } = require('../../../src/db/queries/mcpTypesQueries.js');
const { storeAPIKeySchema } = require('../../../src/controllers/apiKeys/schemas.js');

describe('Store API Key Controller', () => {
    let req, res;
    
    beforeEach(() => {
        req = global.testUtils.mockRequest();
        res = global.testUtils.mockResponse();
        jest.clearAllMocks();
        console.error = jest.fn();
        
        // Mock successful validation by default
        storeAPIKeySchema.safeParse = jest.fn().mockReturnValue({
            success: true,
            data: {
                mcp_type_id: 'test-mcp-type-id',
                credentials: { api_key: 'test-api-key' }
            }
        });
    });

    describe('storeAPIKeyHandler', () => {
        describe('Success Cases', () => {
            it('should store API key successfully with mock response', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                req.user = { id: mockUserId };
                req.body = {
                    mcp_type_id: 'test-mcp-type-id',
                    credentials: { api_key: 'test-api-key' }
                };

                const mockMcpType = {
                    mcp_service_id: 'test-service-id',
                    mcp_service_name: 'openai',
                    display_name: 'OpenAI'
                };

                getMCPTypeById.mockResolvedValue(mockMcpType);
                storeAPIKey.mockResolvedValue({ id: 'new-api-key-id' });

                // Act
                await storeAPIKeyHandler(req, res);

                // Assert
                expect(storeAPIKeySchema.safeParse).toHaveBeenCalledWith(req.body);
                expect(getMCPTypeById).toHaveBeenCalledWith('test-mcp-type-id');
                expect(storeAPIKey).toHaveBeenCalledWith({
                    user_id: mockUserId,
                    mcp_type_id: 'test-mcp-type-id',
                    credentials: { api_key: 'test-api-key' }
                });
                
                expect(res.status).toHaveBeenCalledWith(201);
                expect(res.json).toHaveBeenCalledWith({
                    data: expect.objectContaining({
                        id: 'mock-id',
                        mcp_type_id: 'test-mcp-type-id',
                        mcp_type: {
                            id: 'test-service-id',
                            name: 'openai',
                            display_name: 'OpenAI'
                        },
                        is_active: true,
                        message: 'Credentials stored successfully'
                    })
                });
            });

            it('should handle storeAPIKey function that returns mock data', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                req.user = { id: mockUserId };
                req.body = {
                    mcp_type_id: 'test-mcp-type-id',
                    credentials: { token: 'test-token' }
                };

                const mockMcpType = {
                    mcp_service_id: 'test-service-id',
                    mcp_service_name: 'anthropic',
                    display_name: 'Anthropic'
                };

                getMCPTypeById.mockResolvedValue(mockMcpType);
                storeAPIKey.mockResolvedValue({});

                // Act
                await storeAPIKeyHandler(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(201);
                expect(res.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: expect.objectContaining({
                            mcp_type: {
                                id: 'test-service-id',
                                name: 'anthropic',
                                display_name: 'Anthropic'
                            }
                        })
                    })
                );
            });
        });

        describe('User Authentication Failures', () => {
            it('should return error when user ID is missing', async () => {
                // Arrange
                req.user = null;

                // Act
                await storeAPIKeyHandler(req, res);

                // Assert
                expect(storeAPIKeySchema.safeParse).not.toHaveBeenCalled();
                expect(getMCPTypeById).not.toHaveBeenCalled();
                expect(storeAPIKey).not.toHaveBeenCalled();
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'User was not found!'
                    }
                });
            });

            it('should return error when user object exists but ID is missing', async () => {
                // Arrange
                req.user = {};

                // Act
                await storeAPIKeyHandler(req, res);

                // Assert
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'User was not found!'
                    }
                });
            });

            it('should return error when user ID is empty string', async () => {
                // Arrange
                req.user = { id: '' };

                // Act
                await storeAPIKeyHandler(req, res);

                // Assert
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'User was not found!'
                    }
                });
            });
        });

        describe('Validation Failures', () => {
            it('should return error when validation fails', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                req.user = { id: mockUserId };
                req.body = {
                    mcp_type_id: 'invalid',
                    credentials: {}
                };

                storeAPIKeySchema.safeParse.mockReturnValue({
                    success: false,
                    error: {
                        errors: [
                            {
                                path: ['mcp_type_id'],
                                message: 'MCP type ID must be a valid UUID'
                            },
                            {
                                path: ['credentials'],
                                message: 'At least one credential is required'
                            }
                        ]
                    }
                });

                // Act
                await storeAPIKeyHandler(req, res);

                // Assert
                expect(storeAPIKeySchema.safeParse).toHaveBeenCalledWith(req.body);
                expect(getMCPTypeById).not.toHaveBeenCalled();
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid request parameters',
                        details: [
                            {
                                field: 'mcp_type_id',
                                message: 'MCP type ID must be a valid UUID'
                            },
                            {
                                field: 'credentials',
                                message: 'At least one credential is required'
                            }
                        ]
                    }
                });
            });

            it('should handle nested validation path correctly', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                req.user = { id: mockUserId };

                storeAPIKeySchema.safeParse.mockReturnValue({
                    success: false,
                    error: {
                        errors: [
                            {
                                path: ['credentials', 'api_key'],
                                message: 'API key must be a string'
                            }
                        ]
                    }
                });

                // Act
                await storeAPIKeyHandler(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid request parameters',
                        details: [
                            {
                                field: 'credentials.api_key',
                                message: 'API key must be a string'
                            }
                        ]
                    }
                });
            });
        });

        describe('MCP Type Validation', () => {
            it('should return error when MCP type not found', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                req.user = { id: mockUserId };
                req.body = {
                    mcp_type_id: 'non-existent-type',
                    credentials: { api_key: 'test-key' }
                };

                storeAPIKeySchema.safeParse.mockReturnValue({
                    success: true,
                    data: req.body
                });

                getMCPTypeById.mockResolvedValue(null);

                // Act
                await storeAPIKeyHandler(req, res);

                // Assert
                expect(getMCPTypeById).toHaveBeenCalledWith('non-existent-type');
                expect(storeAPIKey).not.toHaveBeenCalled();
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'NOT_FOUND',
                        message: 'MCP type not found'
                    }
                });
            });

            it('should return error when MCP type is undefined', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                req.user = { id: mockUserId };

                storeAPIKeySchema.safeParse.mockReturnValue({
                    success: true,
                    data: {
                        mcp_type_id: 'test-type-id',
                        credentials: { api_key: 'test-key' }
                    }
                });

                getMCPTypeById.mockResolvedValue(undefined);

                // Act
                await storeAPIKeyHandler(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'NOT_FOUND',
                        message: 'MCP type not found'
                    }
                });
            });
        });

        describe('API Key Storage Handling', () => {
            it('should handle "Use createMCP endpoint instead" error correctly', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                req.user = { id: mockUserId };

                storeAPIKeySchema.safeParse.mockReturnValue({
                    success: true,
                    data: {
                        mcp_type_id: 'test-type-id',
                        credentials: { api_key: 'test-key' }
                    }
                });

                const mockMcpType = {
                    mcp_service_id: 'test-service-id',
                    mcp_service_name: 'openai',
                    display_name: 'OpenAI'
                };

                getMCPTypeById.mockResolvedValue(mockMcpType);
                storeAPIKey.mockRejectedValue(new Error('Use createMCP endpoint instead'));

                // Act
                await storeAPIKeyHandler(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(501);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'NOT_IMPLEMENTED',
                        message: 'Use createMCP endpoint instead for storing API keys'
                    }
                });
            });

            it('should rethrow non-specific storage errors', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                req.user = { id: mockUserId };

                storeAPIKeySchema.safeParse.mockReturnValue({
                    success: true,
                    data: {
                        mcp_type_id: 'test-type-id',
                        credentials: { api_key: 'test-key' }
                    }
                });

                const mockMcpType = {
                    mcp_service_id: 'test-service-id',
                    mcp_service_name: 'openai',
                    display_name: 'OpenAI'
                };

                getMCPTypeById.mockResolvedValue(mockMcpType);
                const dbError = new Error('Database connection failed');
                storeAPIKey.mockRejectedValue(dbError);

                // Act
                await storeAPIKeyHandler(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('Error storing API key:', dbError);
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: 'Failed to store API key',
                        details: { error: 'Database connection failed' }
                    }
                });
            });

            it('should handle non-Error exceptions from storeAPIKey', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                req.user = { id: mockUserId };

                storeAPIKeySchema.safeParse.mockReturnValue({
                    success: true,
                    data: {
                        mcp_type_id: 'test-type-id',
                        credentials: { api_key: 'test-key' }
                    }
                });

                const mockMcpType = {
                    mcp_service_id: 'test-service-id',
                    mcp_service_name: 'openai',
                    display_name: 'OpenAI'
                };

                getMCPTypeById.mockResolvedValue(mockMcpType);
                storeAPIKey.mockRejectedValue('String error from storeAPIKey');

                // Act
                await storeAPIKeyHandler(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: 'Failed to store API key',
                        details: { error: 'Unknown error occurred' }
                    }
                });
            });
        });

        describe('Database Error Handling', () => {
            it('should handle MCP type lookup errors', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                req.user = { id: mockUserId };

                storeAPIKeySchema.safeParse.mockReturnValue({
                    success: true,
                    data: {
                        mcp_type_id: 'test-type-id',
                        credentials: { api_key: 'test-key' }
                    }
                });

                const dbError = new Error('Database connection failed');
                getMCPTypeById.mockRejectedValue(dbError);

                // Act
                await storeAPIKeyHandler(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('Error storing API key:', dbError);
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: 'Failed to store API key',
                        details: { error: 'Database connection failed' }
                    }
                });
            });

            it('should handle non-Error exceptions from getMCPTypeById', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                req.user = { id: mockUserId };

                storeAPIKeySchema.safeParse.mockReturnValue({
                    success: true,
                    data: {
                        mcp_type_id: 'test-type-id',
                        credentials: { api_key: 'test-key' }
                    }
                });

                getMCPTypeById.mockRejectedValue('String error from MCP lookup');

                // Act
                await storeAPIKeyHandler(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: 'Failed to store API key',
                        details: { error: 'Unknown error occurred' }
                    }
                });
            });
        });

        describe('Edge Cases', () => {
            it('should handle credentials with multiple keys', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                req.user = { id: mockUserId };

                const complexCredentials = {
                    api_key: 'test-api-key',
                    secret_key: 'test-secret-key',
                    endpoint: 'https://api.example.com'
                };

                storeAPIKeySchema.safeParse.mockReturnValue({
                    success: true,
                    data: {
                        mcp_type_id: 'test-type-id',
                        credentials: complexCredentials
                    }
                });

                const mockMcpType = {
                    mcp_service_id: 'test-service-id',
                    mcp_service_name: 'complex-service',
                    display_name: 'Complex Service'
                };

                getMCPTypeById.mockResolvedValue(mockMcpType);
                storeAPIKey.mockResolvedValue({});

                // Act
                await storeAPIKeyHandler(req, res);

                // Assert
                expect(storeAPIKey).toHaveBeenCalledWith({
                    user_id: mockUserId,
                    mcp_type_id: 'test-type-id',
                    credentials: complexCredentials
                });
                expect(res.status).toHaveBeenCalledWith(201);
            });

            it('should handle empty mcp type display name gracefully', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                req.user = { id: mockUserId };

                storeAPIKeySchema.safeParse.mockReturnValue({
                    success: true,
                    data: {
                        mcp_type_id: 'test-type-id',
                        credentials: { api_key: 'test-key' }
                    }
                });

                const mockMcpType = {
                    mcp_service_id: 'test-service-id',
                    mcp_service_name: 'test-service',
                    display_name: ''
                };

                getMCPTypeById.mockResolvedValue(mockMcpType);
                storeAPIKey.mockResolvedValue({});

                // Act
                await storeAPIKeyHandler(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(201);
                expect(res.json).toHaveBeenCalledWith({
                    data: expect.objectContaining({
                        mcp_type: {
                            id: 'test-service-id',
                            name: 'test-service',
                            display_name: ''
                        }
                    })
                });
            });
        });
    });
});