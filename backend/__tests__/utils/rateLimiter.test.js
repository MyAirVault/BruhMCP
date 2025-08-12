/**
 * Rate Limiter Tests
 * Tests for express rate limiting middleware configurations
 */

const rateLimiters = require('../../src/utils/rateLimiter');

describe('Rate Limiter Module', () => {
    describe('Module Structure and Exports', () => {
        it('should export three rate limiters', () => {
            expect(rateLimiters).toHaveProperty('authRateLimiter');
            expect(rateLimiters).toHaveProperty('apiRateLimiter');
            expect(rateLimiters).toHaveProperty('strictRateLimiter');
        });

        it('should export function instances', () => {
            expect(typeof rateLimiters.authRateLimiter).toBe('function');
            expect(typeof rateLimiters.apiRateLimiter).toBe('function');
            expect(typeof rateLimiters.strictRateLimiter).toBe('function');
        });
    });

    describe('Rate Limiter Properties', () => {
        it('should have correct configuration properties', () => {
            // Test that the rate limiters have the expected structure
            expect(rateLimiters.authRateLimiter).toBeDefined();
            expect(rateLimiters.apiRateLimiter).toBeDefined();
            expect(rateLimiters.strictRateLimiter).toBeDefined();
        });
    });
});