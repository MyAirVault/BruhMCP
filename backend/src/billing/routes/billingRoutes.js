/**
 * Billing Routes - API endpoints for Pro plan subscription management
 * @fileoverview Defines all billing-related API routes
 */

import { Router } from 'express';
import express from 'express';
import { 
	createCheckoutSession, 
	handleCheckoutSuccess, 
	getBillingStatus, 
	cancelSubscription,
	getPaymentHistory,
	getDetailedSubscriptionInfo
} from '../controllers/checkoutController.js';
import { 
	handleRazorpayWebhook, 
	getWebhookEvents 
} from '../controllers/webhookController.js';
import { requireAuth } from '../../middleware/authMiddleware.js';
import { requireAdmin } from '../../middleware/adminMiddleware.js';

const router = Router();

// === Checkout and Subscription Management ===
// All require authentication

// POST /api/v1/billing/checkout - Create Pro plan checkout session
router.post('/checkout', requireAuth, createCheckoutSession);

// POST /api/v1/billing/success - Handle successful checkout callback
router.post('/success', requireAuth, handleCheckoutSuccess);

// GET /api/v1/billing/status - Get current billing status
router.get('/status', requireAuth, getBillingStatus);

// POST /api/v1/billing/cancel - Cancel current subscription
router.post('/cancel', requireAuth, cancelSubscription);

// GET /api/v1/billing/payment-history - Get payment history from Razorpay
router.get('/payment-history', requireAuth, getPaymentHistory);

// GET /api/v1/billing/subscription-details - Get detailed subscription info from Razorpay
router.get('/subscription-details', requireAuth, getDetailedSubscriptionInfo);

// === Webhooks ===
// Webhooks don't require auth (verified by signature)

// POST /api/v1/billing/webhooks/razorpay - Razorpay webhook endpoint
// Use raw body for webhook signature verification
router.post('/webhooks/razorpay', 
	express.raw({ type: 'application/json' }), 
	handleRazorpayWebhook
);

// Subscription callback endpoint (for Razorpay redirect)
router.post('/subscription-callback', (req, res) => {
	// Just acknowledge the callback - actual processing happens via webhooks
	console.log('Subscription callback received:', req.body);
	res.json({ status: 'ok' });
});

// === Admin Endpoints ===
// Require admin privileges for debugging and monitoring

// GET /api/v1/billing/admin/webhook-events - Get webhook processing history
router.get('/admin/webhook-events', requireAuth, requireAdmin, getWebhookEvents);

export default router;