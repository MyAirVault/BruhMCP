/**
 * Subscription-based instance limits utility
 * Replaces planLimits.js to work with MicroSAASTemplate's user_subscriptions table
 * @fileoverview Contains functions to check and validate user subscription limits for active instances
 */

const { pool } = require('../../db/config.js');
const { getPlanByCode } = require('../../data/subscription-plans.js');
const { getUserInstanceCount } = require('../../db/queries/mcpInstances/index.js');

/**
 * Check if payments are disabled in local development
 * @returns {boolean} True if payments are disabled
 */
function isPaymentsDisabled() {
	return process.env.DISABLE_PAYMENTS === 'true' && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local');
}

/**
 * Get user's current subscription from user_subscriptions table
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User subscription object or null if not found
 */
async function getUserSubscription(userId) {
	try {
		const client = await pool.connect();
		const result = await client.query(
			`SELECT id, user_id, plan_code, status, billing_cycle, current_period_start, 
					current_period_end, trial_start, trial_end, cancel_at_period_end, 
					cancelled_at, total_amount, auto_renewal, created_at, updated_at 
			 FROM user_subscriptions WHERE user_id = $1 
			 ORDER BY created_at DESC LIMIT 1`,
			[userId]
		);
		client.release();

		return result.rows[0] || null;
	} catch (error) {
		console.error('Error getting user subscription:', error);
		throw error;
	}
}

/**
 * Check if user's subscription is active
 * @param {Object} subscription - Subscription object from database
 * @returns {boolean} True if subscription is active
 */
function isSubscriptionActive(subscription) {
	if (!subscription) return false;

	/** @type {any} */
	const subscriptionData = subscription;

	// Check if subscription status is active
	const activeStatuses = ['created', 'active', 'authenticated'];
	if (!activeStatuses.includes(subscriptionData.status)) return false;

	// Check if current period hasn't ended
	const now = new Date();
	const periodEnd = new Date(subscriptionData.current_period_end);
	if (periodEnd < now && subscriptionData.status !== 'active') return false;

	// Check if it's not cancelled immediately
	if (subscriptionData.cancelled_at && !subscriptionData.cancel_at_period_end) return false;

	return true;
}

/**
 * Get instance limit for a plan type
 * @param {string} planCode - Plan code ('free' or 'pro')
 * @returns {number|null} Max instances (null = unlimited)
 */
function getInstanceLimitForPlan(planCode) {
	// In local environment with payments disabled, give unlimited instances
	if (isPaymentsDisabled()) {
		return null; // unlimited
	}
	
	const plan = getPlanByCode(planCode);
	/** @type {any} */
	const planData = plan;
	if (!planData) return 1; // default to free plan limit

	return planData.limits?.instances === -1 ? null : planData.limits?.instances || 1;
}

/**
 * Check if a plan has unlimited instances
 * @param {string} planCode - Plan code ('free' or 'pro')
 * @returns {boolean} True if plan has unlimited instances
 */
function isPlanUnlimited(planCode) {
	// In local environment with payments disabled, treat all plans as unlimited
	if (isPaymentsDisabled()) {
		return true;
	}
	
	const plan = getPlanByCode(planCode);
	/** @type {any} */
	const planData = plan;
	return planData ? planData.limits?.instances === -1 : false;
}

/**
 * Create default free subscription for new users
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Created subscription object
 */
async function createFreeSubscription(userId) {
	try {
		const client = await pool.connect();
		
		// Check if user already has a subscription
		const existingResult = await client.query(
			'SELECT id FROM user_subscriptions WHERE user_id = $1',
			[userId]
		);
		
		if (existingResult.rows.length > 0) {
			client.release();
			const subscription = await getUserSubscription(userId);
			return subscription || {};
		}

		// Create free subscription
		const result = await client.query(
			`INSERT INTO user_subscriptions (
				user_id, plan_code, status, billing_cycle, 
				current_period_start, current_period_end, total_amount
			) VALUES ($1, $2, $3, $4, $5, $6, $7) 
			RETURNING *`,
			[
				userId,
				'free',
				'active',
				'monthly',
				new Date(),
				new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
				0
			]
		);
		client.release();

		console.log(`Created default free subscription for user ${userId}`);
		return result.rows[0];
	} catch (error) {
		console.error('Error creating free subscription:', error);
		throw error;
	}
}

