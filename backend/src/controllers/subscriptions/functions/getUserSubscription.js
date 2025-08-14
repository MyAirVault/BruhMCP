/**
 * Get user subscription details
 * Retrieves current subscription information for authenticated user
 */

const { pool } = require('../../../db/config.js');
const { getPlanByCode } = require('../../../data/subscription-plans.js');

/**
 * Get user's current subscription details
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
async function getUserSubscription(req, res) {
	try {
		const userId = /** @type {string | undefined} */ (req.user?.id);

		if (!userId) {
			res.status(401).json({
				success: false,
				message: 'Please log in to view your subscription details.',
				code: 'AUTHENTICATION_REQUIRED',
			});
			return;
		}

		const client = await pool.connect();

		// Get user's current subscription
		// Include created, active, authenticated subscriptions and cancelled subscriptions that are still in their paid period
		const getSubscriptionQuery = `
            SELECT 
                us.*
            FROM user_subscriptions us
            WHERE us.user_id = $1 AND (
                us.status IN ('created', 'active', 'authenticated') OR 
                (us.status = 'cancelled' AND us.cancel_at_period_end = true AND us.current_period_end > CURRENT_TIMESTAMP)
            )
            ORDER BY us.created_at DESC
            LIMIT 1
        `;

		const subscriptionResult = await client.query(getSubscriptionQuery, [userId]);
		const subscription = subscriptionResult.rows[0];

		// Check if user has any subscription (including cancelled ones) for credits calculation
		const getLatestSubscriptionQuery = `
            SELECT 
                us.*
            FROM user_subscriptions us
            WHERE us.user_id = $1
            ORDER BY us.created_at DESC
            LIMIT 1
        `;

		const latestSubscriptionResult = await client.query(getLatestSubscriptionQuery, [userId]);
		const latestSubscription = latestSubscriptionResult.rows[0];

		if (!subscription) {
			// No subscription found - user is on free plan by default
			const freePlan = getPlanByCode('free');
			if (!freePlan) {
				res.status(500).json({
					success: false,
					message: 'Free plan configuration error. Please contact support.',
					code: 'FREE_PLAN_CONFIG_ERROR',
				});
				client.release();
				return;
			}

			res.json({
				success: true,
				message: 'No active subscription found',
				data: {
					subscription: null,
					currentPlan: {
						plan_code: 'free',
						name: freePlan.name,
						description: freePlan.description,
						features: freePlan.features,
						limits: freePlan.limits,
						price_monthly: freePlan.price_monthly,
						trial_days: freePlan.trial_days,
					},
				},
			});
			client.release();
			return;
		}

		// Get plan configuration for the subscription
		const planConfig = getPlanByCode(subscription.plan_code);
		if (!planConfig) {
			res.status(500).json({
				success: false,
				message: 'Plan configuration error. Please contact support.',
				code: 'PLAN_CONFIG_ERROR',
			});
			client.release();
			return;
		}

		// Merge subscription data with plan configuration
		const parsedSubscription = {
			...subscription,
			plan_name: planConfig.name,
			plan_description: planConfig.description,
			features: planConfig.features,
			limits: planConfig.limits,
			price_monthly: planConfig.price_monthly,
			price_yearly: planConfig.price_yearly,
			price_currency: planConfig.price_currency,
			trial_days: planConfig.trial_days,
			is_featured: planConfig.is_featured,
		};

		// Get account credits if any
		const getCreditsQuery = `
            SELECT SUM(remaining_amount) as total_credits
            FROM account_credits 
            WHERE user_id = $1 AND is_active = true AND remaining_amount > 0
            AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        `;

		const creditsResult = await client.query(getCreditsQuery, [userId]);
		const totalCredits = creditsResult.rows[0]?.total_credits || 0;

		client.release();

		// Determine subscription status and messaging
		const isActive = ['created', 'active', 'authenticated'].includes(parsedSubscription.status);
		const isCancelled = parsedSubscription.status === 'cancelled';
		const isTrialActive = parsedSubscription.trial_end && new Date(parsedSubscription.trial_end) > new Date();

		let message = 'Current subscription retrieved successfully';
		if (parsedSubscription.status === 'created') {
			message = 'Subscription is active and ready to use';
		}
		/** @type {Object} */
		let responseData = {
			subscription: parsedSubscription,
			accountCredits: totalCredits,
			isActive: isActive,
			isTrialActive: isTrialActive,
		};

		// Handle cancelled subscription
		if (isCancelled) {
			if (parsedSubscription.cancel_at_period_end) {
				// End-of-period cancellation - still has access until period end
				const periodEnd = new Date(parsedSubscription.current_period_end);
				message = `Subscription cancelled but active until ${periodEnd.toLocaleDateString()}. No further charges will be made.`;
				responseData = {
					...responseData,
					isActive: true, // Still has access until period end
					isCancelledButActive: true,
					accessEndsAt: periodEnd.toISOString(),
					willRenew: false,
				};
			} else {
				// Immediate cancellation - access ended immediately
				const cancelledAt = new Date(parsedSubscription.cancelled_at);
				message = 'Subscription has been cancelled and access has ended immediately';
				responseData = {
					...responseData,
					isActive: false,
					isCancelledButActive: false,
					accessEndsAt: cancelledAt.toISOString(),
					willRenew: false,
				};
			}
		}

		res.json({
			success: true,
			message,
			data: responseData,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Get user subscription failed:', errorMessage);

		res.status(500).json({
			success: false,
			message: 'Failed to retrieve subscription details. Please try again later.',
			code: 'SUBSCRIPTION_FETCH_ERROR',
		});
	} finally {
		console.debug('Get user subscription process completed');
	}
}

module.exports = getUserSubscription;