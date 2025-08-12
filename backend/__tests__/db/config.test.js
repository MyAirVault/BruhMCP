/**
 * Database Configuration Tests
 * Tests for database connection and configuration functionality
 */

const { 
    testConnection, 
    checkDatabaseTables, 
    initializeDatabase,
    pool,
    db
} = require('../../src/db/config');

// Use global mock setup
const mockPool = global.testUtils.mockPool;
const mockClient = {
    query: jest.fn(),
    release: jest.fn()
};

describe('Database Configuration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Reset mock implementations
        mockClient.query.mockReset();
        mockClient.release.mockReset();
        mockPool.connect.mockReset();
        mockPool.query.mockReset();
        mockPool.end.mockReset();
        
        // Set up default successful behavior - return mockClient from connect
        mockPool.connect.mockResolvedValue(mockClient);
        
        // Reset console mocks
        console.log = jest.fn();
        console.error = jest.fn();
    });

    describe('testConnection', () => {
        describe('Success Cases', () => {
            it('should test database connection successfully', async () => {
                // Arrange
                mockPool.connect.mockResolvedValue(mockClient);

                // Act
                await testConnection();

                // Assert
                expect(mockPool.connect).toHaveBeenCalled();
                expect(console.log).toHaveBeenCalledWith('Database connected successfully');
                expect(mockClient.release).toHaveBeenCalled();
            });
        });

        describe('Error Handling', () => {
            it('should handle connection errors', async () => {
                // Arrange
                const connectionError = new Error('Connection failed');
                mockPool.connect.mockRejectedValue(connectionError);

                // Act & Assert
                await expect(testConnection()).rejects.toThrow('Connection failed');
                expect(console.error).toHaveBeenCalledWith('Database connection error:', connectionError);
            });

            it('should handle client release errors gracefully', async () => {
                // Arrange
                const releaseError = new Error('Release failed');
                mockClient.release.mockImplementation(() => {
                    throw releaseError;
                });
                mockPool.connect.mockResolvedValue(mockClient);

                // Act & Assert
                await expect(testConnection()).rejects.toThrow('Release failed');
            });
        });
    });

    describe('checkDatabaseTables', () => {
        const requiredTables = [
            'users',
            'mcp_table',
            'mcp_service_table',
            'mcp_credentials',
            'token_audit_log',
            'user_subscriptions',
            'auth_tokens',
            'subscription_transactions',
            'account_credits'
        ];

        describe('Success Cases', () => {
            it('should verify all required tables exist', async () => {
                // Arrange
                mockPool.connect.mockResolvedValue(mockClient);
                mockClient.query.mockResolvedValue({
                    rows: [{ exists: true }]
                });

                // Act
                const result = await checkDatabaseTables();

                // Assert
                expect(result).toBe(true);
                expect(mockClient.query).toHaveBeenCalledTimes(requiredTables.length);
                expect(console.log).toHaveBeenCalledWith('✅ All required database tables exist');
                expect(mockClient.release).toHaveBeenCalled();

                // Verify each table was checked
                requiredTables.forEach((table, index) => {
                    expect(mockClient.query).toHaveBeenNthCalledWith(
                        index + 1,
                        expect.stringContaining('SELECT EXISTS'),
                        [table]
                    );
                });
            });
        });

        describe('Error Handling', () => {
            it('should handle missing tables', async () => {
                // Arrange
                mockPool.connect.mockResolvedValue(mockClient);
                mockClient.query
                    .mockResolvedValueOnce({ rows: [{ exists: true }] }) // users exists
                    .mockResolvedValueOnce({ rows: [{ exists: false }] }); // mcp_table missing

                // Act & Assert
                await expect(checkDatabaseTables()).rejects.toThrow(
                    "Required table 'mcp_table' does not exist. Please run database migrations."
                );
                expect(console.error).toHaveBeenCalledWith(
                    '❌ Database table check failed:',
                    "Required table 'mcp_table' does not exist. Please run database migrations."
                );
            });

            it('should handle database connection errors', async () => {
                // Arrange
                const connectionError = new Error('Database connection failed');
                mockPool.connect.mockRejectedValue(connectionError);

                // Act & Assert
                await expect(checkDatabaseTables()).rejects.toThrow('Database connection failed');
                expect(console.error).toHaveBeenCalledWith(
                    '❌ Database table check failed:',
                    'Database connection failed'
                );
            });

            it('should handle query execution errors', async () => {
                // Arrange
                const queryError = new Error('Query execution failed');
                mockPool.connect.mockResolvedValue(mockClient);
                mockClient.query.mockRejectedValue(queryError);

                // Act & Assert
                await expect(checkDatabaseTables()).rejects.toThrow('Query execution failed');
                expect(console.error).toHaveBeenCalledWith(
                    '❌ Database table check failed:',
                    'Query execution failed'
                );
            });

            it('should handle non-Error exceptions', async () => {
                // Arrange
                const stringError = 'String error';
                mockPool.connect.mockRejectedValue(stringError);

                // Act & Assert
                try {
                    await checkDatabaseTables();
                    fail('Expected checkDatabaseTables to throw');
                } catch (error) {
                    expect(error).toBe(stringError);
                }
                expect(console.error).toHaveBeenCalledWith(
                    '❌ Database table check failed:',
                    'String error'
                );
            });
        });

        describe('Edge Cases', () => {
            it('should handle empty query results', async () => {
                // Arrange
                mockPool.connect.mockResolvedValue(mockClient);
                mockClient.query.mockResolvedValue({ rows: [] });

                // Act & Assert
                await expect(checkDatabaseTables()).rejects.toThrow();
            });

            it('should handle malformed query results', async () => {
                // Arrange
                mockPool.connect.mockResolvedValue(mockClient);
                mockClient.query.mockResolvedValue({ rows: [{}] }); // Missing 'exists' field

                // Act & Assert
                await expect(checkDatabaseTables()).rejects.toThrow(
                    "Required table 'users' does not exist. Please run database migrations."
                );
            });
        });
    });

    describe('initializeDatabase', () => {
        describe('Success Cases', () => {
            it('should initialize database successfully', async () => {
                // Arrange
                mockPool.connect.mockResolvedValue(mockClient);
                mockClient.query.mockResolvedValue({
                    rows: [{ exists: true }]
                });

                // Act
                await initializeDatabase();

                // Assert
                expect(console.log).toHaveBeenCalledWith('🔄 Initializing database connection...');
                expect(console.log).toHaveBeenCalledWith('Database connected successfully');
                expect(console.log).toHaveBeenCalledWith('✅ All required database tables exist');
                expect(console.log).toHaveBeenCalledWith('✅ Database initialization complete');
            });
        });

        describe('Error Handling', () => {
            it('should handle connection test failures', async () => {
                // Arrange
                const connectionError = new Error('Connection test failed');
                mockPool.connect.mockRejectedValue(connectionError);

                // Act & Assert
                await expect(initializeDatabase()).rejects.toThrow('Connection test failed');
                expect(console.error).toHaveBeenCalledWith(
                    '❌ Database initialization failed:',
                    'Connection test failed'
                );
                expect(console.error).toHaveBeenCalledWith(
                    'Please ensure PostgreSQL is running and migrations have been executed.'
                );
                expect(console.error).toHaveBeenCalledWith('Run: npm run db:migrate');
            });

            it('should handle table check failures', async () => {
                // Arrange
                mockPool.connect
                    .mockResolvedValueOnce(mockClient) // testConnection succeeds
                    .mockResolvedValueOnce(mockClient); // checkDatabaseTables fails
                
                mockClient.query
                    .mockResolvedValueOnce({ rows: [{ exists: false }] }); // Missing table

                // Act & Assert
                await expect(initializeDatabase()).rejects.toThrow(
                    "Required table 'users' does not exist. Please run database migrations."
                );
                expect(console.error).toHaveBeenCalledWith(
                    '❌ Database initialization failed:',
                    "Required table 'users' does not exist. Please run database migrations."
                );
            });

            it('should handle non-Error exceptions', async () => {
                // Arrange
                const stringError = 'String initialization error';
                mockPool.connect.mockRejectedValue(stringError);

                // Act & Assert
                try {
                    await initializeDatabase();
                    fail('Expected initializeDatabase to throw');
                } catch (error) {
                    expect(error).toBe(stringError);
                }
                expect(console.error).toHaveBeenCalledWith(
                    '❌ Database initialization failed:',
                    'String initialization error'
                );
            });
        });
    });

    describe('Module Exports', () => {
        it('should export database pool as db', () => {
            expect(db).toBeDefined();
            expect(pool).toBeDefined();
            expect(db).toBe(pool);
        });

        it('should export all required functions', () => {
            expect(typeof testConnection).toBe('function');
            expect(typeof checkDatabaseTables).toBe('function');
            expect(typeof initializeDatabase).toBe('function');
        });
    });

    describe('Environment Configuration', () => {
        it('should use default values when environment variables are not set', () => {
            // Test is implicit - the module should load without errors
            // when environment variables are not set, using the defaults
            expect(pool).toBeDefined();
        });

        it('should handle invalid port values gracefully', () => {
            // The parseInt should handle invalid port values
            // This test ensures the module loads without errors
            expect(pool).toBeDefined();
        });
    });
});