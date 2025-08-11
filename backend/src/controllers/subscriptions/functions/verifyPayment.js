/**
 * Verify Razorpay payment and activate subscription
 * Handles payment verification and subscription activation with transaction recording
 */

const { pool } = require('../../../db/config.js');
const { fetchPaymentDetails } = require('../../../utils/razorpay/razorpay.js');
const { getPlanByCode } = require('../../../data/subscription-plans.js');

/**
 * Verify Razorpay payment and activate subscription
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
async function verifyPayment(req, res) {
	try {
		const userId = req.user?.userId;
		if (!userId) {
			res.status(401).json({
				success: false,
				message: 'User authentication required',
			});
			return;
		}
		const { razorpay_payment_id, subscription_id } = req.body;

		if (!razorpay_payment_id) {
			res.status(400).json({
				success: false,
				message: 'Razorpay payment ID is required',
				code: 'PAYMENT_ID_REQUIRED',
			});
			return;
		}

		// Get payment details from Razorpay
		const paymentDetails = await fetchPaymentDetails(razorpay_payment_id);

		if (!paymentDetails || !(paymentDetails && typeof paymentDetails === 'object' && 'status' in paymentDetails && paymentDetails.status === 'captured')) {
			res.status(400).json({
				success: false,
				message: 'Payment verification failed or payment not captured',
				code: 'PAYMENT_NOT_CAPTURED',
			});
			return;
		}

		// Get subscription from database
		const client = await pool.connect();
		let subscription = null;
		
		if (subscription_id) {
			const result = await client.query(
				`SELECT * FROM user_subscriptions WHERE id = $1 AND user_id = $2`,
				[subscription_id, userId]
			);
			subscription = result.rows[0] || null;
		} else {
			// Find latest subscription for user
			const result = await client.query(
				`SELECT * FROM user_subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
				[userId]
			);
			subscription = result.rows[0] || null;
		}

		if (!subscription) {
			client.release();
			res.status(404).json({
				success: false,
				message: 'Subscription not found',
				code: 'SUBSCRIPTION_NOT_FOUND',
			});
			return;
		}

		// Update subscription status to active
		await client.query(
			`UPDATE user_subscriptions 
			 SET status = 'active', updated_at = CURRENT_TIMESTAMP
			 WHERE id = $1`,
			[subscription.id]
		);

		// Record transaction
		await client.query(
			`INSERT INTO subscription_transactions (
				user_id, subscription_id, razorpay_payment_id, 
				transaction_type, amount, net_amount, status, method,
				method_details_json, gateway_response_json, processed_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)`,
			[
				userId,
				subscription.id,
				razorpay_payment_id,
				'subscription',
				(paymentDetails && typeof paymentDetails === 'object' && 'amount' in paymentDetails ? paymentDetails.amount : subscription.total_amount),
				(paymentDetails && typeof paymentDetails === 'object' && 'amount' in paymentDetails ? paymentDetails.amount : subscription.total_amount),
				'captured',
				(paymentDetails && typeof paymentDetails === 'object' && 'method' in paymentDetails ? paymentDetails.method : 'unknown'),
				JSON.stringify(paymentDetails),
				JSON.stringify(paymentDetails)
			]
		);

		client.release();

		const planConfig = getPlanByCode(subscription.plan_code);
		const planConfigData = planConfig;

		res.json({
			success: true,
			message: 'Payment verified and subscription activated successfully',
			data: {
				subscriptionId: subscription.id,
				paymentId: razorpay_payment_id,
				paymentStatus: (paymentDetails && typeof paymentDetails === 'object' && 'status' in paymentDetails ? paymentDetails.status : 'unknown'),
				subscriptionStatus: 'active',
				planCode: subscription.plan_code,
				planName: (planConfigData && typeof planConfigData === 'object' && 'name' in planConfigData) ? planConfigData.name : '',
				amount: (paymentDetails && typeof paymentDetails === 'object' && 'amount' in paymentDetails ? paymentDetails.amount : subscription.total_amount),
				currency: (paymentDetails && typeof paymentDetails === 'object' && 'currency' in paymentDetails ? paymentDetails.currency : 'INR'),
			},
		});
		
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Failed to verify payment:', errorMessage);

		res.status(500).json({
			success: false,
			message: 'Failed to verify payment',
		});
	} finally {
		console.debug('Verify payment process completed');
	}
}

module.exports = verifyPayment;