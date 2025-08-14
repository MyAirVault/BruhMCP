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
 * @property {number} [paused_at] - Pause timestamp
 * @property {number} [resume_at] - Resume timestamp
 * @property {number} [charge_at] - Next charge timestamp
 */

/**
 * @typedef {Object} RazorpayPayment
 * @property {string} id - Payment ID
 * @property {string} status - Payment status
 * @property {number} amount - Payment amount
 * @property {string} method - Payment method
 * @property {string} [currency] - Payment currency
 * @property {string} [order_id] - Order ID
 * @property {string} [subscription_id] - Associated subscription ID
 * @property {string} [email] - Customer email
 * @property {string} [contact] - Customer contact
 * @property {string} [description] - Payment description
 * @property {Record<string, unknown>} [notes] - Payment notes
 * @property {RazorpayPayment} [entity] - Payment entity wrapper
 */

/**
 * @typedef {Object} RazorpayOrder
 * @property {string} id - Order ID
 * @property {number} amount - Order amount
 * @property {string} [currency] - Order currency
 * @property {RazorpayOrder} [entity] - Order entity wrapper
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
 * @typedef {Object} ChargedWebhookPayload
 * @property {RazorpaySubscription} subscription - Subscription data
 * @property {RazorpayPayment} payment - Payment data
 */

/**
 * @typedef {Object} OrderWebhookPayload
 * @property {RazorpayOrder} order - Order data
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
 * Handle subscription.charged event
 * @param {ChargedWebhookPayload} payload - Webhook payload
 * @returns {Promise<Object>} Processing result
 * @throws {Error} If processing fails
 */
async function handleSubscriptionCharged(payload) {
	try {
		const { subscription, payment } = payload;

		if (!subscription || !subscription.id || !payment) {
			throw new Error('Invalid subscription or payment data in charged webhook');
		}

		const client = await pool.connect();

		try {
			// Find subscription by Razorpay ID
			const subscriptionResult = await client.query(`
                SELECT id, user_id, status FROM user_subscriptions 
                WHERE razorpay_subscription_id = $1
            `, [subscription.id]);

			if (subscriptionResult.rows.length === 0) {
				console.warn('Subscription not found for charged event:', subscription.id);
				return { success: false, reason: 'Subscription not found' };
			}

			const localSubscription = subscriptionResult.rows[0];

			// Start database transaction for atomic updates
			await client.query('BEGIN');

			// Reset failed payment count on successful charge
			await client.query(`
                UPDATE user_subscriptions 
                SET failed_payment_count = 0,
                    last_payment_attempt = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                WHERE razorpay_subscription_id = $1
            `, [subscription.id]);

			// Record successful transaction
			const transactionResult = await client.query(`
                INSERT INTO subscription_transactions (
                    user_id, subscription_id, razorpay_payment_id, razorpay_order_id,
                    transaction_type, amount, net_amount, currency, status,
                    method, method_details_json, gateway_response_json, processed_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING id
            `, [
				localSubscription.user_id,
				localSubscription.id,
				payment.id,
				payment.order_id || null,
				'subscription',
				payment.amount || 0,
				payment.amount || 0,
				payment.currency || 'INR',
				'captured',
				payment.method || 'unknown',
				JSON.stringify(payment),
				JSON.stringify({ subscription, payment }),
				new Date().toISOString()
			]);

			await client.query('COMMIT');

			const transactionId = transactionResult.rows[0].id;

			console.log('Subscription charged successfully:', subscription.id, 'Transaction:', transactionId);
			return {
				success: true,
				subscriptionId: localSubscription.id,
				razorpayId: subscription.id,
				transactionId,
				amount: payment.amount,
			};

		} catch (error) {
			await client.query('ROLLBACK');
			throw error;
		} finally {
			client.release();
		}

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Handle subscription charged failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Handle subscription charged process completed');
	}
}

/**
 * Handle subscription.updated event
 * @param {SubscriptionWebhookPayload} payload - Webhook payload
 * @returns {Promise<Object>} Processing result
 * @throws {Error} If processing fails
 */
