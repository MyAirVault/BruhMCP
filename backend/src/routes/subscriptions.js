/**
 * Subscription management API routes
 * Defines all subscription and payment endpoints with comprehensive security
 * Adapted to match current project structure
 *
 * @fileoverview Subscription API routes with payment processing
 */

const express = require('express');
const { body, param } = require('express-validator');

// Import controllers (updated paths for current structure)
const {
	getAllPlans,
	getUserSubscription,
	createSubscription,
	upgradeSubscription,
	cancelSubscription,
	getSubscriptionHistory,
	verifyPayment,
	getPaymentStatus,
} = require('../controllers/subscriptions/subscriptions');

// Import middleware (adapted to current structure)
const { authenticate } = require('../middleware/auth');
const { apiRateLimiter } = require('../utils/rateLimiter');

// Create router instance
const router = express.Router();

// Apply common middleware to all subscription routes
router.use(apiRateLimiter);

// Validation middleware functions

/**
 * Validate subscription creation request
 */
const validateSubscriptionCreation = [
	body('planCode')
		.isIn(['free', 'pro'])
		.withMessage('Plan code must be either "free" or "pro"'),
	body('billingCycle')
		.optional()
		.isIn(['monthly', 'yearly'])
		.withMessage('Billing cycle must be either "monthly" or "yearly"'),
];

/**
 * Validate subscription upgrade request
 */
const validateSubscriptionUpgrade = [
	body('newPlanCode')
		.isIn(['free', 'pro'])
		.withMessage('New plan code must be either "free" or "pro"'),
];

/**
 * Validate subscription cancellation request
 */
const validateSubscriptionCancellation = [
	body('cancelImmediately')
		.optional()
		.isBoolean()
		.withMessage('cancelImmediately must be a boolean'),
];

/**
 * Validate payment verification request
 */
const validatePaymentVerification = [
	body('razorpay_payment_id')
		.notEmpty()
		.withMessage('Razorpay payment ID is required'),
	body('subscription_id')
		.optional()
		.isUUID()
		.withMessage('Subscription ID must be a valid UUID'),
];

/**
 * Validate payment status params
 */
const validatePaymentStatusParams = [
	param('subscriptionId')
		.isUUID()
		.withMessage('Subscription ID must be a valid UUID'),
];

// Subscription routes

/**
 * GET /api/subscriptions/plans
 * Get all available subscription plans
 * Public route (no authentication required)
 */
router.get('/plans', getAllPlans);

/**
 * GET /api/subscriptions/current
 * Get current user subscription status
 * Requires authentication
 */
router.get('/current', authenticate, getUserSubscription);

/**
 * POST /api/subscriptions/create
 * Create a new subscription
 * Requires authentication and validates subscription data
 */
router.post(
	'/create',
	authenticate,
	validateSubscriptionCreation,
	createSubscription
);

/**
 * POST /api/subscriptions/upgrade
 * Upgrade subscription to new plan
 * Requires authentication and validates upgrade data
 */
router.post(
	'/upgrade',
	authenticate,
	validateSubscriptionUpgrade,
	upgradeSubscription
);

/**
 * POST /api/subscriptions/cancel
 * Cancel current subscription
 * Requires authentication
 */
router.post(
	'/cancel',
	authenticate,
	validateSubscriptionCancellation,
	cancelSubscription
);

/**
 * GET /api/subscriptions/history
 * Get user's subscription transaction history with pagination
 * Requires authentication
 */
router.get('/history', authenticate, getSubscriptionHistory);

/**
 * GET /api/subscriptions/:subscriptionId/payment-status
 * Get payment status and subscription state for polling
 * Requires authentication and validates subscription ID
 */
router.get(
	'/:subscriptionId/payment-status',
	authenticate,
	validatePaymentStatusParams,
	getPaymentStatus
);

/**
 * POST /api/subscriptions/verify-payment
 * Verify Razorpay payment signature and activate subscription
 * Requires authentication and validates payment data
 */
router.post(
	'/verify-payment',
	authenticate,
	validatePaymentVerification,
	verifyPayment
);

/**
 * Error handling middleware for subscription routes
 * Catches any unhandled errors in subscription endpoints
 */
router.use((/** @type {Error} */ error, /** @type {import('express').Request} */ req, /** @type {import('express').Response} */ res, /** @type {import('express').NextFunction} */ next) => {
	console.error('Subscription route error:', {
		error: error.message,
		stack: error.stack,
		url: req.url,
		method: req.method,
		body: req.body,
		timestamp: new Date().toISOString(),
	});

	res.status(500).json({
		success: false,
		message: 'Internal server error in subscription management',
		timestamp: new Date().toISOString(),
	});
});

module.exports = router;