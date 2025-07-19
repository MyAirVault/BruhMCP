/**
 * Utility functions for plan-based active instance limits
 * @fileoverview Contains functions to check and validate user plan limits for active instances
 */

import { getUserPlan, isUserPlanActive, deactivateAllUserInstances, createUserPlan } from '../db/queries/userPlansQueries.js';
import { getUserInstanceCount } from '../db/queries/mcpInstancesQueries.js';

/**
 * Plan limits configuration
 * @typedef {Object} PlanConfig
 * @property {number|null} max_instances - Maximum active instances (null = unlimited)
 * @property {string[]} features - Plan features
 */

/**
 * @type {Record<string, PlanConfig>}
 */
export const PLAN_LIMITS = {
	free: {
		max_instances: 1,
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
 * Check if user can create a new MCP instance (based on active instances)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result object with canCreate flag and details
 */
export async function checkInstanceLimit(userId) {
	try {
		// Get user's plan
		let userPlan = await getUserPlan(userId);
		
		// Create default free plan if user doesn't have one
		if (!userPlan) {
			console.log(`Creating default free plan for user ${userId} during instance limit check`);
			userPlan = await createUserPlan(userId, 'free', {
				expiresAt: null,
				features: { 
					plan_name: "Free Plan", 
					description: "1 active MCP instance maximum"
				}
			});
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
					activeInstances: 0,
					maxInstances: userPlan.max_instances
				}
			};
		}

		// Get current active instance count (only completed OAuth instances)
		const activeInstances = await getUserInstanceCount(userId, 'active');
		const maxInstances = userPlan.max_instances;

		// Pro plan (unlimited instances)
		if (isPlanUnlimited(userPlan.plan_type)) {
			return {
				canCreate: true,
				reason: 'UNLIMITED_PLAN',
				message: 'Pro plan allows unlimited active instances',
				details: {
					userId,
					plan: userPlan.plan_type,
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
				message: `You have reached your free plan limit of ${maxInstances} active instance${maxInstances > 1 ? 's' : ''}. Deactivate or delete an existing instance to create a new one.`,
				details: {
					userId,
					plan: userPlan.plan_type,
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
				plan: userPlan.plan_type,
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
 * Get user's plan summary with active instance usage
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Plan summary object
 */
export async function getUserPlanSummary(userId) {
	try {
		let userPlan = await getUserPlan(userId);
		
		// Create default free plan if user doesn't have one
		if (!userPlan) {
			console.log(`Creating default free plan for user ${userId}`);
			userPlan = await createUserPlan(userId, 'free', {
				expiresAt: null,
				features: { 
					plan_name: "Free Plan", 
					description: "1 active MCP instance maximum"
				}
			});
		}

		const isPlanActive = await isUserPlanActive(userId);
		const activeInstances = await getUserInstanceCount(userId, 'active');
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
			activeInstances,
			maxInstances: userPlan.max_instances,
			canCreate: limitCheck.canCreate,
			message: limitCheck.message,
			usage: {
				used: activeInstances,
				limit: userPlan.max_instances || 'unlimited',
				remaining: userPlan.max_instances ? userPlan.max_instances - activeInstances : 'unlimited'
			}
		};

	} catch (error) {
		console.error('Error getting user plan summary:', error);
		throw error;
	}
}

/**
 * Handle plan cancellation - deactivate all instances and downgrade to free plan
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result of plan cancellation
 */
export async function handlePlanCancellation(userId) {
	try {
		console.log(`🚫 Processing plan cancellation for user ${userId}`);

		// Deactivate all active instances
		const deactivatedCount = await deactivateAllUserInstances(userId);

		// Downgrade to free plan
		const { updateUserPlan } = await import('../db/queries/userPlansQueries.js');
		await updateUserPlan(userId, 'free', {
			expiresAt: null,
			features: { 
				plan_name: "Free Plan", 
				description: "1 active MCP instance maximum",
				downgraded_from: "pro",
				downgraded_at: new Date().toISOString()
			}
		});

		console.log(`✅ Plan cancellation completed for user ${userId}`);

		return {
			success: true,
			deactivatedInstances: deactivatedCount,
			newPlan: 'free',
			maxActiveInstances: 1,
			message: `Plan cancelled. ${deactivatedCount} instances deactivated. You can now reactivate 1 instance.`
		};

	} catch (error) {
		console.error('Error handling plan cancellation:', error);
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