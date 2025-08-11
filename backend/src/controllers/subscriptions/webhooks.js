/**
 * Razorpay webhook handlers for subscription lifecycle events
 * Handles all webhook events to keep local subscription data in sync with Razorpay
 * Updated to use PostgreSQL instead of SQLite
 *
 * @fileoverview Comprehensive webhook handlers for Razorpay subscription events
 */

const crypto = require('crypto');
const { pool } = require('../../db/config.js'); // PostgreSQL connection pool
// const { capturePayment } = require('../../utils/razorpay'); // Currently unused

/**
 * @typedef {Object} RazorpaySubscription
 * @property {string} id - Razorpay subscription ID
 * @property {string} status - Subscription status
 * @property {number} current_start - Current period start timestamp
 * @property {number} current_end - Current period end timestamp
 */

/**
 * @typedef {Object} RazorpayPayment
 * @property {string} id - Payment ID
 * @property {string} status - Payment status
 * @property {number} amount - Payment amount
 * @property {string} method - Payment method
 * @property {string} subscription_id - Associated subscription ID
 */

/**
 * @typedef {Object} SubscriptionWebhookPayload
 * @property {RazorpaySubscription} subscription - Subscription data
 */

/**
 * @typedef {Object} PaymentWebhookPayload
 * @property {RazorpayPayment} payment - Payment data
 */

/**
 * @typedef {Object} DatabaseSubscription
 * @property {number} id - Subscription ID
 * @property {number} user_id - User ID
 * @property {string} status - Subscription status
 * @property {string} plan_code - Plan code
 * @property {number} total_amount - Total amount
 * @property {string} [razorpay_subscription_id] - Razorpay subscription ID
 * @property {number} [failed_payment_count] - Failed payment count
 * @property {number} [pause_count] - Pause count
 */

/**
 * Verify Razorpay webhook signature for security
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
async function verifyRazorpayWebhook(req, res, next) {
	try {
		const webhookSignature = req.headers['x-razorpay-signature'];
		const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

		if (!webhookSecret) {
			console.error('Razorpay webhook secret not configured');
			res.status(500).json({
				success: false,
				message: 'Webhook configuration error',
				timestamp: new Date().toISOString(),
			});
			return;
		}

		if (!webhookSignature) {
			console.error('Missing webhook signature in request');
			res.status(400).json({
				success: false,
				message: 'Missing webhook signature',
				timestamp: new Date().toISOString(),
			});
			return;
		}

		// Verify webhook signature
		const body = JSON.stringify(req.body);
		const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');

		// Handle array of signatures (some webhooks send multiple)
		const signatureToVerify = Array.isArray(webhookSignature) ? webhookSignature[0] : webhookSignature;
		
		// Remove 'sha256=' prefix if present
		const cleanSignature = signatureToVerify.replace('sha256=', '');

		const isValid = crypto.timingSafeEqual(
			Buffer.from(cleanSignature, 'hex'),
			Buffer.from(expectedSignature, 'hex')
		);

		if (!isValid) {
			console.error('Invalid webhook signature detected');
			res.status(401).json({
				success: false,
				message: 'Invalid webhook signature',
				timestamp: new Date().toISOString(),
			});
			return;
		}

		console.log('Webhook signature verified successfully');
		next();
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Webhook signature verification failed:', errorMessage);

		res.status(500).json({
			success: false,
			message: 'Webhook signature verification failed',
			timestamp: new Date().toISOString(),
		});
	} finally {
		console.debug('Webhook signature verification process completed');
	}
}

/**
 * Handle subscription.authenticated event
 * @param {SubscriptionWebhookPayload} payload - Webhook payload
 * @returns {Promise<Object>} Processing result
 */
async function handleSubscriptionAuthenticated(payload) {
	try {
		const subscription = payload.subscription;
		const subscriptionId = subscription.id;

		console.log(`Processing subscription.authenticated for: ${subscriptionId}`);

		// Update user subscription status to authenticated
		const client = await pool.connect();
		const result = await client.query(
			`UPDATE user_subscriptions 
			 SET status = 'authenticated', updated_at = CURRENT_TIMESTAMP
			 WHERE razorpay_subscription_id = $1`,
			[subscriptionId]
		);

		client.release();

		if (result.rowCount && result.rowCount > 0) {
			console.log(`Subscription ${subscriptionId} authenticated successfully`);
			return {
				success: true,
				message: 'Subscription authenticated',
				action: 'updated',
				subscription_id: subscriptionId
			};
		} else {
			console.warn(`No user plan found for subscription: ${subscriptionId}`);
			return {
				success: false,
				message: 'Subscription not found in user plans',
				action: 'not_found'
			};
		}

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Failed to handle subscription.authenticated:', errorMessage);
		throw error;
	} finally {
		console.debug('Handle subscription.authenticated process completed');
	}
}

/**
 * Handle subscription.activated event
 * @param {SubscriptionWebhookPayload} payload - Webhook payload
 * @returns {Promise<Object>} Processing result
 */
async function handleSubscriptionActivated(payload) {
	try {
		const subscription = payload.subscription;
		const subscriptionId = subscription.id;

		console.log(`Processing subscription.activated for: ${subscriptionId}`);

		const client = await pool.connect();
		
		// Update subscription to active
		const result = await client.query(
			`UPDATE user_subscriptions 
			 SET status = 'active', updated_at = CURRENT_TIMESTAMP
			 WHERE razorpay_subscription_id = $1`,
			[subscriptionId]
		);

		client.release();

		if (result.rowCount && result.rowCount > 0) {
			console.log(`Subscription ${subscriptionId} activated successfully`);
			return {
				success: true,
				message: 'Subscription activated',
				action: 'activated'
			};
		} else {
			console.warn(`No user plan found for subscription: ${subscriptionId}`);
			return {
				success: false,
				message: 'Subscription not found',
				action: 'not_found'
			};
		}

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Failed to handle subscription.activated:', errorMessage);
		throw error;
	} finally {
		console.debug('Handle subscription.activated process completed');
	}
}

