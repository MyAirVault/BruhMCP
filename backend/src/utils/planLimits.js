/**
 * Utility functions for plan-based instance limits
 * @fileoverview Contains functions to check and validate user plan limits
 */

import { getUserPlan, isUserPlanActive } from '../db/queries/userPlansQueries.js';
import { getUserInstanceCount } from '../db/queries/mcpInstancesQueries.js';

/**
 * Plan limits configuration
 * @typedef {Object} PlanConfig
 * @property {number|null} max_instances - Maximum instances (null = unlimited)
 * @property {string[]} features - Plan features
 */

/**
 * @type {Record<string, PlanConfig>}
 */
export const PLAN_LIMITS = {
	free: {
		max_instances: 3,
		features: ['basic_mcp_access']
	},
	pro: {
		max_instances: null, // unlimited
		features: ['unlimited_instances', 'priority_support', 'advanced_features']
	}
};

/**
 * Get instance limit for a plan type
 * @param {string} planType - Plan type ('free' or 'pro')
 * @returns {number|null} Max instances (null = unlimited)
 */
export function getInstanceLimitForPlan(planType) {
	const plan = PLAN_LIMITS[planType];
	return plan ? plan.max_instances : PLAN_LIMITS.free.max_instances;
}

/**
 * Check if a plan has unlimited instances
 * @param {string} planType - Plan type ('free' or 'pro')
 * @returns {boolean} True if plan has unlimited instances
 */
export function isPlanUnlimited(planType) {
	const plan = PLAN_LIMITS[planType];
	return plan ? plan.max_instances === null : false;
}

/**
 * Check if user can create a new MCP instance (based on lifetime total)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result object with canCreate flag and details
 */
export async function checkInstanceLimit(userId) {
	try {
		// Get user's plan
		const userPlan = await getUserPlan(userId);
		
		if (!userPlan) {
			return {
				canCreate: false,
				reason: 'NO_PLAN',
				message: 'User has no plan assigned',
				details: {
					userId,
					plan: null,
					totalInstancesCreated: 0,
					maxInstances: 0
				}
			};
		}

		// Check if plan is active (not expired)
		const isPlanActive = await isUserPlanActive(userId);
		
		if (!isPlanActive) {
			return {
				canCreate: false,
				reason: 'PLAN_EXPIRED',
				message: 'Your subscription plan has expired. Please renew to continue.',
				details: {
					userId,
					plan: userPlan.plan_type,
					expiresAt: userPlan.expires_at,
					totalInstancesCreated: userPlan.total_instances_created,
					maxInstances: userPlan.max_instances
				}
			};
		}

		// Get current lifetime total
		const totalInstancesCreated = userPlan.total_instances_created || 0;
		const maxInstances = userPlan.max_instances;

		// Pro plan (unlimited instances)
		if (isPlanUnlimited(userPlan.plan_type)) {
			return {
				canCreate: true,
				reason: 'UNLIMITED_PLAN',
				message: 'Pro plan allows unlimited instances',
				details: {
					userId,
					plan: userPlan.plan_type,
					totalInstancesCreated,
					maxInstances: 'unlimited'
				}
			};
		}

		// Free plan (lifetime limit check)
		if (maxInstances !== null && totalInstancesCreated >= maxInstances) {
			return {
				canCreate: false,
				reason: 'LIFETIME_LIMIT_REACHED',
				message: `You have reached your free plan limit of ${maxInstances} total instances. Upgrade to Pro for unlimited instances.`,
				details: {
					userId,
					plan: userPlan.plan_type,
					totalInstancesCreated,
					maxInstances,
					upgradeRequired: true
				}
			};
		}

		// Can create instance
		return {
			canCreate: true,
			reason: 'WITHIN_LIMIT',
			message: `Can create instance (${totalInstancesCreated + 1}/${maxInstances} total)`,
			details: {
				userId,
				plan: userPlan.plan_type,
				totalInstancesCreated,
				maxInstances,
				remaining: maxInstances ? maxInstances - totalInstancesCreated : 'unlimited'
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
 * Get user's plan summary with instance usage
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Plan summary object
 */
export async function getUserPlanSummary(userId) {
	try {
		const userPlan = await getUserPlan(userId);
		
		if (!userPlan) {
			return {
				userId,
				plan: null,
				isActive: false,
				currentInstances: 0,
				maxInstances: 0,
				canCreate: false,
				message: 'No plan assigned'
			};
		}

		const isPlanActive = await isUserPlanActive(userId);
		const currentInstances = await getUserInstanceCount(userId);
		const limitCheck = await checkInstanceLimit(userId);

		return {
			userId,
			plan: {
				type: userPlan.plan_type,
				maxInstances: userPlan.max_instances,
				features: userPlan.features,
				expiresAt: userPlan.expires_at,
				createdAt: userPlan.created_at
			},
			isActive: isPlanActive,
			currentInstances,
			maxInstances: userPlan.max_instances,
			canCreate: limitCheck.canCreate,
			message: limitCheck.message,
			usage: {
				used: currentInstances,
				limit: userPlan.max_instances || 'unlimited',
				remaining: userPlan.max_instances ? userPlan.max_instances - currentInstances : 'unlimited'
			}
		};

	} catch (error) {
		console.error('Error getting user plan summary:', error);
		throw error;
	}
}

/**
 * Validate plan transition (e.g., from free to pro)
 * @param {string} currentPlan - Current plan type
 * @param {string} newPlan - New plan type
 * @returns {Object} Validation result
 */
export function validatePlanTransition(currentPlan, newPlan) {
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