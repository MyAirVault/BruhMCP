/**
 * Webhook Controller - Handles Razorpay webhook events
 * @fileoverview Processes subscription events and updates user plans accordingly
 */

const { parseWebhookEvent } = require('../services/paymentGateway.js');
const { updateUserPlanBilling, getUserPlanBySubscriptionId, atomicActivateProSubscription } = require('../../db/queries/userPlansQueries.js');
const { handlePlanCancellation } = require('../../utils/planLimits.js');
const { pool } = require('../../db/config.js');

/**
 * Store webhook event for deduplication and tracking
 * @param {string} eventId - External event ID from payment gateway
 * @param {string} eventType - Type of webhook event
 * @param {string} gateway - Payment gateway (razorpay)
 * @param {Object} payload - Full webhook payload
 * @param {string} status - Processing status
 * @param {string|null} errorMessage - Error message if failed
 * @returns {Promise<Object>} Stored event record
 */
async function storeWebhookEvent(eventId, eventType, gateway, payload, status = 'pending', errorMessage = null) {
	try {
		const query = `
			INSERT INTO webhook_events (external_event_id, event_type, payment_gateway, payload, processing_status, error_message)
			VALUES ($1, $2, $3, $4, $5, $6)
			ON CONFLICT (external_event_id) DO UPDATE SET
				processing_status = EXCLUDED.processing_status,
				error_message = EXCLUDED.error_message,
				processed_at = CURRENT_TIMESTAMP
			RETURNING *
		`;

		const values = [eventId, eventType, gateway, JSON.stringify(payload), status, errorMessage];
		const result = await pool.query(query, values);

		return result.rows[0];
	} catch (error) {
		console.error('Error storing webhook event:', error);
		throw error instanceof Error ? error : new Error(String(error));
	}
}

/**
 * Check if webhook event has already been processed
 * @param {string} eventId - External event ID
 * @returns {Promise<boolean>} True if already processed
 */
async function isEventProcessed(eventId) {
	try {
		const query = `
			SELECT processing_status 
			FROM webhook_events 
			WHERE external_event_id = $1
		`;

		const result = await pool.query(query, [eventId]);
		
		if (result.rows.length === 0) {
			return false;
		}

		const status = result.rows[0].processing_status;
		return status === 'processed' || status === 'skipped';
	} catch (error) {
		console.error('Error checking event processing status:', error instanceof Error ? error.message : String(error));
		return false;
	}
}

/**
 * Process subscription activated event
 * @param {any} subscription - Razorpay subscription object
 * @returns {Promise<void>}
 */
async function processSubscriptionActivated(subscription) {
	console.log('📋 Full subscription object:', JSON.stringify(subscription, null, 2));
	
	// Check different possible locations for userId
	let userId = subscription.notes?.userId || 
				 subscription.notes?.user_id ||
				 subscription.metadata?.userId ||
				 subscription.metadata?.user_id;
	
	// Log what we found
	console.log('🔍 Looking for userId:');
	console.log('  - subscription.notes:', subscription.notes);
	console.log('  - subscription.metadata:', subscription.metadata);
	console.log('  - Found userId:', userId);
	
	if (!userId) {
		console.error('❌ User ID not found in subscription data');
		throw new Error('User ID not found in subscription');
	}

	console.log(`🔄 Processing subscription activated for user ${userId}: ${subscription.id}`);

	// Use atomic function to prevent race conditions with frontend success handler
	const result = await atomicActivateProSubscription(
		userId,
		subscription.id,
		new Date(subscription.current_end * 1000),
		subscription.customer_id
	);

	if (result && typeof result === 'object' && 'status' in result && result.status === 'already_active') {
		console.log(`ℹ️ User ${userId} subscription ${subscription.id} already activated`);
	} else {
		console.log(`✅ User ${userId} upgraded to Pro plan with subscription ${subscription.id}`);
	}
}

/**
 * Process subscription cancelled event
 * @param {any} subscription - Razorpay subscription object
 * @returns {Promise<void>}
 */
