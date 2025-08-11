/**
 * Webhook API routes for payment gateway integrations
 * Handles incoming webhooks from Razorpay and other payment providers
 * Adapted to match current project structure
 *
 * @fileoverview Webhook API routes with signature verification
 */

const express = require('express');

// Import webhook controllers
const {
	verifyRazorpayWebhook,
	handleRazorpayWebhook,
} = require('../controllers/subscriptions/webhooks');

// Create router instance
const router = express.Router();

// Middleware to parse raw body for webhook signature verification
// This must be applied before JSON parsing for proper signature verification
router.use('/razorpay', express.raw({ type: 'application/json' }));

// Convert raw body back to JSON for processing
router.use('/razorpay', (req, res, next) => {
	if (req.body) {
		try {
			req.body = JSON.parse(req.body.toString());
		} catch (error) {
			console.error('Failed to parse webhook JSON:', error);
			return res.status(400).json({
				success: false,
				message: 'Invalid JSON in webhook payload',
				timestamp: new Date().toISOString(),
			});
		}
	}
	next();
});

/**
 * POST /api/webhooks/razorpay
 * Handle Razorpay webhook events
 * Includes signature verification for security
 */
router.post('/razorpay', verifyRazorpayWebhook, handleRazorpayWebhook);

/**
 * GET /api/webhooks/health
 * Health check endpoint for webhook service
 */
router.get('/health', (req, res) => {
	res.json({
		success: true,
		message: 'Webhook service is healthy',
		timestamp: new Date().toISOString(),
		services: {
			razorpay: 'active'
		}
	});
});

/**
 * Error handling middleware for webhook routes
 * Catches any unhandled errors in webhook endpoints
 */
router.use((error, req, res, next) => {
	console.error('Webhook route error:', {
		error: error.message,
		stack: error.stack,
		url: req.url,
		method: req.method,
		headers: req.headers,
		timestamp: new Date().toISOString(),
	});

	// Always return 200 for webhooks to prevent retries
	res.status(200).json({
		success: false,
		message: 'Webhook processing failed',
		error: error.message,
		timestamp: new Date().toISOString(),
	});
});

module.exports = router;