/**
 * Check if user can create a new MCP instance (based on active instances)
 * @param {string} userId - User ID
 * @returns {Promise<{canCreate: boolean, message: string, maxInstances?: number|null, activeInstances?: number, reason?: string, details?: any}>} Result object with canCreate flag and details
 */
async function checkInstanceLimit(userId) {
	try {
		// Get user's subscription
		let subscription = await getUserSubscription(userId);
		
		// Create default free subscription if user doesn't have one
		if (!subscription) {
			console.log(`Creating default free subscription for user ${userId} during instance limit check`);
			subscription = await createFreeSubscription(userId);
		}

		// Check if subscription is active
		const isActive = isSubscriptionActive(subscription);
		
		/** @type {any} */
		const subscriptionData = subscription;
		
		if (!isActive) {
			return {
				canCreate: false,
				reason: 'SUBSCRIPTION_INACTIVE',
				message: 'Your subscription is not active. Please renew or upgrade to continue.',
				details: {
					userId,
					plan: subscriptionData.plan_code,
					status: subscriptionData.status,
					activeInstances: 0,
					maxInstances: getInstanceLimitForPlan(subscriptionData.plan_code)
				}
			};
		}

		// Get current active instance count
		const activeInstances = await getUserInstanceCount(userId, 'active');
		const maxInstances = getInstanceLimitForPlan(subscriptionData.plan_code);

		// Pro plan (unlimited instances)
		if (isPlanUnlimited(subscriptionData.plan_code)) {
			return {
				canCreate: true,
				reason: 'UNLIMITED_PLAN',
				message: 'Pro plan allows unlimited active instances',
				details: {
					userId,
					plan: subscriptionData.plan_code,
					activeInstances,
					maxInstances: 'unlimited'
				}
			};
		}

		// Free plan (active instance limit check)
		if (maxInstances !== null && activeInstances >= maxInstances) {
			return {
				canCreate: false,
				reason: 'ACTIVE_LIMIT_REACHED',
				message: `You have reached your ${subscriptionData.plan_code} plan limit of ${maxInstances} active instance${maxInstances > 1 ? 's' : ''}. Deactivate or delete an existing instance to create a new one.`,
				details: {
					userId,
					plan: subscriptionData.plan_code,
					activeInstances,
					maxInstances,
					upgradeRequired: true
				}
			};
		}

		// Can create instance
		return {
			canCreate: true,
			reason: 'WITHIN_LIMIT',
			message: `Can create instance (${activeInstances + 1}/${maxInstances || 'unlimited'} active)`,
			details: {
				userId,
				plan: subscriptionData.plan_code,
				activeInstances,
				maxInstances,
				remaining: maxInstances ? maxInstances - activeInstances : 'unlimited'
			}
		};

	} catch (error) {
		console.error('Error checking instance limit:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		return {
			canCreate: false,
			reason: 'ERROR',
			message: 'Failed to check instance limit',
			details: {
				userId,
				error: errorMessage
			}
		};
	}
}

/**
 * Get user's subscription summary with active instance usage
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Subscription summary object
 */