async function processSubscriptionCancelled(subscription) {
	const userId = subscription.notes?.userId;
	
	if (!userId) {
		throw new Error('User ID not found in subscription notes');
	}

	console.log(`🔄 Processing subscription cancellation for user ${userId}: ${subscription.id}`);

	// Use existing plan cancellation logic
	const cancellationResult = await handlePlanCancellation(userId);

	// Update payment status - using empty customerId as it's not needed for cancellation
	await updateUserPlanBilling(userId, {
		subscriptionId: subscription.id,
		customerId: '',
		paymentStatus: 'cancelled'
	});

	const deactivatedCount = cancellationResult && typeof cancellationResult === 'object' && 'deactivatedInstances' in cancellationResult
		? cancellationResult.deactivatedInstances
		: 0;
	console.log(`✅ User ${userId} downgraded to Free plan. Deactivated ${deactivatedCount} instances`);
}

/**
 * Process payment failed event
 * @param {any} payment - Razorpay payment object
 * @returns {Promise<void>}
 */
async function processPaymentFailed(payment) {
	// Log the payment object to debug
	console.log('Payment failed webhook data:', JSON.stringify(payment, null, 2));
	
	// Try to find subscription ID in different places
	const subscriptionId = payment.notes?.subscriptionId || 
						   payment.subscription_id || 
						   payment.notes?.subscription_id;
	
	if (!subscriptionId) {
		console.warn('No subscription ID found in failed payment. Payment data:', {
			id: payment.id,
			notes: payment.notes,
			subscription_id: payment.subscription_id,
			description: payment.description
		});
		return;
	}

	// Get user by subscription ID
	const userPlan = await getUserPlanBySubscriptionId(subscriptionId);

	if (!userPlan) {
		console.warn(`No user found for subscription ${subscriptionId}`);
		return;
	}

	const { user_id: userId } = userPlan;

	console.log(`💳 Processing payment failure for user ${userId}, subscription ${subscriptionId}`);

	// Update payment status to failed - using empty customerId as it's not needed for failure
	await updateUserPlanBilling(userId, {
		subscriptionId: subscriptionId,
		customerId: '',
		paymentStatus: 'failed'
	});

	console.log(`⚠️ User ${userId} payment failed - subscription ${subscriptionId} marked as failed`);
}

/**
 * Process payment authorized event
 * @param {any} payment - Razorpay payment object
 * @returns {Promise<void>}
 */
async function processPaymentAuthorized(payment) {
	// For subscription payments, the subscription will be activated via subscription.activated webhook
	// This is just for logging and tracking
	const subscriptionId = payment.subscription_id || payment.notes?.subscription_id;
	
	if (subscriptionId) {
		console.log(`💳 Payment authorized for subscription ${subscriptionId}: ${payment.id}`);
		console.log(`   Amount: ₹${payment.amount / 100}`);
		console.log(`   Status: ${payment.status}`);
	} else {
		console.log(`💳 Payment authorized (non-subscription): ${payment.id}`);
	}
}

