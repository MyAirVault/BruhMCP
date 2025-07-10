/**
 * Rate limiter for authentication endpoints
 * 5 requests per minute per IP as specified in docs
 */
export const authRateLimiter: import('express-rate-limit').RateLimitRequestHandler;
/**
 * General API rate limiter
 * More permissive for general API usage
 */
export const apiRateLimiter: import('express-rate-limit').RateLimitRequestHandler;
/**
 * Strict rate limiter for sensitive operations
 */
export const strictRateLimiter: import('express-rate-limit').RateLimitRequestHandler;
//# sourceMappingURL=rateLimiter.d.ts.map
