/**
 * Upgrade user subscription to new plan
 * Handles subscription upgrades between free and paid plans with Razorpay integration
 */

const { pool } = require('../../../db/config.js');
const { getPlanByCode, getRazorpayPlanId } = require('../../../data/subscription-plans.js');
const { cancelRazorpaySubscription, createRazorpaySubscription } = require('../../../utils/razorpay/razorpay.js');

/**
 * Upgrade user subscription to new plan
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
async function upgradeSubscription(req, res) {
	try {
		const userId = req.user?.userId;
		if (!userId) {
			res.status(401).json({
				success: false,
				message: 'User authentication required',
			});
			return;
		}
		const { newPlanCode } = req.body;

		if (!newPlanCode || !['free', 'pro'].includes(newPlanCode)) {
			res.status(400).json({
				success: false,
				message: 'Please select a valid plan to upgrade to (free or pro).',
				code: 'INVALID_NEW_PLAN_CODE',
			});
			return;
		}

		// Get current subscription from PostgreSQL
		const client = await pool.connect();
		const currentSubResult = await client.query(
			`SELECT * FROM user_subscriptions 
			 WHERE user_id = $1 AND status IN ('created', 'active', 'authenticated')
			 ORDER BY created_at DESC LIMIT 1`,
			[userId]
		);

		if (currentSubResult.rows.length === 0) {
			client.release();
			res.status(404).json({
				success: false,
				message: 'No active subscription found. Please create a subscription first.',
				code: 'NO_ACTIVE_SUBSCRIPTION',
			});
			return;
		}

		const currentSubscription = currentSubResult.rows[0];

		// Check if already on requested plan
		if (currentSubscription.plan_code === newPlanCode) {
			client.release();
			res.status(400).json({
				success: false,
				message: 'You are already on this plan.',
				code: 'SAME_PLAN_SELECTED',
			});
			return;
		}

		// Get plan configurations
		const currentPlanConfig = getPlanByCode(currentSubscription.plan_code);
		const newPlanConfig = getPlanByCode(newPlanCode);

		if (!currentPlanConfig || !newPlanConfig) {
			client.release();
			res.status(500).json({
				success: false,
				message: 'Plan configuration error. Please contact support.',
				code: 'PLAN_CONFIG_ERROR',
			});
			return;
		}

		// For free plan upgrade, just update subscription
		if (newPlanCode === 'free') {
			await client.query(
				`UPDATE user_subscriptions 
				 SET plan_code = $1, updated_at = CURRENT_TIMESTAMP
				 WHERE id = $2`,
				[newPlanCode, currentSubscription.id]
			);
			
			client.release();
			const newPlanData = newPlanConfig;
			const currentPlanData = currentPlanConfig;
			
			res.json({
				success: true,
				message: `Successfully downgraded to ${(newPlanData && typeof newPlanData === 'object' && 'name' in newPlanData ? newPlanData.name : '')}`,
				data: {
					subscriptionId: currentSubscription.id,
					currentPlan: (currentPlanData && typeof currentPlanData === 'object' && 'name' in currentPlanData ? currentPlanData.name : ''),
					newPlan: (newPlanData && typeof newPlanData === 'object' && 'name' in newPlanData ? newPlanData.name : ''),
					requiresPayment: false,
				},
			});
			return;
		}

		// For paid plan upgrade, need Razorpay subscription
		const newPlanConfigData = newPlanConfig;
		const newPlanPrice = currentSubscription.billing_cycle === 'yearly' 
			? (newPlanConfigData && typeof newPlanConfigData === 'object' && 'price_yearly' in newPlanConfigData ? newPlanConfigData.price_yearly : 0)
			: (newPlanConfigData && typeof newPlanConfigData === 'object' && 'price_monthly' in newPlanConfigData ? newPlanConfigData.price_monthly : 0);
		
		const razorpayPlanId = getRazorpayPlanId(newPlanCode, currentSubscription.billing_cycle);
		if (!razorpayPlanId) {
			client.release();
			res.status(500).json({
				success: false,
				message: `Plan not configured for ${currentSubscription.billing_cycle} billing.`,
				code: 'PLAN_NOT_CONFIGURED',
			});
			return;
		}

		// Cancel current Razorpay subscription if exists
		if (currentSubscription.razorpay_subscription_id) {
			await cancelRazorpaySubscription(currentSubscription.razorpay_subscription_id, { cancel_at_cycle_end: false });
		}

		// Create new Razorpay subscription
		const newRazorpaySubscription = await createRazorpaySubscription({
			plan_id: razorpayPlanId,
			customer_id: currentSubscription.razorpay_customer_id,
			total_count: currentSubscription.billing_cycle === 'yearly' ? 10 : 120,
			notes: {
				user_id: userId,
				old_plan_code: currentSubscription.plan_code,
				new_plan_code: newPlanCode,
				upgrade: 'true',
			},
		});

		const subscriptionData = newRazorpaySubscription;

		// Update subscription in database
		await client.query(
			`UPDATE user_subscriptions 
			 SET plan_code = $1, razorpay_subscription_id = $2, status = $3, 
			     total_amount = $4, updated_at = CURRENT_TIMESTAMP
			 WHERE id = $5`,
			[newPlanCode, (subscriptionData && typeof subscriptionData === 'object' && 'id' in subscriptionData ? subscriptionData.id : null), 'created', newPlanPrice, currentSubscription.id]
		);

		client.release();

		const currentPlanData = currentPlanConfig;
		
		res.json({
			success: true,
			message: `Successfully upgraded from ${(currentPlanData && typeof currentPlanData === 'object' && 'name' in currentPlanData ? currentPlanData.name : '')} to ${(newPlanConfigData && typeof newPlanConfigData === 'object' && 'name' in newPlanConfigData ? newPlanConfigData.name : '')}`,
			data: {
				subscriptionId: currentSubscription.id,
				razorpaySubscriptionId: (subscriptionData && typeof subscriptionData === 'object' && 'id' in subscriptionData ? subscriptionData.id : null),
				currentPlan: (currentPlanData && typeof currentPlanData === 'object' && 'name' in currentPlanData ? currentPlanData.name : ''),
				newPlan: (newPlanConfigData && typeof newPlanConfigData === 'object' && 'name' in newPlanConfigData ? newPlanConfigData.name : ''),
				newPlanPrice,
				currency: 'INR',
				billingCycle: currentSubscription.billing_cycle,
				requiresPayment: true,
			},
		});
		
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Failed to upgrade subscription:', errorMessage);

		res.status(500).json({
			success: false,
			message: 'Failed to upgrade subscription',
		});
	} finally {
		console.debug('Upgrade subscription process completed');
	}
}

module.exports = upgradeSubscription;