async function handleSubscriptionUpdated(payload) {
	try {
		const { subscription } = payload;

		if (!subscription || !subscription.id) {
			throw new Error('Invalid subscription data in updated webhook');
		}

		const client = await pool.connect();

		try {
			// Find subscription by Razorpay ID
			const subscriptionResult = await client.query(`
                SELECT id, user_id, status FROM user_subscriptions 
                WHERE razorpay_subscription_id = $1
            `, [subscription.id]);

			if (subscriptionResult.rows.length === 0) {
				console.warn('Subscription not found for updated event:', subscription.id);
				return { success: false, reason: 'Subscription not found' };
			}

			const localSubscription = subscriptionResult.rows[0];

			// Update subscription details from Razorpay
			const currentPeriodStart = subscription.current_start
				? new Date(subscription.current_start * 1000).toISOString()
				: null;

			const currentPeriodEnd = subscription.current_end
				? new Date(subscription.current_end * 1000).toISOString()
				: null;

			const nextBillingDate = subscription.charge_at
				? new Date(subscription.charge_at * 1000).toISOString()
				: currentPeriodEnd;

			const updateFields = [];
			const updateValues = [];
			let paramCounter = 1;

			if (currentPeriodStart) {
				updateFields.push(`current_period_start = $${paramCounter++}`);
				updateValues.push(currentPeriodStart);
			}

			if (currentPeriodEnd) {
				updateFields.push(`current_period_end = $${paramCounter++}`);
				updateValues.push(currentPeriodEnd);
			}

			if (nextBillingDate) {
				updateFields.push(`next_billing_date = $${paramCounter++}`);
				updateValues.push(nextBillingDate);
			}

			updateFields.push('updated_at = CURRENT_TIMESTAMP');
			updateValues.push(subscription.id);

			const updateQuery = `
                UPDATE user_subscriptions 
                SET ${updateFields.join(', ')}
                WHERE razorpay_subscription_id = $${paramCounter}
            `;

			const result = await client.query(updateQuery, updateValues);

			console.log('Subscription updated successfully:', subscription.id);
			return {
				success: true,
				subscriptionId: localSubscription.id,
				razorpayId: subscription.id,
				changesApplied: result.rowCount,
			};

		} finally {
			client.release();
		}

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Handle subscription updated failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Handle subscription updated process completed');
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
 * Handle subscription.paused event
 * @param {SubscriptionWebhookPayload} payload - Webhook payload
 * @returns {Promise<Object>} Processing result
 * @throws {Error} If processing fails
 */
async function handleSubscriptionPaused(payload) {
	try {
		const { subscription } = payload;

		if (!subscription || !subscription.id) {
			throw new Error('Invalid subscription data in paused webhook');
		}

		const client = await pool.connect();

		try {
			// Find subscription by Razorpay ID
			const subscriptionResult = await client.query(`
                SELECT id, user_id, status, pause_count FROM user_subscriptions 
                WHERE razorpay_subscription_id = $1
            `, [subscription.id]);

			if (subscriptionResult.rows.length === 0) {
				console.warn('Subscription not found for paused event:', subscription.id);
				return { success: false, reason: 'Subscription not found' };
			}

			const localSubscription = subscriptionResult.rows[0];

			// Update subscription to paused status
			const pausedAt = subscription.paused_at
				? new Date(subscription.paused_at * 1000).toISOString()
				: new Date().toISOString();

			const resumeAt = subscription.resume_at ? new Date(subscription.resume_at * 1000).toISOString() : null;

			const result = await client.query(`
                UPDATE user_subscriptions 
                SET status = 'paused',
                    pause_count = pause_count + 1,
                    paused_at = $1,
                    resume_at = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE razorpay_subscription_id = $3
            `, [pausedAt, resumeAt, subscription.id]);

			console.log('Subscription paused successfully:', subscription.id);
			return {
				success: true,
				subscriptionId: localSubscription.id,
				razorpayId: subscription.id,
				pausedAt,
				resumeAt,
				changesApplied: result.rowCount,
			};

		} finally {
			client.release();
		}

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Handle subscription paused failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Handle subscription paused process completed');
	}
}

/**
 * Handle subscription.resumed event
 * @param {SubscriptionWebhookPayload} payload - Webhook payload
 * @returns {Promise<Object>} Processing result
 * @throws {Error} If processing fails
 */
async function handleSubscriptionResumed(payload) {
	try {
		const { subscription } = payload;

		if (!subscription || !subscription.id) {
			throw new Error('Invalid subscription data in resumed webhook');
		}

		const client = await pool.connect();

		try {
			// Find subscription by Razorpay ID
			const subscriptionResult = await client.query(`
                SELECT id, user_id, status FROM user_subscriptions 
                WHERE razorpay_subscription_id = $1
            `, [subscription.id]);

			if (subscriptionResult.rows.length === 0) {
				console.warn('Subscription not found for resumed event:', subscription.id);
				return { success: false, reason: 'Subscription not found' };
			}

			const localSubscription = subscriptionResult.rows[0];

			// Update subscription to active status
			const result = await client.query(`
                UPDATE user_subscriptions 
                SET status = 'active',
                    paused_at = NULL,
                    resume_at = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE razorpay_subscription_id = $1
            `, [subscription.id]);

			console.log('Subscription resumed successfully:', subscription.id);
			return {
				success: true,
				subscriptionId: localSubscription.id,
				razorpayId: subscription.id,
				changesApplied: result.rowCount,
			};

		} finally {
			client.release();
		}

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Handle subscription resumed failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Handle subscription resumed process completed');
	}
}

/**
 * Handle payment.authorized event
 * @param {PaymentWebhookPayload} payload - Webhook payload
 * @returns {Promise<Object>} Processing result
 * @throws {Error} If processing fails
 */
async function handlePaymentAuthorized(payload) {
	try {
		// Extract payment data - it's nested under payload.payment.entity
		const payment = /** @type {RazorpayPayment} */ (payload.payment.entity || payload.payment);

		if (!payment || !payment.id) {
			console.error('Payment data structure:', JSON.stringify(payload, null, 2));
			throw new Error('Invalid payment data in authorized webhook');
		}

		const client = await pool.connect();

		try {
			console.log('Payment details for subscription lookup:', {
				paymentId: payment.id,
				email: payment.email,
				contact: payment.contact,
				amount: payment.amount,
				description: payment.description,
				notes: payment.notes,
				order_id: payment.order_id
			});

			// Find subscription by payment notes or order details
			let localSubscription = null;

			// Try to find subscription through various methods
			if (payment.notes && payment.notes.subscription_id) {
				console.log('Attempting to find subscription by notes.subscription_id:', payment.notes.subscription_id);
				const subscriptionResult = await client.query(`
                    SELECT id, user_id, status, plan_code, total_amount, razorpay_subscription_id 
                    FROM user_subscriptions 
                    WHERE razorpay_subscription_id = $1
                `, [payment.notes.subscription_id]);
				
				localSubscription = subscriptionResult.rows[0] || null;
			}

			if (!localSubscription && payment.notes && payment.notes.user_id) {
				console.log('Attempting to find subscription by notes.user_id:', payment.notes.user_id);
				// Try to find by user ID and created status
				const subscriptionResult = await client.query(`
                    SELECT id, user_id, status, plan_code, total_amount, razorpay_subscription_id 
                    FROM user_subscriptions 
                    WHERE user_id = $1 AND status = 'created'
                    ORDER BY created_at DESC
                    LIMIT 1
                `, [payment.notes.user_id]);
				
				localSubscription = subscriptionResult.rows[0] || null;
			}

			if (!localSubscription) {
				// Check if this is an upgrade payment (doesn't need subscription activation)
				const isUpgradePayment = payment.description && 
					(payment.description.includes('Updating Subscription') || 
					 payment.description.includes('Upgrade') ||
					 payment.description.includes('upgrade'));
				
				if (isUpgradePayment) {
					console.log('Payment authorized for upgrade - no subscription activation needed:', payment.id);
					return {
						success: true,
						action: 'upgrade_payment_authorized',
						paymentId: payment.id,
						amount: payment.amount
					};
				}

				console.warn('Subscription not found for payment authorization:', payment.id);
				return { success: false, reason: 'Subscription not found' };
			}

			// Create transaction record for authorized payment
			await client.query(`
                INSERT INTO subscription_transactions (
                    user_id, subscription_id, razorpay_payment_id, razorpay_order_id,
                    transaction_type, amount, net_amount, currency, status,
                    method, method_details_json, gateway_response_json, processed_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            `, [
				localSubscription.user_id,
				localSubscription.id,
				payment.id,
				payment.order_id || null,
				'subscription',
				payment.amount || 0,
				payment.amount || 0,
				payment.currency || 'INR',
				'authorized',
				payment.method || 'unknown',
				JSON.stringify(payment),
				JSON.stringify(payload),
				new Date().toISOString()
			]);

			console.log('Payment authorized successfully:', payment.id);
			return {
				success: true,
				subscriptionId: localSubscription.id,
				paymentId: payment.id,
				amount: payment.amount,
				action: 'payment_authorized'
			};

		} finally {
			client.release();
		}

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Handle payment authorized failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Handle payment authorized process completed');
	}
}

/**
 * Handle payment.captured event
 * @param {PaymentWebhookPayload} payload - Webhook payload
 * @returns {Promise<Object>} Processing result
 * @throws {Error} If processing fails
 */
async function handlePaymentCaptured(payload) {
	try {
		const payment = /** @type {RazorpayPayment} */ (payload.payment.entity || payload.payment);

		if (!payment || !payment.id) {
			throw new Error('Invalid payment data in captured webhook');
		}

		const client = await pool.connect();

		try {
			// Update transaction status to captured
			const result = await client.query(`
                UPDATE subscription_transactions 
                SET status = 'captured',
                    gateway_response_json = $1,
                    processed_at = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE razorpay_payment_id = $3
            `, [JSON.stringify(payload), new Date().toISOString(), payment.id]);

			console.log('Payment captured successfully:', payment.id);
			return {
				success: true,
				paymentId: payment.id,
				amount: payment.amount,
				changesApplied: result.rowCount,
				action: 'payment_captured'
			};

		} finally {
			client.release();
		}

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Handle payment captured failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Handle payment captured process completed');
	}
}

/**
 * Handle order.paid event
 * @param {OrderWebhookPayload} payload - Webhook payload
 * @returns {Promise<Object>} Processing result
 * @throws {Error} If processing fails
 */
async function handleOrderPaid(payload) {
	try {
		const order = /** @type {RazorpayOrder} */ (payload.order.entity || payload.order);

		if (!order || !order.id) {
			throw new Error('Invalid order data in paid webhook');
		}

		console.log('Order paid successfully:', order.id, 'Amount:', order.amount);
		return {
			success: true,
			orderId: order.id,
			amount: order.amount,
			action: 'order_paid'
		};

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Handle order paid failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Handle order paid process completed');
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

			case 'subscription.charged':
				result = await handleSubscriptionCharged({ event, ...payload });
				break;

			case 'subscription.updated':
				result = await handleSubscriptionUpdated({ event, ...payload });
				break;

			case 'subscription.cancelled':
				result = await handleSubscriptionCancelled({ event, ...payload });
				break;

			case 'subscription.paused':
				result = await handleSubscriptionPaused({ event, ...payload });
				break;

			case 'subscription.resumed':
				result = await handleSubscriptionResumed({ event, ...payload });
				break;

			case 'payment.authorized':
				result = await handlePaymentAuthorized({ event, ...payload });
				break;

			case 'payment.captured':
				result = await handlePaymentCaptured({ event, ...payload });
				break;

			case 'payment.failed':
				result = await handlePaymentFailed({ event, ...payload });
				break;

			case 'order.paid':
				result = await handleOrderPaid({ event, ...payload });
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
	handleSubscriptionCharged,
	handleSubscriptionUpdated,
	handleSubscriptionCancelled,
	handleSubscriptionPaused,
	handleSubscriptionResumed,
	handlePaymentAuthorized,
	handlePaymentCaptured,
	handlePaymentFailed,
	handleOrderPaid
};