// @ts-check
const rateLimit = require('express-rate-limit');
const { ErrorResponses } = require('./errorResponse.js');

/**
 * Rate limiter for authentication endpoints
 * 5 requests per minute per IP as specified in docs
 */
const authRateLimiter = rateLimit.default({
	windowMs: 60 * 1000, // 1 minute
	max: 5, // 5 requests per minute
	message: {
		error: {
			code: 'RATE_LIMITED',
			message: 'Too many authentication requests, please try again later',
		},
	},
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	handler: (/** @type {import('express').Request} */ _req, /** @type {import('express').Response} */ res) => {
		ErrorResponses.rateLimited(res, 'Too many authentication requests, please try again later');
	},
});

/**
 * General API rate limiter
 * More permissive for general API usage
 */
const apiRateLimiter = rateLimit.default({
	windowMs: 60 * 1000, // 1 minute
	max: 100, // 100 requests per minute
	message: {
		error: {
			code: 'RATE_LIMITED',
			message: 'Too many API requests, please try again later',
		},
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (/** @type {import('express').Request} */ _req, /** @type {import('express').Response} */ res) => {
		ErrorResponses.rateLimited(res, 'Too many API requests, please try again later');
	},
});

/**
 * Strict rate limiter for sensitive operations
 */
const strictRateLimiter = rateLimit.default({
	windowMs: 60 * 1000, // 1 minute
	max: 10, // 10 requests per minute
	message: {
		error: {
			code: 'RATE_LIMITED',
			message: 'Too many requests for this operation, please try again later',
		},
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (/** @type {import('express').Request} */ _req, /** @type {import('express').Response} */ res) => {
		ErrorResponses.rateLimited(res, 'Too many requests for this operation, please try again later');
	},
});

module.exports = {
	authRateLimiter,
	apiRateLimiter,
	strictRateLimiter
};
