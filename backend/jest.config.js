/**
 * Jest Configuration for Backend Tests
 * Comprehensive test configuration for the BruhMCP backend
 */

module.exports = {
    // Test environment
    testEnvironment: 'node',
    
    // Test file patterns
    testMatch: [
        '**/__tests__/**/*.test.js',
        '**/__tests__/**/*.spec.js'
    ],
    
    // Coverage configuration
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/index.js', // Exclude main server file from coverage
        '!src/db/migrations/**',
        '!src/mcp-servers/**', // Exclude MCP server implementations
        '!**/node_modules/**',
        '!**/__tests__/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    
    // Setup and teardown
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
    
    // Module paths and mapping
    moduleFileExtensions: ['js', 'json'],
    
    // Test timeout
    testTimeout: 10000,
    
    // Verbose output for debugging
    verbose: true,
    
    // Clear mocks between tests
    clearMocks: true,
    
    // Force exit after tests complete
    forceExit: true,
    
    // Detect open handles (useful for debugging)
    detectOpenHandles: true,
    
    // Transform configuration
    transform: {},
    
    // Global variables
    globals: {
        'process.env.NODE_ENV': 'test'
    }
};