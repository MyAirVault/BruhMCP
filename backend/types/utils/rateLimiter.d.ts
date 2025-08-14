/**
 * Rate limiter for authentication endpoints
 * 15 minutes window with 20 requests to allow normal retries
 */
export const authRateLimiter: Function;
/**
 * General API rate limiter
 * More permissive for general API usage
 */
export const apiRateLimiter: Function;
/**
 * Strict rate limiter for sensitive operations
 */
export const strictRateLimiter: Function;
/**
 * Rate limiter for OTP requests - prevents spam but allows legitimate use
 */
export const otpRateLimit: Function;
/**
 * Rate limiter for password reset requests
 */
export const passwordResetRateLimit: Function;
/**
 * Strict rate limiter for payment operations
 */
export const paymentRateLimit: Function;
/**
 * Rate limiter for subscription modifications - allows legitimate retry attempts
 */
export const subscriptionRateLimit: Function;
/**
 * Very permissive rate limiter for subscription data viewing - allows normal browsing
 */
export const subscriptionViewRateLimit: Function;
/**
 * Rate limiter for webhook endpoints - allows high frequency for legitimate webhook traffic
 */
export const webhookRateLimit: Function;
//# sourceMappingURL=rateLimiter.d.ts.map