/**
 * Main Razorpay webhook handler
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function handleRazorpayWebhook(req, res) {
	try {
		// Check both lowercase and uppercase headers
		const signatureHeader = req.headers['x-razorpay-signature'] || req.headers['X-Razorpay-Signature'];
		const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
		
		if (!signature) {
			console.error('Missing Razorpay signature header');
			res.status(400).json({ error: 'Missing signature header' });
			return;
		}
		
		// When using express.raw(), req.body is a Buffer
		const payload = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);

		// Parse and verify webhook event
		const event = parseWebhookEvent(payload, signature);
		/** @type {any} */
		const eventData = event;

		console.log(`📬 Received Razorpay webhook: ${eventData.type} (${eventData.id})`);

		// Check if event already processed
		const alreadyProcessed = await isEventProcessed(eventData.id);
		if (alreadyProcessed) {
			console.log(`⏭️ Event ${eventData.id} already processed, skipping`);
			await storeWebhookEvent(eventData.id, eventData.type, 'razorpay', eventData, 'skipped');
			res.json({ received: true, status: 'skipped' });
			return;
		}

		// Store webhook event as pending
		await storeWebhookEvent(eventData.id, eventData.type, 'razorpay', eventData, 'pending');

		try {
			// Process different event types
			switch (eventData.type) {
				case 'subscription.activated':
				case 'subscription.authenticated':
					console.log('🔍 Webhook event data:', JSON.stringify(eventData.data, null, 2));
					if (eventData.data && eventData.data.subscription && eventData.data.subscription.entity) {
						await processSubscriptionActivated(eventData.data.subscription.entity);
					}
					break;

				case 'subscription.cancelled':
					if (eventData.data && eventData.data.subscription && eventData.data.subscription.entity) {
						await processSubscriptionCancelled(eventData.data.subscription.entity);
					}
					break;

				case 'payment.failed':
					if (eventData.data && eventData.data.payment && eventData.data.payment.entity) {
						await processPaymentFailed(eventData.data.payment.entity);
					}
					break;

				case 'subscription.charged':
					// Handle successful recurring payment
					if (eventData.data && eventData.data.subscription && eventData.data.subscription.entity) {
						console.log(`ℹ️ Subscription charged: ${eventData.data.subscription.entity.id}`);
					}
					break;

				case 'subscription.completed':
					// Handle subscription completion
					if (eventData.data && eventData.data.subscription && eventData.data.subscription.entity) {
						console.log(`ℹ️ Subscription completed: ${eventData.data.subscription.entity.id}`);
					}
					break;

				case 'payment.authorized':
					// Payment authorized for subscription
					console.log(`💳 Payment authorized for subscription`);
					if (eventData.data && eventData.data.payment && eventData.data.payment.entity) {
						await processPaymentAuthorized(eventData.data.payment.entity);
					}
					break;

				case 'order.paid':
					// Order paid event
					if (eventData.data && eventData.data.order && eventData.data.order.entity) {
						console.log(`💰 Order paid: ${eventData.data.order.entity.id}`);
					}
					break;

				case 'invoice.paid':
					// Invoice paid for subscription
					if (eventData.data && eventData.data.invoice && eventData.data.invoice.entity) {
						console.log(`📄 Invoice paid: ${eventData.data.invoice.entity.id}`);
					}
					break;

				default:
					console.log(`ℹ️ Unhandled webhook event type: ${eventData.type}`);
					await storeWebhookEvent(eventData.id, eventData.type, 'razorpay', eventData, 'skipped', 'Unhandled event type');
					res.json({ received: true, status: 'unhandled' });
					return;
			}

			// Mark event as successfully processed
			await storeWebhookEvent(eventData.id, eventData.type, 'razorpay', eventData, 'processed');

			console.log(`✅ Successfully processed webhook ${eventData.id} (${eventData.type})`);

			res.json({ received: true, status: 'processed' });

		} catch (processingError) {
			console.error(`❌ Error processing webhook ${eventData.id}:`, processingError);
			
			const errorMessage = processingError instanceof Error ? processingError.message : String(processingError);
			// Mark event as failed
			await storeWebhookEvent(eventData.id, eventData.type, 'razorpay', eventData, 'failed', errorMessage);

			// Still return 200 to prevent Razorpay retries for business logic errors
			res.json({ received: true, status: 'failed', error: errorMessage });
			return;
		}

	} catch (error) {
		console.error('❌ Webhook signature verification failed:', error instanceof Error ? error.message : String(error));
		res.status(400).json({
			error: {
				code: 'WEBHOOK_SIGNATURE_INVALID',
				message: 'Invalid webhook signature'
			}
		});
	}
}

/**
 * Get webhook event processing status (for debugging)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
async function getWebhookEvents(req, res) {
	try {
		const queryParams = req.query;
		const limit = typeof queryParams.limit === 'string' ? queryParams.limit : '50';
		const offset = typeof queryParams.offset === 'string' ? queryParams.offset : '0';
		const status = typeof queryParams.status === 'string' ? queryParams.status : null;

		let query = `
			SELECT 
				event_id,
				external_event_id,
				event_type,
				payment_gateway,
				processing_status,
				error_message,
				created_at,
				processed_at
			FROM webhook_events
		`;

		const params = [];
		let paramIndex = 1;

		if (status) {
			query += ` WHERE processing_status = $${paramIndex}`;
			params.push(status);
			paramIndex++;
		}

		query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
		params.push(parseInt(limit), parseInt(offset));

		const result = await pool.query(query, params);

		res.json({
			message: 'Webhook events retrieved successfully',
			data: {
				events: result.rows,
				pagination: {
					limit: parseInt(limit),
					offset: parseInt(offset),
					total: result.rows.length
				}
			}
		});

	} catch (error) {
		console.error('Error retrieving webhook events:', error instanceof Error ? error.message : String(error));
		res.status(500).json({
			error: {
				code: 'WEBHOOK_EVENTS_ERROR',
				message: 'Failed to retrieve webhook events',
				details: error instanceof Error ? error.message : String(error)
			}
		});
	}
}

module.exports = {
	handleRazorpayWebhook,
	getWebhookEvents
};