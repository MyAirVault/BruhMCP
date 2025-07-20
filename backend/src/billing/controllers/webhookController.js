/**
 * Webhook Controller - Handles Razorpay webhook events
 * @fileoverview Processes subscription events and updates user plans accordingly
 */

import { parseWebhookEvent } from '../services/paymentGateway.js';
import { updateUserPlan, getUserPlan, updateUserPlanBilling, getUserPlanBySubscriptionId, atomicActivateProSubscription } from '../../db/queries/userPlansQueries.js';
import { handlePlanCancellation } from '../../utils/planLimits.js';
import { pool } from '../../db/config.js';

/**
 * Store webhook event for deduplication and tracking
 * @param {string} eventId - External event ID from payment gateway
 * @param {string} eventType - Type of webhook event
 * @param {string} gateway - Payment gateway (razorpay)
 * @param {Object} payload - Full webhook payload
 * @param {string} status - Processing status
 * @param {string} errorMessage - Error message if failed
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
		throw error;
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
		console.error('Error checking event processing status:', error);
		return false;
	}
}

/**
 * Process subscription activated event
 * @param {Object} subscription - Razorpay subscription object
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

	if (result.status === 'already_active') {
		console.log(`ℹ️ User ${userId} subscription ${subscription.id} already activated`);
	} else {
		console.log(`✅ User ${userId} upgraded to Pro plan with subscription ${subscription.id}`);
	}
}

/**
 * Process subscription cancelled event
 * @param {Object} subscription - Razorpay subscription object
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

	// Update payment status
	await updateUserPlanBilling(userId, {
		subscriptionId: subscription.id,
		paymentStatus: 'cancelled'
	});

	console.log(`✅ User ${userId} downgraded to Free plan. Deactivated ${cancellationResult.deactivatedInstances} instances`);
}

/**
 * Process payment failed event
 * @param {Object} payment - Razorpay payment object
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

	const { user_id: userId, plan_type: planType } = userPlan;

	console.log(`💳 Processing payment failure for user ${userId}, subscription ${subscriptionId}`);

	// Update payment status to failed
	await updateUserPlanBilling(userId, {
		subscriptionId: subscriptionId,
		paymentStatus: 'failed'
	});

	console.log(`⚠️ User ${userId} payment failed - subscription ${subscriptionId} marked as failed`);
}

/**
 * Process payment authorized event
 * @param {Object} payment - Razorpay payment object
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
 */
export async function handleRazorpayWebhook(req, res) {
	try {
		// Check both lowercase and uppercase headers
		const signature = req.headers['x-razorpay-signature'] || req.headers['X-Razorpay-Signature'];
		
		if (!signature) {
			console.error('Missing Razorpay signature header');
			return res.status(400).json({ error: 'Missing signature header' });
		}
		
		// When using express.raw(), req.body is a Buffer
		const payload = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);

		// Parse and verify webhook event
		const event = parseWebhookEvent(payload, signature);

		console.log(`📬 Received Razorpay webhook: ${event.type} (${event.id})`);

		// Check if event already processed
		const alreadyProcessed = await isEventProcessed(event.id);
		if (alreadyProcessed) {
			console.log(`⏭️ Event ${event.id} already processed, skipping`);
			await storeWebhookEvent(event.id, event.type, 'razorpay', event, 'skipped');
			return res.json({ received: true, status: 'skipped' });
		}

		// Store webhook event as pending
		await storeWebhookEvent(event.id, event.type, 'razorpay', event, 'pending');

		try {
			// Process different event types
			switch (event.type) {
				case 'subscription.activated':
				case 'subscription.authenticated':
					console.log('🔍 Webhook event data:', JSON.stringify(event.data, null, 2));
					await processSubscriptionActivated(event.data.subscription.entity);
					break;

				case 'subscription.cancelled':
					await processSubscriptionCancelled(event.data.subscription.entity);
					break;

				case 'payment.failed':
					await processPaymentFailed(event.data.payment.entity);
					break;

				case 'subscription.charged':
					// Handle successful recurring payment
					console.log(`ℹ️ Subscription charged: ${event.data.subscription.entity.id}`);
					break;

				case 'subscription.completed':
					// Handle subscription completion
					console.log(`ℹ️ Subscription completed: ${event.data.subscription.entity.id}`);
					break;

				case 'payment.authorized':
					// Payment authorized for subscription
					console.log(`💳 Payment authorized for subscription`);
					await processPaymentAuthorized(event.data.payment.entity);
					break;

				case 'order.paid':
					// Order paid event
					console.log(`💰 Order paid: ${event.data.order.entity.id}`);
					break;

				case 'invoice.paid':
					// Invoice paid for subscription
					console.log(`📄 Invoice paid: ${event.data.invoice.entity.id}`);
					break;

				default:
					console.log(`ℹ️ Unhandled webhook event type: ${event.type}`);
					await storeWebhookEvent(event.id, event.type, 'razorpay', event, 'skipped', 'Unhandled event type');
					return res.json({ received: true, status: 'unhandled' });
			}

			// Mark event as successfully processed
			await storeWebhookEvent(event.id, event.type, 'razorpay', event, 'processed');

			console.log(`✅ Successfully processed webhook ${event.id} (${event.type})`);

			res.json({ received: true, status: 'processed' });

		} catch (processingError) {
			console.error(`❌ Error processing webhook ${event.id}:`, processingError);
			
			// Mark event as failed
			await storeWebhookEvent(event.id, event.type, 'razorpay', event, 'failed', processingError.message);

			// Still return 200 to prevent Razorpay retries for business logic errors
			res.json({ received: true, status: 'failed', error: processingError.message });
		}

	} catch (error) {
		console.error('❌ Webhook signature verification failed:', error);
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
 */
export async function getWebhookEvents(req, res) {
	try {
		const { limit = 50, offset = 0, status = null } = req.query;

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
		params.push(limit, offset);

		const result = await pool.query(query, params);

		res.json({
			message: 'Webhook events retrieved successfully',
			data: {
				events: result.rows,
				pagination: {
					limit: parseInt(limit),
					offset: parseInt(offset),
					total: result.rowCount
				}
			}
		});

	} catch (error) {
		console.error('Error retrieving webhook events:', error);
		res.status(500).json({
			error: {
				code: 'WEBHOOK_EVENTS_ERROR',
				message: 'Failed to retrieve webhook events',
				details: error.message
			}
		});
	}
}