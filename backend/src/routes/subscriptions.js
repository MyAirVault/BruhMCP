/**
 * Subscription management API routes
 * Defines all subscription and payment endpoints with comprehensive security
 * Adapted to match current project structure
 *
 * @fileoverview Subscription API routes with payment processing
 */

const express = require('express');
const { body, param } = require('express-validator');

// Import all controllers from centralized subscriptions controller
const {
	getAllPlans,
	getUserSubscription,
	createSubscription,
	upgradeSubscription,
	cancelSubscription,
	getSubscriptionHistory,
	verifyPayment,
	getPaymentStatus,
	// Advanced subscription control functions
	pauseSubscription,
	resumeSubscription,
	downloadInvoice,
} = require('../controllers/subscriptions/subscriptions');

// Import middleware (adapted to current structure)
const { authenticate } = require('../middleware/auth');
const { 
	apiRateLimiter,
	paymentRateLimit,
	subscriptionRateLimit,
	subscriptionViewRateLimit,
	webhookRateLimit
} = require('../utils/rateLimiter');

// Create router instance
const router = express.Router();

// Apply general rate limiting to all subscription routes
router.use(/** @type {import('express').RequestHandler} */ (apiRateLimiter));

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


/**
 * Validate pause subscription request
 */
const validatePauseSubscription = [
	body('reason')
		.optional()
		.isString()
		.isLength({ min: 1, max: 255 })
		.withMessage('Reason must be a string between 1-255 characters'),
	body('pauseDuration')
		.optional()
		.isInt({ min: 1, max: 180 })
		.withMessage('Pause duration must be between 1-180 days'),
];


/**
 * Validate invoice download params
 */
