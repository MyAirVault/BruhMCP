/**
 * Rate limiter for authentication endpoints
 * 5 requests per minute per IP as specified in docs
 */
export const authRateLimiter: rateLimit.RateLimitRequestHandler;
/**
 * General API rate limiter
 * More permissive for general API usage
 */
export const apiRateLimiter: rateLimit.RateLimitRequestHandler;
/**
 * Strict rate limiter for sensitive operations
 */
export const strictRateLimiter: rateLimit.RateLimitRequestHandler;
import rateLimit = require("express-rate-limit");
//# sourceMappingURL=rateLimiter.d.ts.map