async function getUserSubscriptionSummary(userId) {
	try {
		let subscription = await getUserSubscription(userId);
		
		// Create default free subscription if user doesn't have one
		if (!subscription) {
			console.log(`Creating default free subscription for user ${userId}`);
			subscription = await createFreeSubscription(userId);
		}

		/** @type {any} */
		const subscriptionData = subscription;
		const isActive = isSubscriptionActive(subscriptionData);
		const activeInstances = await getUserInstanceCount(userId, 'active');
		const maxInstances = getInstanceLimitForPlan(subscriptionData.plan_code);
		const limitCheck = await checkInstanceLimit(userId);
		
		// Get plan configuration
		const planConfig = getPlanByCode(subscriptionData.plan_code);
		/** @type {any} */
		const planConfigData = planConfig;

		return {
			userId,
			subscription: {
				id: subscriptionData.id,
				planCode: subscriptionData.plan_code,
				status: subscriptionData.status,
				billingCycle: subscriptionData.billing_cycle,
				currentPeriodStart: subscriptionData.current_period_start,
				currentPeriodEnd: subscriptionData.current_period_end,
				totalAmount: subscriptionData.total_amount,
				createdAt: subscriptionData.created_at
			},
			plan: planConfigData ? {
				name: planConfigData.name,
				description: planConfigData.description,
				features: planConfigData.features,
				limits: planConfigData.limits,
				priceMonthly: planConfigData.price_monthly,
				priceYearly: planConfigData.price_yearly
			} : null,
			isActive,
			activeInstances,
			maxInstances,
			canCreate: limitCheck.canCreate,
			message: limitCheck.message,
			usage: {
				used: activeInstances,
				limit: maxInstances || 'unlimited',
				remaining: maxInstances ? maxInstances - activeInstances : 'unlimited'
			}
		};

	} catch (error) {
		console.error('Error getting user subscription summary:', error);
		throw error;
	}
}

/**
 * Handle subscription cancellation - update status in user_subscriptions
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result of subscription cancellation
 */
async function handleSubscriptionCancellation(userId) {
	try {
		console.log(`🚫 Processing subscription cancellation for user ${userId}`);

		const client = await pool.connect();
		
		// Update subscription to cancelled status
		const result = await client.query(
			`UPDATE user_subscriptions 
			 SET status = $1, cancelled_at = $2, cancel_at_period_end = $3, updated_at = $2
			 WHERE user_id = $4 AND status IN ('active', 'created', 'authenticated')
			 RETURNING id, plan_code`,
			['cancelled', new Date(), false, userId]
		);
		
		client.release();

		if (result.rows.length === 0) {
			return {
				success: false,
				message: 'No active subscription found to cancel'
			};
		}

		const cancelledSubscription = result.rows[0];
		console.log(`✅ Subscription cancellation completed for user ${userId}`);

		return {
			success: true,
			subscriptionId: cancelledSubscription.id,
			previousPlan: cancelledSubscription.plan_code,
			newStatus: 'cancelled',
			message: 'Subscription has been cancelled successfully'
		};

	} catch (error) {
		console.error('Error handling subscription cancellation:', error);
		throw error;
	}
}

/**
 * Validate plan transition (e.g., from free to pro)
 * @param {string} currentPlan - Current plan code
 * @param {string} newPlan - New plan code
 * @returns {Object} Validation result
 */
function validatePlanTransition(currentPlan, newPlan) {
	const validPlans = ['free', 'pro'];
	
	if (!validPlans.includes(currentPlan) || !validPlans.includes(newPlan)) {
		return {
			valid: false,
			reason: 'INVALID_PLAN_TYPE',
			message: 'Invalid plan type specified'
		};
	}

	if (currentPlan === newPlan) {
		return {
			valid: false,
			reason: 'SAME_PLAN',
			message: 'User is already on the specified plan'
		};
	}

	// Allow any valid transition
	return {
		valid: true,
		reason: 'VALID_TRANSITION',
		message: `Plan transition from ${currentPlan} to ${newPlan} is allowed`,
		changes: {
			from: {
				plan: currentPlan,
				maxInstances: getInstanceLimitForPlan(currentPlan)
			},
			to: {
				plan: newPlan,
				maxInstances: getInstanceLimitForPlan(newPlan)
			}
		}
	};
}

module.exports = {
	isPaymentsDisabled,
	getUserSubscription,
	isSubscriptionActive,
	getInstanceLimitForPlan,
	isPlanUnlimited,
	checkInstanceLimit,
	getUserSubscriptionSummary,
	handleSubscriptionCancellation,
	validatePlanTransition,
	createFreeSubscription
};