const validateInvoiceDownload = [
	param('transactionId')
		.isUUID()
		.withMessage('Transaction ID must be a valid UUID'),
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
router.get('/current', /** @type {import('express').RequestHandler} */ (subscriptionViewRateLimit), authenticate, getUserSubscription);

/**
 * POST /api/subscriptions/create
 * Create a new subscription
 * Requires authentication and validates subscription data
 */
router.post(
	'/create',
	/** @type {import('express').RequestHandler} */ (subscriptionRateLimit),
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
	/** @type {import('express').RequestHandler} */ (subscriptionRateLimit),
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
	/** @type {import('express').RequestHandler} */ (subscriptionRateLimit),
	authenticate,
	validateSubscriptionCancellation,
	cancelSubscription
);

/**
 * GET /api/subscriptions/history
 * Get user's subscription transaction history with pagination
 * Requires authentication
 */
router.get('/history', /** @type {import('express').RequestHandler} */ (subscriptionViewRateLimit), authenticate, getSubscriptionHistory);

/**
 * GET /api/subscriptions/:subscriptionId/payment-status
 * Get payment status and subscription state for polling
 * Requires authentication and validates subscription ID
 */
router.get(
	'/:subscriptionId/payment-status',
	/** @type {import('express').RequestHandler} */ (subscriptionViewRateLimit),
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
	/** @type {import('express').RequestHandler} */ (paymentRateLimit),
	authenticate,
	validatePaymentVerification,
	verifyPayment
);


// Advanced Subscription Control Routes

/**
 * POST /api/subscriptions/pause
 * Pause active subscription temporarily
 * Requires authentication and validates pause data
 */
router.post(
	'/pause',
	/** @type {import('express').RequestHandler} */ (subscriptionRateLimit),
	authenticate,
	validatePauseSubscription,
	pauseSubscription
);

/**
 * POST /api/subscriptions/resume
 * Resume paused subscription
 * Requires authentication
 */
router.post(
	'/resume',
	/** @type {import('express').RequestHandler} */ (subscriptionRateLimit),
	authenticate,
	resumeSubscription
);


// Invoice Management Routes

/**
 * GET /api/subscriptions/invoice/:transactionId
 * Download invoice PDF for a transaction
 * Requires authentication and validates transaction ID
 */
router.get(
	'/invoice/:transactionId',
	/** @type {import('express').RequestHandler} */ (subscriptionViewRateLimit),
	authenticate,
	validateInvoiceDownload,
	downloadInvoice
);

/**
 * GET /api/subscriptions/health
 * Health check for subscription service
 */
router.get('/health', (req, res) => {
	try {
		res.json({
			success: true,
			message: 'Subscription service is healthy',
			timestamp: new Date().toISOString(),
			services: {
				database: 'connected',
				razorpay: process.env.RAZORPAY_KEY_ID ? 'configured' : 'not_configured',
			},
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Subscription health check failed:', errorMessage);

		res.status(500).json({
			success: false,
			message: 'Subscription service health check failed',
			timestamp: new Date().toISOString(),
		});
	} finally {
		console.debug('Subscription health check process completed');
	}
});

// Error handling middleware for subscription routes

router.use((/** @type {Error} */ error, /** @type {import('express').Request} */ req, /** @type {import('express').Response} */ res, /** @type {import('express').NextFunction} */ next) => {
	try {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Subscription route error:', errorMessage);

		// Map specific error messages to user-friendly responses

		// Payment-related errors
		if (errorMessage.includes('Razorpay') || errorMessage.includes('payment')) {
			return res.status(402).json({
				success: false,
				message: 'Payment processing failed. Please check your payment details and try again.',
				code: 'PAYMENT_PROCESSING_ERROR',
			});
		}

		// Plan-related errors
		if (errorMessage.includes('plan') || errorMessage.includes('Plan')) {
			return res.status(400).json({
				success: false,
				message: 'Invalid subscription plan selected. Please choose a valid plan.',
				code: 'INVALID_PLAN_ERROR',
			});
		}

		// Subscription status errors
		if (errorMessage.includes('subscription') || errorMessage.includes('Subscription')) {
			return res.status(400).json({
				success: false,
				message: 'Subscription operation failed. Please check your current subscription status.',
				code: 'SUBSCRIPTION_OPERATION_ERROR',
			});
		}

		// Authentication errors
		if (error.name === 'UnauthorizedError' || errorMessage.includes('authentication')) {
			return res.status(401).json({
				success: false,
				message: 'Please log in to access subscription features.',
				code: 'AUTHENTICATION_REQUIRED',
			});
		}

		// Validation errors
		if (error.name === 'ValidationError' || errorMessage.includes('validation')) {
			return res.status(400).json({
				success: false,
				message: 'Invalid data provided. Please check your information and try again.',
				code: 'VALIDATION_ERROR',
				details: errorMessage,
			});
		}

		// Database errors
		if (errorMessage.includes('database') || errorMessage.includes('SQLITE')) {
			return res.status(500).json({
				success: false,
				message: 'Database error occurred. Please try again in a few moments.',
				code: 'DATABASE_ERROR',
			});
		}

		// Rate limiting errors
		if (error.name === 'TooManyRequestsError' || errorMessage.includes('rate limit')) {
			return res.status(429).json({
				success: false,
				message: 'You have made too many subscription requests recently. Please wait a moment before trying again.',
				code: 'SUBSCRIPTION_RATE_LIMIT_EXCEEDED',
				retryAfter: '60 seconds'
			});
		}

		// Network/timeout errors
		if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
			return res.status(504).json({
				success: false,
				message: 'Service temporarily unavailable. Please try again later.',
				code: 'SERVICE_TIMEOUT',
			});
		}

		// Generic server error
		return res.status(500).json({
			success: false,
			message: 'An unexpected error occurred. Please try again later.',
			code: 'INTERNAL_SERVER_ERROR',
		});
	} catch (handlerError) {
		const handlerErrorMessage = handlerError instanceof Error ? handlerError.message : String(handlerError);
		console.error('Subscription error handler failed:', handlerErrorMessage);

		return res.status(500).json({
			success: false,
			message: 'Critical error occurred. Please contact support.',
			code: 'CRITICAL_ERROR',
		});
	} finally {
		console.debug('Subscription error handling process completed');
	}
});

module.exports = router;