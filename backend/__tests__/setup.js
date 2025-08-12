/**
 * Jest Test Setup
 * Global test configuration and setup for all tests
 */

const { Pool } = require('pg');

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'bruhmcp_test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USER = 'legion';
process.env.DB_PASSWORD = 'postgres';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-purposes-only';
process.env.EMAIL_SERVICE_API_KEY = 'test-email-api-key';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.PORT = '5001';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce test noise
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};

// Mock database pool for tests
const mockPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn()
};

// Mock pg module
jest.mock('pg', () => ({
    Pool: jest.fn(() => mockPool)
}));

// Global test utilities
global.testUtils = {
    mockPool,
    
    // Mock Express request object
    mockRequest: (overrides = {}) => ({
        body: {},
        params: {},
        query: {},
        headers: {},
        user: null,
        ip: '127.0.0.1',
        originalUrl: '/test',
        method: 'GET',
        ...overrides
    }),
    
    // Mock Express response object
    mockResponse: () => {
        const res = {
            status: jest.fn(() => res),
            json: jest.fn(() => res),
            send: jest.fn(() => res),
            cookie: jest.fn(() => res),
            clearCookie: jest.fn(() => res),
            redirect: jest.fn(() => res),
            sendFile: jest.fn(() => res),
            setHeader: jest.fn(() => res),
            headersSent: false
        };
        return res;
    },
    
    // Mock Express next function
    mockNext: () => jest.fn(),
    
    // Mock database client
    mockClient: () => ({
        query: jest.fn(),
        release: jest.fn()
    }),
    
    // Create mock user object
    mockUser: (overrides = {}) => ({
        id: 'test-user-id-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password_hash: '$2b$10$test.hash.for.testing.purposes.only',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides
    }),
    
    // Create mock MCP instance
    mockMCPInstance: (overrides = {}) => ({
        id: 'test-instance-id-123',
        user_id: 'test-user-id-123',
        service_name: 'test-service',
        instance_name: 'Test Instance',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
        ...overrides
    }),
    
    // Helper to wait for async operations
    wait: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),
    
    // Helper to reset all mocks
    resetMocks: () => {
        jest.clearAllMocks();
        mockPool.connect.mockReset();
        mockPool.query.mockReset();
        mockPool.end.mockReset();
    }
};

// Global beforeEach to reset mocks
beforeEach(() => {
    global.testUtils.resetMocks();
});

// Clean up after all tests
afterAll(async () => {
    // Close any open handles
    if (mockPool.end) {
        mockPool.end();
    }
});

// Suppress specific console warnings during tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
    if (
        args[0] && 
        typeof args[0] === 'string' && 
        (
            args[0].includes('punycode') ||
            args[0].includes('deprecated')
        )
    ) {
        return;
    }
    originalConsoleWarn.apply(console, args);
};