// @ts-check
const rateLimit = require('express-rate-limit');
const { ErrorResponses } = require('./errorResponse.js');

/**
 * Determines if we should use rate limiting based on environment
 * @returns {boolean} True if rate limiting should be enabled
 */
function shouldEnableRateLimit() {
    return process.env.NODE_ENV !== 'test' && 
           process.env.JEST_WORKER_ID === undefined;
}

/**
 * Creates a no-op middleware for testing
 * @returns {Function} Express middleware that does nothing
 */
function createTestRateLimit() {
    return (/** @type {import('express').Request} */ req, /** @type {import('express').Response} */ res, /** @type {import('express').NextFunction} */ next) => {
        next();
    };
}

/**
 * Rate limiter for authentication endpoints
 * 15 minutes window with 20 requests to allow normal retries
 */
const authRateLimiter = shouldEnableRateLimit() ? rateLimit.default({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 20, // 20 requests per 15 minutes
	message: {
		success: false,
		message: 'Too many authentication attempts, please try again later.'
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (/** @type {import('express').Request} */ _req, /** @type {import('express').Response} */ res) => {
		ErrorResponses.rateLimited(res, 'Too many authentication attempts, please try again later');
	},
}) : createTestRateLimit();

/**
 * General API rate limiter
 * More permissive for general API usage
 */
const apiRateLimiter = shouldEnableRateLimit() ? rateLimit.default({
	windowMs: 60 * 1000, // 1 minute
	max: 100, // 100 requests per minute
	message: {
		success: false,
		message: 'Too many API requests, please try again later'
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (/** @type {import('express').Request} */ _req, /** @type {import('express').Response} */ res) => {
		ErrorResponses.rateLimited(res, 'Too many API requests, please try again later');
	},
}) : createTestRateLimit();

/**
 * Rate limiter for OTP requests - prevents spam but allows legitimate use
 */
const otpRateLimit = shouldEnableRateLimit() ? rateLimit.default({
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 5, // 5 OTP requests per 5 minutes
	message: {
		success: false,
		message: 'Too many OTP requests, please wait before requesting again.'
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (/** @type {import('express').Request} */ _req, /** @type {import('express').Response} */ res) => {
		ErrorResponses.rateLimited(res, 'Too many OTP requests, please wait before requesting again.');
	},
}) : createTestRateLimit();

/**
 * Rate limiter for password reset requests
 */
const passwordResetRateLimit = shouldEnableRateLimit() ? rateLimit.default({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 5, // 5 password reset requests per hour
	message: {
		success: false,
		message: 'Too many password reset attempts, please try again later.'
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (/** @type {import('express').Request} */ _req, /** @type {import('express').Response} */ res) => {
		ErrorResponses.rateLimited(res, 'Too many password reset attempts, please try again later.');
	},
}) : createTestRateLimit();

/**
 * Strict rate limiter for payment operations
 */
const paymentRateLimit = shouldEnableRateLimit() ? rateLimit.default({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // 10 payment requests per 15 minutes
	message: {
		success: false,
		message: 'Too many payment attempts. Please wait a moment before trying again.',
		code: 'PAYMENT_RATE_LIMIT_EXCEEDED'
	},
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: false,
	skipFailedRequests: false,
	handler: (/** @type {import('express').Request} */ _req, /** @type {import('express').Response} */ res) => {
		ErrorResponses.rateLimited(res, 'Too many payment attempts. Please wait a moment before trying again.');
	},
}) : createTestRateLimit();

/**
 * Rate limiter for subscription modifications - allows legitimate retry attempts
 */
const subscriptionRateLimit = shouldEnableRateLimit() ? rateLimit.default({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 20, // 20 subscription changes per hour
	message: {
		success: false,
		message: 'Too many subscription change attempts. Please wait a moment before trying again.',
		code: 'SUBSCRIPTION_RATE_LIMIT_EXCEEDED'
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (/** @type {import('express').Request} */ _req, /** @type {import('express').Response} */ res) => {
		ErrorResponses.rateLimited(res, 'Too many subscription change attempts. Please wait a moment before trying again.');
	},
}) : createTestRateLimit();

/**
 * Very permissive rate limiter for subscription data viewing - allows normal browsing
 */
const subscriptionViewRateLimit = shouldEnableRateLimit() ? rateLimit.default({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 1000, // 1000 subscription view requests per 15 minutes
	message: {
		success: false,
		message: 'Too many subscription viewing requests. Please wait a moment before trying again.',
		code: 'SUBSCRIPTION_VIEW_RATE_LIMIT_EXCEEDED'
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (/** @type {import('express').Request} */ _req, /** @type {import('express').Response} */ res) => {
		ErrorResponses.rateLimited(res, 'Too many subscription viewing requests. Please wait a moment before trying again.');
	},
}) : createTestRateLimit();

/**
 * Rate limiter for webhook endpoints - allows high frequency for legitimate webhook traffic
 */
const webhookRateLimit = shouldEnableRateLimit() ? rateLimit.default({
	windowMs: 60 * 1000, // 1 minute
	max: 50, // 50 webhook requests per minute
	message: {
		success: true, // Always return success for webhooks to prevent retries
		message: 'Webhook processed successfully',
		code: 'WEBHOOK_RATE_LIMIT_EXCEEDED'
	},
	standardHeaders: false, // Don't expose rate limit headers for webhooks
	legacyHeaders: false,
	skipSuccessfulRequests: false,
	skipFailedRequests: false,
	handler: (/** @type {import('express').Request} */ _req, /** @type {import('express').Response} */ res) => {
		// For webhooks, always return success to prevent retries
		res.status(200).json({
			success: true,
			message: 'Webhook processed successfully'
		});
	},
}) : createTestRateLimit();

/**
 * Strict rate limiter for sensitive operations
 */
const strictRateLimiter = shouldEnableRateLimit() ? rateLimit.default({
	windowMs: 60 * 1000, // 1 minute
	max: 10, // 10 requests per minute
	message: {
		success: false,
		message: 'Too many requests for this operation, please try again later'
	},
	standardHeaders: true,
	legacyHeaders: false,
	handler: (/** @type {import('express').Request} */ _req, /** @type {import('express').Response} */ res) => {
		ErrorResponses.rateLimited(res, 'Too many requests for this operation, please try again later');
	},
}) : createTestRateLimit();

module.exports = {
	authRateLimiter,
	apiRateLimiter,
	strictRateLimiter,
	otpRateLimit,
	passwordResetRateLimit,
	paymentRateLimit,
	subscriptionRateLimit,
	subscriptionViewRateLimit,
	webhookRateLimit
};
