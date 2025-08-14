/**
 * Verify Razorpay payment and update subscription status
 * Copied exactly from MicroSAASTemplate and adapted for PostgreSQL
 */

const { pool } = require('../../../db/config.js');
const { fetchPaymentDetails } = require('../../../utils/razorpay/razorpay.js');
const { getPlanByCode } = require('../../../data/subscription-plans.js');

/**
 * Verify Razorpay payment and update subscription status
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
async function verifyPayment(req, res) {
	try {
		const userId = /** @type {string | undefined} */ (req.user?.id);
		const { razorpay_payment_id, subscription_id } = req.body;

		if (!userId) {
			res.status(401).json({
				success: false,
				message: 'Please log in to verify payment.',
				code: 'AUTHENTICATION_REQUIRED',
			});
			return;
		}

		if (!razorpay_payment_id) {
			res.status(400).json({
				success: false,
				message: 'Missing required payment verification data.',
				code: 'MISSING_PAYMENT_DATA',
			});
			return;
		}

		const client = await pool.connect();

		// Check if this payment has already been verified (idempotency check)
		const existingResult = await client.query(
			`SELECT 
				st.id,
				st.status,
				st.subscription_id,
				us.status as subscription_status
			FROM subscription_transactions st
			LEFT JOIN user_subscriptions us ON st.subscription_id = us.id
			WHERE st.razorpay_payment_id = $1 AND st.user_id = $2
			ORDER BY st.created_at DESC
			LIMIT 1`,
			[razorpay_payment_id, userId]
		);

		const existingVerification = existingResult.rows[0];

		if (existingVerification) {
			console.log('Payment already verified previously:', razorpay_payment_id, 'Transaction ID:', existingVerification.id);
			
			// If payment was already successfully processed
			if (existingVerification.status === 'captured') {
				// Get plan configuration for response
				let planName = 'Unknown Plan';
				if (existingVerification.subscription_id) {
					const planResult = await client.query(
						`SELECT plan_code FROM user_subscriptions WHERE id = $1`,
						[existingVerification.subscription_id]
					);
					const subscriptionPlan = planResult.rows[0];
					if (subscriptionPlan) {
						const planConfig = getPlanByCode(subscriptionPlan.plan_code);
						planName = planConfig ? planConfig.name : 'Unknown Plan';
					}
				}

				client.release();
				res.json({
					success: true,
					message: `Payment was already verified successfully! Your ${planName} subscription is ${existingVerification.subscription_status || 'active'}.`,
					data: {
						subscriptionId: existingVerification.subscription_id,
						paymentId: razorpay_payment_id,
						planName: planName,
						status: 'verified',
						note: 'Payment verification completed previously',
						isDuplicate: true,
						originalTransactionId: existingVerification.id,
					},
				});
				return;
			}
		}

		// Get payment details from Razorpay
		const paymentDetails = await fetchPaymentDetails(razorpay_payment_id);

		console.log('\n\nPayment Details: ' + JSON.stringify(paymentDetails, null, '\t') + '\n\n');

		if (/** @type {any} */ (paymentDetails).captured !== true) {
			client.release();
			res.status(400).json({
				success: false,
				message: 'Payment not captured successfully.',
				code: 'PAYMENT_NOT_CAPTURED',
			});
			return;
		}

		// Find subscription based on order ID or subscription ID
		let subscription;

		if (subscription_id) {
			const subscriptionResult = await client.query(
				`SELECT us.*
				 FROM user_subscriptions us
				 WHERE us.id = $1 AND us.user_id = $2`,
				[subscription_id, userId]
			);
			subscription = subscriptionResult.rows[0];
		} else {
			// Try to find by recent subscription
			const subscriptionResult = await client.query(
				`SELECT us.*
				 FROM user_subscriptions us
				 WHERE us.user_id = $1 AND us.status = 'created'
				 ORDER BY us.created_at DESC
				 LIMIT 1`,
				[userId]
			);
			subscription = subscriptionResult.rows[0];
		}

		if (!subscription) {
			client.release();
			res.status(404).json({
				success: false,
				message: 'Associated subscription not found.',
				code: 'SUBSCRIPTION_NOT_FOUND',
			});
			return;
		}

		// Get plan configuration for the subscription
		const planConfig = getPlanByCode(subscription.plan_code);
		if (!planConfig) {
			client.release();
			res.status(500).json({
				success: false,
				message: 'Plan configuration error. Please contact support.',
				code: 'PLAN_CONFIG_ERROR',
			});
			return;
		}

		client.release();

		// Note: Subscription activation is now handled by payment.authorized webhook
		// This function now only verifies the payment was captured successfully

		res.json({
			success: true,
			message: `Payment verified successfully! Your ${planConfig.name} subscription will be activated shortly.`,
			data: {
				subscriptionId: subscription.id,
				paymentId: razorpay_payment_id,
				amount: /** @type {any} */ (paymentDetails).amount,
				currency: /** @type {any} */ (paymentDetails).currency,
				planName: planConfig.name,
				status: 'verified',
				note: 'Subscription activation will be completed via webhook notification',
			},
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Payment verification failed:', errorMessage);

		res.status(500).json({
			success: false,
			message: 'Payment verification failed. Please contact support if you were charged.',
			code: 'PAYMENT_VERIFICATION_FAILED',
		});
	} finally {
		console.debug('Payment verification process completed');
	}
}

module.exports = verifyPayment;