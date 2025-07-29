/**
 * Creates rate limiting middleware
 * @param {Object} options - Rate limit options
 * @returns {Function} Express middleware function
 */
export function createRateLimitMiddleware(options?: Object): Function;
/**
 * Gets rate limit statistics
 * @returns {{totalKeys: number, activeRateLimits: number, keysByType: {global: number, route: number, instance: number}, topKeys: Array<{key: string, requestCount: number, lastRequest: number}>}} Rate limit statistics
 */
export function getRateLimitStatistics(): {
    totalKeys: number;
    activeRateLimits: number;
    keysByType: {
        global: number;
        route: number;
        instance: number;
    };
    topKeys: Array<{
        key: string;
        requestCount: number;
        lastRequest: number;
    }>;
};
/**
 * Checks if a key is rate limited
 * @param {string} key - Rate limit key
 * @param {{requests: number, window: number}} config - Rate limit configuration
 * @param {number} now - Current timestamp
 * @returns {boolean} True if rate limited
 */
export function isRateLimited(key: string, config: {
    requests: number;
    window: number;
}, now: number): boolean;
/**
 * Records a request for rate limiting
 * @param {string} key - Rate limit key
 * @param {{requests: number, window: number}} config - Rate limit configuration
 * @param {number} now - Current timestamp
 */
export function recordRequest(key: string, config: {
    requests: number;
    window: number;
}, now: number): void;
/**
 * Adds rate limit headers to response
 * @param {import('express').Response} res - Express response object
 * @param {string} key - Rate limit key
 * @param {{requests: number, window: number}} config - Rate limit configuration
 * @param {number} now - Current timestamp
 */
export function addRateLimitHeaders(res: import('express').Response, key: string, config: {
    requests: number;
    window: number;
}, now: number): void;
/**
 * Sends rate limit exceeded response
 * @param {import('express').Response} res - Express response object
 * @param {string} message - Error message
 */
export function sendRateLimitResponse(res: import('express').Response, message: string): void;
export { createRateLimitMiddleware as createRedditApiRateLimitMiddleware };
//# sourceMappingURL=rateLimit.d.ts.map