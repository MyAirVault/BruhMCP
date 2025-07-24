/**
 * Creates rate limiting middleware
 * @param {Object} options - Rate limit options
 * @returns {Function} Express middleware function
 */
export function createRateLimitMiddleware(options?: Object): Function;
/**
 * Creates Reddit API rate limit middleware
 * Handles Reddit-specific rate limiting (60 requests per minute)
 * @returns {Function} Express middleware function
 */
export function createRedditApiRateLimitMiddleware(): Function;
/**
 * Creates strict rate limit middleware for sensitive operations
 * @returns {Function} Express middleware function
 */
export function createStrictRateLimitMiddleware(): Function;
/**
 * Gets rate limit statistics
 * @returns {Object} Rate limit statistics
 */
export function getRateLimitStatistics(): Object;
/**
 * Clears rate limit data for an instance
 * @param {string} instanceId - Instance ID
 */
export function clearInstanceRateLimit(instanceId: string): void;
/**
 * Clears all rate limit data
 */
export function clearAllRateLimits(): void;
/**
 * Updates rate limit configuration
 * @param {Object} newConfig - New rate limit configuration
 */
export function updateRateLimitConfig(newConfig: Object): void;
/**
 * Gets rate limit configuration
 * @returns {Object} Current rate limit configuration
 */
export function getRateLimitConfig(): Object;
/**
 * Checks if an instance is currently rate limited
 * @param {string} instanceId - Instance ID
 * @returns {boolean} True if rate limited
 */
export function isInstanceRateLimited(instanceId: string): boolean;
/**
 * Gets remaining requests for an instance
 * @param {string} instanceId - Instance ID
 * @returns {Object} Remaining request information
 */
export function getInstanceRemainingRequests(instanceId: string): Object;
//# sourceMappingURL=rateLimit.d.ts.map