/**
 * Handle subscription.cancelled event
 * @param {SubscriptionWebhookPayload} payload - Webhook payload
 * @returns {Promise<Object>} Processing result
 */
async function handleSubscriptionCancelled(payload) {
	try {
		const subscription = payload.subscription;
		const subscriptionId = subscription.id;

		console.log(`Processing subscription.cancelled for: ${subscriptionId}`);

		const client = await pool.connect();
		
		// Update subscription to cancelled and create free subscription
		const result = await client.query(
			`UPDATE user_subscriptions 
			 SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
			 WHERE razorpay_subscription_id = $1`,
			[subscriptionId]
		);

		// Create free subscription for user if they don't have one
		if (result.rowCount && result.rowCount > 0) {
			const cancelledSub = await client.query(
				'SELECT user_id FROM user_subscriptions WHERE razorpay_subscription_id = $1',
				[subscriptionId]
			);
			
			if (cancelledSub.rows.length > 0) {
				const userId = cancelledSub.rows[0].user_id;
				
				// Check if user already has an active free subscription
				const freeSubCheck = await client.query(
					`SELECT id FROM user_subscriptions 
					 WHERE user_id = $1 AND plan_code = 'free' AND status = 'active'`,
					[userId]
				);
				
				// Create free subscription only if they don't have one
				if (freeSubCheck.rows.length === 0) {
					await client.query(
						`INSERT INTO user_subscriptions (
							user_id, plan_code, status, billing_cycle, 
							current_period_start, current_period_end, total_amount
						) VALUES ($1, 'free', 'active', 'monthly', 
							CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', 0)`,
						[userId]
					);
				}
			}
		}

		client.release();

		if (result.rowCount && result.rowCount > 0) {
			console.log(`Subscription ${subscriptionId} cancelled, user downgraded to free plan`);
			return {
				success: true,
				message: 'Subscription cancelled, downgraded to free plan',
				action: 'downgraded'
			};
		} else {
			console.warn(`No user plan found for subscription: ${subscriptionId}`);
			return {
				success: false,
				message: 'Subscription not found',
				action: 'not_found'
			};
		}

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Failed to handle subscription.cancelled:', errorMessage);
		throw error;
	} finally {
		console.debug('Handle subscription.cancelled process completed');
	}
}

/**
 * Handle payment.failed event
 * @param {PaymentWebhookPayload} payload - Webhook payload
 * @returns {Promise<Object>} Processing result
 */
async function handlePaymentFailed(payload) {
	try {
		const payment = payload.payment;
		const subscriptionId = payment.subscription_id;

		console.log(`Processing payment.failed for subscription: ${subscriptionId}`);

		const client = await pool.connect();
		
		// Increment failed payment count and update status
		const result = await client.query(
			`UPDATE user_subscriptions 
			 SET failed_payment_count = failed_payment_count + 1, 
			     last_payment_attempt = CURRENT_TIMESTAMP,
			     status = CASE WHEN failed_payment_count >= 2 THEN 'past_due' ELSE status END,
			     updated_at = CURRENT_TIMESTAMP
			 WHERE razorpay_subscription_id = $1`,
			[subscriptionId]
		);

		client.release();

		if (result.rowCount && result.rowCount > 0) {
			console.log(`Payment failed for subscription ${subscriptionId}`);
			return {
				success: true,
				message: 'Payment failure recorded',
				action: 'failed'
			};
		} else {
			console.warn(`No user plan found for subscription: ${subscriptionId}`);
			return {
				success: false,
				message: 'Subscription not found',
				action: 'not_found'
			};
		}

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Failed to handle payment.failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Handle payment.failed process completed');
	}
}

/**
 * Main webhook event handler
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
async function handleRazorpayWebhook(req, res) {
	try {
		const { event, payload } = req.body;
		const eventType = event.event;

		console.log(`Processing Razorpay webhook: ${eventType}`);
		console.log('Webhook payload:', JSON.stringify(payload, null, 2));

		let result;

		// Route to appropriate handler based on event type
		switch (eventType) {
			case 'subscription.authenticated':
				result = await handleSubscriptionAuthenticated({ event, ...payload });
				break;

			case 'subscription.activated':
				result = await handleSubscriptionActivated({ event, ...payload });
				break;

			case 'subscription.cancelled':
				result = await handleSubscriptionCancelled({ event, ...payload });
				break;

			case 'payment.failed':
				result = await handlePaymentFailed({ event, ...payload });
				break;

			default:
				console.log(`Unhandled webhook event: ${eventType}`);
				result = {
					success: true,
					message: 'Event type not handled',
					action: 'ignored'
				};
		}

		// Always respond with 200 to acknowledge receipt
		res.status(200).json({
			success: true,
			message: 'Webhook processed successfully',
			event_type: eventType,
			result: result,
			timestamp: new Date().toISOString()
		});

		console.log(`Webhook ${eventType} processed successfully:`, result);

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Failed to process Razorpay webhook:', errorMessage);

		// Still respond with 200 to prevent retry loops
		res.status(200).json({
			success: false,
			message: 'Webhook processing failed',
			error: errorMessage,
			timestamp: new Date().toISOString()
		});
	} finally {
		console.debug('Razorpay webhook processing completed');
	}
}

module.exports = {
	verifyRazorpayWebhook,
	handleRazorpayWebhook,
	handleSubscriptionAuthenticated,
	handleSubscriptionActivated,
	handleSubscriptionCancelled,
	handlePaymentFailed
};