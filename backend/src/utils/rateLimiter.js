// @ts-check
import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication endpoints
 * 5 requests per minute per IP as specified in docs
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many authentication requests, please try again later'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many authentication requests, please try again later'
      }
    });
  }
});

/**
 * General API rate limiter
 * More permissive for general API usage
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many API requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many API requests, please try again later'
      }
    });
  }
});

/**
 * Strict rate limiter for sensitive operations
 */
export const strictRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests for this operation, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests for this operation, please try again later'
      }
    });
  }
});