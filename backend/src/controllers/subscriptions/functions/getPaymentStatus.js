/**
 * Get payment status for subscription polling
 * Retrieves current payment and subscription status for frontend polling
 */

const { pool } = require('../../../db/config.js');
const { getPlanByCode } = require('../../../data/subscription-plans.js');

/**
 * Get payment status for subscription polling
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
async function getPaymentStatus(req, res) {
	try {
		const userId = req.user?.userId;
		if (!userId) {
			res.status(401).json({
				success: false,
				message: 'User authentication required',
			});
			return;
		}
		const subscriptionId = req.params.subscriptionId;

		// Get subscription from PostgreSQL
		const client = await pool.connect();
		const result = await client.query(
			`SELECT * FROM user_subscriptions WHERE id = $1 AND user_id = $2`,
			[subscriptionId, userId]
		);

		if (result.rows.length === 0) {
			client.release();
			res.status(404).json({
				success: false,
				message: 'Subscription not found',
				code: 'SUBSCRIPTION_NOT_FOUND',
			});
			return;
		}

		const subscription = result.rows[0];

		// Get latest transaction for this subscription
		const transactionResult = await client.query(
			`SELECT * FROM subscription_transactions 
			 WHERE subscription_id = $1 AND user_id = $2
			 ORDER BY created_at DESC LIMIT 1`,
			[subscriptionId, userId]
		);

		client.release();

		const latestTransaction = transactionResult.rows[0] || null;
		const planConfig = getPlanByCode(subscription.plan_code);
		const planConfigData = planConfig;

		res.json({
			success: true,
			message: 'Payment status retrieved successfully',
			data: {
				subscriptionId: subscription.id,
				subscriptionStatus: subscription.status,
				planCode: subscription.plan_code,
				planName: (planConfigData && typeof planConfigData === 'object' && 'name' in planConfigData) ? planConfigData.name : '',
				billingCycle: subscription.billing_cycle,
				totalAmount: subscription.total_amount,
				currency: 'INR',
				razorpaySubscriptionId: subscription.razorpay_subscription_id,
				currentPeriodStart: subscription.current_period_start,
				currentPeriodEnd: subscription.current_period_end,
				autoRenewal: subscription.auto_renewal,
				latestTransaction: latestTransaction ? {
					id: latestTransaction.id,
					status: latestTransaction.status,
					amount: latestTransaction.amount,
					method: latestTransaction.method,
					createdAt: latestTransaction.created_at,
				} : null,
			},
		});
		
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Failed to get payment status:', errorMessage);

		res.status(500).json({
			success: false,
			message: 'Failed to get payment status',
		});
	} finally {
		console.debug('Get payment status process completed');
	}
}

module.exports = getPaymentStatus;