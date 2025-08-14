/**
 * Subscription cleanup routes
 * Handles subscription timeout and cleanup operations
 * Adapted for current project structure from MicroSAASTemplate
 */

const express = require('express');
const { runSubscriptionCleanup, expireUnpaidSubscriptions } = require('../utils/subscription-cleanup.js');
const { authenticate } = require('../middleware/auth.js');
const { apiRateLimiter } = require('../utils/rateLimiter.js');

const router = express.Router();

// Apply rate limiting to all cleanup routes
router.use(apiRateLimiter);

/**
 * Manual cleanup trigger (authenticated users only)
 * POST /api/subscription-cleanup/run
 * Runs comprehensive subscription cleanup including expired and old subscriptions
 */
router.post('/run', authenticate, async (req, res) => {
	try {
		// In a production environment, you might want to add admin role check here
		// For now, any authenticated user can trigger cleanup (mainly for testing)
		
		console.log(`Subscription cleanup triggered by user ${req.user?.userId}`);
		
		const result = await runSubscriptionCleanup();
		
		res.json({
			success: true,
			message: 'Subscription cleanup completed successfully',
			data: {
				expired: result.expired,
				cleaned: result.cleaned,
				errors: result.errors
			},
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Cleanup endpoint error:', errorMessage);
		
		res.status(500).json({
			success: false,
			message: 'Failed to run subscription cleanup',
			error: errorMessage,
			timestamp: new Date().toISOString()
		});
	} finally {
		console.debug('Cleanup endpoint process completed');
	}
});

/**
 * Expire unpaid subscriptions only
 * POST /api/subscription-cleanup/expire-unpaid
 * Expires only subscriptions that are in 'created' status and unpaid for too long
 */
router.post('/expire-unpaid', authenticate, async (req, res) => {
	try {
		console.log(`Unpaid subscription expiry triggered by user ${req.user?.userId}`);
		
		const result = await expireUnpaidSubscriptions();
		
		res.json({
			success: true,
			message: 'Unpaid subscriptions processed successfully',
			data: {
				expired: result.expired,
				errors: result.errors
			},
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Expire unpaid endpoint error:', errorMessage);
		
		res.status(500).json({
			success: false,
			message: 'Failed to expire unpaid subscriptions',
			error: errorMessage,
			timestamp: new Date().toISOString()
		});
	} finally {
		console.debug('Expire unpaid endpoint process completed');
	}
});

/**
 * Health check for cleanup service
 * GET /api/subscription-cleanup/health
 * Returns the health status of the subscription cleanup service
 */
router.get('/health', (req, res) => {
	try {
		res.json({
			success: true,
			message: 'Subscription cleanup service is healthy',
			service: 'subscription-cleanup',
			version: '1.0.0',
			database: 'postgresql',
			timeout_minutes: require('../utils/subscription-cleanup.js').SUBSCRIPTION_TIMEOUT_MINUTES,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Health check error:', errorMessage);
		
		res.status(500).json({
			success: false,
			message: 'Subscription cleanup service health check failed',
			error: errorMessage,
			timestamp: new Date().toISOString()
		});
	} finally {
		console.debug('Health check process completed');
	}
});

/**
 * Error handling middleware for subscription cleanup routes
 * Catches any unhandled errors in cleanup endpoints
 */
router.use((/** @type {Error} */ error, /** @type {import('express').Request} */ req, /** @type {import('express').Response} */ res, /** @type {import('express').NextFunction} */ next) => {
	const errorMessage = error instanceof Error ? error.message : String(error);
	console.error('Subscription cleanup route error:', {
		error: errorMessage,
		stack: error instanceof Error ? error.stack : undefined,
		url: req.url,
		method: req.method,
		timestamp: new Date().toISOString(),
	});

	res.status(500).json({
		success: false,
		message: 'Internal server error in subscription cleanup',
		timestamp: new Date().toISOString(),
	});
});

module.exports = router;