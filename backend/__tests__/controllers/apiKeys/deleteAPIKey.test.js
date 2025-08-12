/**
 * Delete API Key Controller Tests
 * Tests for deleting API key functionality
 */

// Mock dependencies first
jest.mock('../../../src/db/queries/apiKeysQueries.js');

const { deleteAPIKeyHandler } = require('../../../src/controllers/apiKeys/deleteAPIKey');
const { deleteAPIKey } = require('../../../src/db/queries/apiKeysQueries.js');

describe('Delete API Key Controller', () => {
    let req, res;
    
    beforeEach(() => {
        req = global.testUtils.mockRequest();
        res = global.testUtils.mockResponse();
        jest.clearAllMocks();
        console.error = jest.fn();
    });

    describe('deleteAPIKeyHandler', () => {
        describe('Success Cases', () => {
            it('should delete API key successfully', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                const mockApiKeyId = 'api-key-id-456';
                
                req.user = { id: mockUserId };
                req.params = { id: mockApiKeyId };
                
                deleteAPIKey.mockResolvedValue(true);

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(deleteAPIKey).toHaveBeenCalledWith(mockApiKeyId, mockUserId);
                expect(res.status).toHaveBeenCalledWith(204);
                expect(res.send).toHaveBeenCalled();
                expect(res.json).not.toHaveBeenCalled();
            });

            it('should handle successful deletion with different ID formats', async () => {
                // Arrange
                const mockUserId = 'user-123-abc-def';
                const mockApiKeyId = '550e8400-e29b-41d4-a716-446655440000';
                
                req.user = { id: mockUserId };
                req.params = { id: mockApiKeyId };
                
                deleteAPIKey.mockResolvedValue(true);

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(deleteAPIKey).toHaveBeenCalledWith(mockApiKeyId, mockUserId);
                expect(res.status).toHaveBeenCalledWith(204);
                expect(res.send).toHaveBeenCalled();
            });

            it('should handle successful deletion with numeric-like IDs', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                const mockApiKeyId = '12345';
                
                req.user = { id: mockUserId };
                req.params = { id: mockApiKeyId };
                
                deleteAPIKey.mockResolvedValue(true);

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(deleteAPIKey).toHaveBeenCalledWith(mockApiKeyId, mockUserId);
                expect(res.status).toHaveBeenCalledWith(204);
            });
        });

        describe('User Authentication Failures', () => {
            it('should return error when user ID is missing', async () => {
                // Arrange
                req.user = null;
                req.params = { id: 'api-key-id' };

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(deleteAPIKey).not.toHaveBeenCalled();
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
                req.params = { id: 'api-key-id' };

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(deleteAPIKey).not.toHaveBeenCalled();
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
                req.params = { id: 'api-key-id' };

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(deleteAPIKey).not.toHaveBeenCalled();
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'User was not found!'
                    }
                });
            });

            it('should return error when user ID is null', async () => {
                // Arrange
                req.user = { id: null };
                req.params = { id: 'api-key-id' };

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(deleteAPIKey).not.toHaveBeenCalled();
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'User was not found!'
                    }
                });
            });

            it('should return error when user ID is undefined', async () => {
                // Arrange
                req.user = { id: undefined };
                req.params = { id: 'api-key-id' };

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(deleteAPIKey).not.toHaveBeenCalled();
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: 'User was not found!'
                    }
                });
            });
        });

        describe('API Key Not Found Cases', () => {
            it('should return 404 when API key does not exist', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                const mockApiKeyId = 'non-existent-api-key-id';
                
                req.user = { id: mockUserId };
                req.params = { id: mockApiKeyId };
                
                deleteAPIKey.mockResolvedValue(false);

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(deleteAPIKey).toHaveBeenCalledWith(mockApiKeyId, mockUserId);
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'NOT_FOUND',
                        message: 'API key not found'
                    }
                });
                expect(res.send).not.toHaveBeenCalled();
            });

            it('should return 404 when API key belongs to different user', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                const mockApiKeyId = 'api-key-belonging-to-other-user';
                
                req.user = { id: mockUserId };
                req.params = { id: mockApiKeyId };
                
                deleteAPIKey.mockResolvedValue(false);

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(deleteAPIKey).toHaveBeenCalledWith(mockApiKeyId, mockUserId);
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'NOT_FOUND',
                        message: 'API key not found'
                    }
                });
            });

            it('should return 404 when deleteAPIKey returns null', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                const mockApiKeyId = 'api-key-id';
                
                req.user = { id: mockUserId };
                req.params = { id: mockApiKeyId };
                
                deleteAPIKey.mockResolvedValue(null);

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'NOT_FOUND',
                        message: 'API key not found'
                    }
                });
            });

            it('should return 404 when deleteAPIKey returns undefined', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                const mockApiKeyId = 'api-key-id';
                
                req.user = { id: mockUserId };
                req.params = { id: mockApiKeyId };
                
                deleteAPIKey.mockResolvedValue(undefined);

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'NOT_FOUND',
                        message: 'API key not found'
                    }
                });
            });

            it('should return 404 when deleteAPIKey returns 0', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                const mockApiKeyId = 'api-key-id';
                
                req.user = { id: mockUserId };
                req.params = { id: mockApiKeyId };
                
                deleteAPIKey.mockResolvedValue(0);

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'NOT_FOUND',
                        message: 'API key not found'
                    }
                });
            });
        });

        describe('Database Error Handling', () => {
            it('should handle database connection errors', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                const mockApiKeyId = 'api-key-id';
                
                req.user = { id: mockUserId };
                req.params = { id: mockApiKeyId };
                
                const dbError = new Error('Database connection failed');
                deleteAPIKey.mockRejectedValue(dbError);

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(deleteAPIKey).toHaveBeenCalledWith(mockApiKeyId, mockUserId);
                expect(console.error).toHaveBeenCalledWith('Error deleting API key:', dbError);
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: 'Failed to delete API key'
                    }
                });
                expect(res.send).not.toHaveBeenCalled();
            });

            it('should handle database timeout errors', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                const mockApiKeyId = 'api-key-id';
                
                req.user = { id: mockUserId };
                req.params = { id: mockApiKeyId };
                
                const timeoutError = new Error('Query timeout exceeded');
                deleteAPIKey.mockRejectedValue(timeoutError);

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('Error deleting API key:', timeoutError);
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: 'Failed to delete API key'
                    }
                });
            });

            it('should handle non-Error exceptions', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                const mockApiKeyId = 'api-key-id';
                
                req.user = { id: mockUserId };
                req.params = { id: mockApiKeyId };
                
                deleteAPIKey.mockRejectedValue('String error');

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('Error deleting API key:', 'String error');
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: 'Failed to delete API key'
                    }
                });
            });

            it('should handle permission denied errors', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                const mockApiKeyId = 'api-key-id';
                
                req.user = { id: mockUserId };
                req.params = { id: mockApiKeyId };
                
                const permissionError = new Error('Permission denied');
                deleteAPIKey.mockRejectedValue(permissionError);

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(console.error).toHaveBeenCalledWith('Error deleting API key:', permissionError);
                expect(res.status).toHaveBeenCalledWith(500);
            });
        });

        describe('Parameter Edge Cases', () => {
            it('should handle missing API key ID parameter', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                
                req.user = { id: mockUserId };
                req.params = {}; // Missing id parameter
                
                deleteAPIKey.mockResolvedValue(false);

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(deleteAPIKey).toHaveBeenCalledWith(undefined, mockUserId);
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'NOT_FOUND',
                        message: 'API key not found'
                    }
                });
            });

            it('should handle empty string API key ID', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                
                req.user = { id: mockUserId };
                req.params = { id: '' };
                
                deleteAPIKey.mockResolvedValue(false);

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(deleteAPIKey).toHaveBeenCalledWith('', mockUserId);
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({
                    error: {
                        code: 'NOT_FOUND',
                        message: 'API key not found'
                    }
                });
            });

            it('should handle null API key ID', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                
                req.user = { id: mockUserId };
                req.params = { id: null };
                
                deleteAPIKey.mockResolvedValue(false);

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(deleteAPIKey).toHaveBeenCalledWith(null, mockUserId);
                expect(res.status).toHaveBeenCalledWith(404);
            });

            it('should handle very long API key ID', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                const veryLongId = 'a'.repeat(1000);
                
                req.user = { id: mockUserId };
                req.params = { id: veryLongId };
                
                deleteAPIKey.mockResolvedValue(true);

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(deleteAPIKey).toHaveBeenCalledWith(veryLongId, mockUserId);
                expect(res.status).toHaveBeenCalledWith(204);
            });

            it('should handle API key ID with special characters', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                const specialId = 'api-key-with-special-chars-!@#$%^&*()';
                
                req.user = { id: mockUserId };
                req.params = { id: specialId };
                
                deleteAPIKey.mockResolvedValue(true);

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(deleteAPIKey).toHaveBeenCalledWith(specialId, mockUserId);
                expect(res.status).toHaveBeenCalledWith(204);
            });
        });

        describe('Response Consistency', () => {
            it('should not return any body content on successful deletion', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                const mockApiKeyId = 'api-key-id';
                
                req.user = { id: mockUserId };
                req.params = { id: mockApiKeyId };
                
                deleteAPIKey.mockResolvedValue(true);

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(204);
                expect(res.send).toHaveBeenCalledWith();
                expect(res.json).not.toHaveBeenCalled();
            });

            it('should always return JSON error format for failures', async () => {
                // Arrange
                const mockUserId = 'test-user-id-123';
                const mockApiKeyId = 'non-existent-id';
                
                req.user = { id: mockUserId };
                req.params = { id: mockApiKeyId };
                
                deleteAPIKey.mockResolvedValue(false);

                // Act
                await deleteAPIKeyHandler(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        error: expect.objectContaining({
                            code: expect.any(String),
                            message: expect.any(String)
                        })
                    })
                );
                expect(res.send).not.toHaveBeenCalled();
            });
        });
    });
});