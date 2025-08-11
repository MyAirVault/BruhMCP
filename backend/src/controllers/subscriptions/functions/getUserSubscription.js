/**
 * Get user subscription details
 * Retrieves current subscription information for authenticated user
 */

const { pool } = require('../../../db/config.js');
const { getPlanByCode } = require('../../../data/subscription-plans.js');

/**
 * Get user subscription details
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
async function getUserSubscription(req, res) {
	try {
		const userId = req.user?.userId;
		if (!userId) {
			res.status(401).json({
				success: false,
				message: 'User authentication required',
			});
			return;
		}

		// Get user subscription from PostgreSQL user_subscriptions table
		const client = await pool.connect();
		const result = await client.query(
			`SELECT id, user_id, plan_code, razorpay_subscription_id, razorpay_customer_id, 
					status, billing_cycle, current_period_start, current_period_end, 
					trial_start, trial_end, cancel_at_period_end, cancelled_at, 
					total_amount, auto_renewal, failed_payment_count, last_payment_attempt, 
					created_at, updated_at 
			 FROM user_subscriptions WHERE user_id = $1 
			 ORDER BY created_at DESC LIMIT 1`,
			[userId]
		);
		client.release();

		if (result.rows.length === 0) {
			// Return free plan for users without subscription
			const freePlan = getPlanByCode('free');
			if (!freePlan) {
				res.status(500).json({
					success: false,
					message: 'Free plan configuration error. Please contact support.',
				});
				return;
			}
			const freePlanData = freePlan;
			res.json({
				success: true,
				message: 'No active subscription found',
				data: {
					subscription: null,
					currentPlan: {
						plan_code: 'free',
						name: (freePlanData && typeof freePlanData === 'object' && 'name' in freePlanData) ? freePlanData.name : '',
						description: (freePlanData && typeof freePlanData === 'object' && 'description' in freePlanData) ? freePlanData.description : '',
						features: (freePlanData && typeof freePlanData === 'object' && 'features' in freePlanData) ? freePlanData.features : [],
						limits: (freePlanData && typeof freePlanData === 'object' && 'limits' in freePlanData) ? freePlanData.limits : {},
						price_monthly: (freePlanData && typeof freePlanData === 'object' && 'price_monthly' in freePlanData) ? freePlanData.price_monthly : 0,
						trial_days: (freePlanData && typeof freePlanData === 'object' && 'trial_days' in freePlanData) ? freePlanData.trial_days : 0,
					},
				},
			});
			return;
		}

		const subscription = result.rows[0];

		// Get plan configuration for the subscription
		const planConfig = getPlanByCode(subscription.plan_code);
		if (!planConfig) {
			res.status(500).json({
				success: false,
				message: 'Plan configuration error. Please contact support.',
			});
			return;
		}

		// Merge subscription data with plan configuration
		const planConfigData = planConfig;
		const enhancedSubscription = {
			...subscription,
			plan_name: (planConfigData && typeof planConfigData === 'object' && 'name' in planConfigData) ? planConfigData.name : '',
			plan_description: (planConfigData && typeof planConfigData === 'object' && 'description' in planConfigData) ? planConfigData.description : '',
			features: (planConfigData && typeof planConfigData === 'object' && 'features' in planConfigData) ? planConfigData.features : [],
			limits: (planConfigData && typeof planConfigData === 'object' && 'limits' in planConfigData) ? planConfigData.limits : {},
			price_monthly: (planConfigData && typeof planConfigData === 'object' && 'price_monthly' in planConfigData) ? planConfigData.price_monthly : 0,
			price_yearly: (planConfigData && typeof planConfigData === 'object' && 'price_yearly' in planConfigData) ? planConfigData.price_yearly : 0,
			price_currency: (planConfigData && typeof planConfigData === 'object' && 'price_currency' in planConfigData) ? planConfigData.price_currency : 'INR',
			trial_days: (planConfigData && typeof planConfigData === 'object' && 'trial_days' in planConfigData) ? planConfigData.trial_days : 0,
			is_featured: (planConfigData && typeof planConfigData === 'object' && 'is_featured' in planConfigData) ? planConfigData.is_featured : false,
		};

		// Determine subscription status and messaging
		const isActive = ['created', 'active', 'authenticated'].includes(subscription.status);
		const isTrialActive = subscription.trial_end && new Date(subscription.trial_end) > new Date();

		res.json({
			success: true,
			message: 'User subscription retrieved successfully',
			data: {
				subscription: enhancedSubscription,
				isActive: isActive,
				isTrialActive: isTrialActive,
			},
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Failed to get user subscription:', errorMessage);

		res.status(500).json({
			success: false,
			message: 'Failed to get user subscription',
		});
	} finally {
		console.debug('Get user subscription process completed');
	}
}

module.exports = getUserSubscription;