/**
 * Get API Keys Controller Tests
 * Tests for retrieving API keys functionality
 */

// Mock dependencies first
jest.mock('../../../src/db/queries/apiKeysQueries.js');

const { getAPIKeys } = require('../../../src/controllers/apiKeys/getAPIKeys');
const { getAPIKeysByUserId } = require('../../../src/db/queries/apiKeysQueries.js');

describe('Get API Keys Controller', () => {
    let req, res;
    
    beforeEach(() => {
        req = global.testUtils.mockRequest();
        res = global.testUtils.mockResponse();
        jest.clearAllMocks();
        console.error = jest.fn();
    });

    describe('getAPIKeys', () => {
        describe('Success Cases', () => {
            it('should return formatted API keys successfully', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                req.user = { id: mockUserId };
                
                const mockApiKeys = [
                    {
                        id: 'api-key-1',
                        mcp_type_id: 'mcp-type-1',
                        mcp_type_name: 'openai',
                        mcp_type_display_name: 'OpenAI',
                        is_active: true,
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-01T00:00:00Z',
                        expires_at: null
                    },
                    {
                        id: 'api-key-2',
                        mcp_type_id: 'mcp-type-2',
                        mcp_type_name: 'anthropic',
                        mcp_type_display_name: 'Anthropic',
                        is_active: false,
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-02T00:00:00Z',
                        expires_at: '2025-01-01T00:00:00Z'
                    }
                ];
                
                getAPIKeysByUserId.mockResolvedValue(mockApiKeys);

                // Act
                await getAPIKeys(req, res);

                // Assert
                expect(getAPIKeysByUserId).toHaveBeenCalledWith(mockUserId);
                expect(res.json).toHaveBeenCalledWith({
                    data: [
                        {
                            id: 'api-key-1',
                            mcp_type_id: 'mcp-type-1',
                            mcp_type: {
                                id: 'mcp-type-1',
                                name: 'openai',
                                display_name: 'OpenAI'
                            },
                            is_active: true,
                            created_at: '2024-01-01T00:00:00Z',
                            updated_at: '2024-01-01T00:00:00Z',
                            expires_at: null
                        },
                        {
                            id: 'api-key-2',
                            mcp_type_id: 'mcp-type-2',
                            mcp_type: {
                                id: 'mcp-type-2',
                                name: 'anthropic',
                                display_name: 'Anthropic'
                            },
                            is_active: false,
                            created_at: '2024-01-01T00:00:00Z',
                            updated_at: '2024-01-02T00:00:00Z',
                            expires_at: '2025-01-01T00:00:00Z'
                        }
                    ]
                });
                expect(res.status).not.toHaveBeenCalled();
            });

            it('should return empty array when no API keys found', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                req.user = { id: mockUserId };
                getAPIKeysByUserId.mockResolvedValue([]);

                // Act
                await getAPIKeys(req, res);

                // Assert
                expect(getAPIKeysByUserId).toHaveBeenCalledWith(mockUserId);
                expect(res.json).toHaveBeenCalledWith({
                    data: []
                });
            });
        });

        describe('User Authentication Failures', () => {
            it('should return error when user ID is missing', async () => {
                // Arrange
                req.user = null;

                // Act
                await getAPIKeys(req, res);

                // Assert
                expect(getAPIKeysByUserId).not.toHaveBeenCalled();
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'User was not found!'
                    }
                });
                expect(res.status).not.toHaveBeenCalled();
            });

            it('should return error when user object exists but ID is missing', async () => {
                // Arrange
                req.user = {};

                // Act
                await getAPIKeys(req, res);

                // Assert
                expect(getAPIKeysByUserId).not.toHaveBeenCalled();
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
                await getAPIKeys(req, res);

                // Assert
                expect(getAPIKeysByUserId).not.toHaveBeenCalled();
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'User was not found!'
                    }
                });
            });
        });

        describe('Database Error Handling', () => {
            it('should handle database query errors', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                req.user = { id: mockUserId };
                const dbError = new Error('Database connection failed');
                getAPIKeysByUserId.mockRejectedValue(dbError);

                // Act
                await getAPIKeys(req, res);

                // Assert
                expect(getAPIKeysByUserId).toHaveBeenCalledWith(mockUserId);
                expect(console.error).toHaveBeenCalledWith('Error fetching API keys:', dbError);
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: 'Failed to fetch API keys'
                    }
                });
            });

            it('should handle non-Error exceptions', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                req.user = { id: mockUserId };
                getAPIKeysByUserId.mockRejectedValue('String error');

                // Act
                await getAPIKeys(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('Error fetching API keys:', 'String error');
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: 'Failed to fetch API keys'
                    }
                });
            });

            it('should handle null result from database', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                req.user = { id: mockUserId };
                getAPIKeysByUserId.mockResolvedValue(null);

                // Act
                await getAPIKeys(req, res);

                // Assert
                expect(console.error).toHaveBeenCalled();
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: 'Failed to fetch API keys'
                    }
                });
            });
        });

        describe('Edge Cases', () => {
            it('should handle API keys with missing optional fields', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                req.user = { id: mockUserId };
                
                const mockApiKeys = [
                    {
                        id: 'api-key-1',
                        mcp_type_id: 'mcp-type-1',
                        mcp_type_name: 'openai',
                        mcp_type_display_name: 'OpenAI',
                        is_active: true,
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-01T00:00:00Z'
                        // Missing expires_at
                    }
                ];
                
                getAPIKeysByUserId.mockResolvedValue(mockApiKeys);

                // Act
                await getAPIKeys(req, res);

                // Assert
                expect(res.json).toHaveBeenCalledWith({
                    data: [
                        {
                            id: 'api-key-1',
                            mcp_type_id: 'mcp-type-1',
                            mcp_type: {
                                id: 'mcp-type-1',
                                name: 'openai',
                                display_name: 'OpenAI'
                            },
                            is_active: true,
                            created_at: '2024-01-01T00:00:00Z',
                            updated_at: '2024-01-01T00:00:00Z',
                            expires_at: undefined
                        }
                    ]
                });
            });

            it('should handle extremely large number of API keys', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                req.user = { id: mockUserId };
                
                const mockApiKeys = Array.from({ length: 1000 }, (_, i) => ({
                    id: `api-key-${i}`,
                    mcp_type_id: `mcp-type-${i}`,
                    mcp_type_name: `service-${i}`,
                    mcp_type_display_name: `Service ${i}`,
                    is_active: i % 2 === 0,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                    expires_at: i % 3 === 0 ? '2025-01-01T00:00:00Z' : null
                }));
                
                getAPIKeysByUserId.mockResolvedValue(mockApiKeys);

                // Act
                await getAPIKeys(req, res);

                // Assert
                expect(getAPIKeysByUserId).toHaveBeenCalledWith(mockUserId);
                expect(res.json).toHaveBeenCalled();
                const responseData = res.json.mock.calls[0][0];
                expect(responseData.data).toHaveLength(1000);
                expect(responseData.data[0].id).toBe('api-key-0');
                expect(responseData.data[999].id).toBe('api-key-999');
            });
        });
    });
});