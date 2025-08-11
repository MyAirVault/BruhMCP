/**
 * Cancel user subscription
 * Handles subscription cancellation for both immediate and end-of-period cancellations
 */

const { pool } = require('../../../db/config.js');
const { cancelRazorpaySubscription } = require('../../../utils/razorpay/razorpay.js');

/**
 * Cancel user subscription
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
async function cancelSubscription(req, res) {
	try {
		const userId = req.user?.userId;
		if (!userId) {
			res.status(401).json({
				success: false,
				message: 'User authentication required',
			});
			return;
		}
		const { cancelImmediately = false } = req.body;

		// Get current subscription from PostgreSQL user_subscriptions table
		const client = await pool.connect();
		const result = await client.query(
			`SELECT id, plan_code, razorpay_subscription_id, status, billing_cycle,
					current_period_end, cancel_at_period_end, cancelled_at
			 FROM user_subscriptions WHERE user_id = $1 
			 ORDER BY created_at DESC LIMIT 1`,
			[userId]
		);

		if (result.rows.length === 0) {
			client.release();
			res.status(404).json({
				success: false,
				message: 'No subscription found',
			});
			return;
		}

		const subscription = result.rows[0];

		// Check if subscription is already cancelled
		if (subscription.status === 'cancelled') {
			client.release();
			res.status(400).json({
				success: false,
				message: 'Subscription is already cancelled',
			});
			return;
		}

		// Handle free plan (no Razorpay cancellation needed)
		if (subscription.plan_code === 'free' || !subscription.razorpay_subscription_id) {
			// Just mark as cancelled in database
			await client.query(
				`UPDATE user_subscriptions 
				 SET status = $1, cancel_at_period_end = $2, cancelled_at = $3, updated_at = CURRENT_TIMESTAMP
				 WHERE id = $4`,
				['cancelled', cancelImmediately, new Date(), subscription.id]
			);
			
			client.release();
			res.json({
				success: true,
				message: 'Free subscription cancelled successfully',
				data: {
					cancelled_immediately: true,
					new_plan: 'free',
				},
			});
			return;
		}

		// Cancel Razorpay subscription for paid plans
		await cancelRazorpaySubscription(subscription.razorpay_subscription_id, { cancel_at_cycle_end: !cancelImmediately });

		// Update subscription in database
		const now = new Date();
		if (cancelImmediately) {
			// Immediate cancellation
			await client.query(
				`UPDATE user_subscriptions 
				 SET status = $1, cancel_at_period_end = $2, cancelled_at = $3, updated_at = $4
				 WHERE id = $5`,
				['cancelled', false, now, now, subscription.id]
			);
		} else {
			// Cancel at period end
			await client.query(
				`UPDATE user_subscriptions 
				 SET cancel_at_period_end = $1, cancelled_at = $2, updated_at = $3
				 WHERE id = $4`,
				[true, now, now, subscription.id]
			);
		}

		client.release();

		res.json({
			success: true,
			message: cancelImmediately
				? 'Subscription cancelled immediately'
				: 'Subscription will be cancelled at the end of current period',
			data: {
				cancelled_immediately: cancelImmediately,
				current_period_end: cancelImmediately ? null : subscription.current_period_end,
				cancel_at_period_end: cancelImmediately ? false : true,
			},
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Failed to cancel subscription:', errorMessage);

		res.status(500).json({
			success: false,
			message: 'Failed to cancel subscription',
		});
	} finally {
		console.debug('Cancel subscription process completed');
	}
}

module.exports = cancelSubscription;