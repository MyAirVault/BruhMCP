/**
 * Database queries for user plans operations
 * @fileoverview Contains all database query functions for user plan management
 */

import { pool } from '../config.js';

/**
 * @typedef {Object} UserPlan
 * @property {string} plan_id - Plan ID
 * @property {string} user_id - User ID
 * @property {string} plan_type - Plan type (free/pro)
 * @property {number|null} max_instances - Maximum instances allowed
 * @property {Object} features - Plan features
 * @property {string|null} expires_at - Plan expiration date
 * @property {string|null} subscription_id - Payment subscription ID
 * @property {string|null} customer_id - Payment customer ID
 * @property {string|null} payment_status - Payment status
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} PlanOptions
 * @property {Date|null} [expiresAt] - Plan expiration date
 * @property {Object} [features] - Plan features
 */

/**
 * @typedef {Object} QueryOptions
 * @property {number} [limit] - Limit results
 * @property {number} [offset] - Offset for pagination
 */

/**
 * @typedef {Object} PlanStatistics
 * @property {number} total_users - Total users count
 * @property {Object.<string, {total: number, active: number, expired: number}>} by_plan - Stats by plan type
 */

/**
 * Get user's current plan
 * @param {string} userId - User ID
 * @returns {Promise<UserPlan|null>} User plan object or null if not found
 */
export async function getUserPlan(userId) {
	try {
		const query = `
			SELECT 
				plan_id,
				user_id,
				plan_type,
				max_instances,
				features,
				expires_at,
				subscription_id,
				customer_id,
				payment_status,
				created_at,
				updated_at
			FROM user_plans
			WHERE user_id = $1
		`;
		
		const result = await pool.query(query, [userId]);
		return result.rows[0] || null;
	} catch (error) {
		console.error('Error getting user plan:', error);
		throw error;
	}
}

/**
 * Update user's plan
 * @param {string} userId - User ID
 * @param {string} planType - Plan type ('free' or 'pro')
 * @param {PlanOptions} [options] - Additional options
 * @returns {Promise<UserPlan>} Updated plan object
 */
export async function updateUserPlan(userId, planType, options = {}) {
	try {
		const { expiresAt = null, features = {} } = options;
		
		// Determine max_instances based on plan_type
		const maxInstances = planType === 'free' ? 1 : null;
		
		const query = `
			UPDATE user_plans
			SET 
				plan_type = $2,
				max_instances = $3,
				expires_at = $4,
				features = $5,
				updated_at = CURRENT_TIMESTAMP
			WHERE user_id = $1
			RETURNING *
		`;
		
		const values = [userId, planType, maxInstances, expiresAt, JSON.stringify(features)];
		const result = await pool.query(query, values);
		
		if (result.rows.length === 0) {
			throw new Error(`User plan not found for user: ${userId}`);
		}
		
		return result.rows[0];
	} catch (error) {
		console.error('Error updating user plan:', error);
		throw error;
	}
}

/**
 * Create user plan (used for new users if auto-trigger fails)
 * @param {string} userId - User ID
 * @param {string} [planType] - Plan type ('free' or 'pro')
 * @param {PlanOptions} [options] - Additional options
 * @returns {Promise<UserPlan>} Created plan object
 */
export async function createUserPlan(userId, planType = 'free', options = {}) {
	try {
		const { expiresAt = null, features = {} } = options;
		
		// Determine max_instances based on plan_type
		const maxInstances = planType === 'free' ? 1 : null;
		
		const query = `
			INSERT INTO user_plans (user_id, plan_type, max_instances, expires_at, features)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (user_id) DO UPDATE SET
				plan_type = EXCLUDED.plan_type,
				max_instances = EXCLUDED.max_instances,
				expires_at = EXCLUDED.expires_at,
				features = EXCLUDED.features,
				updated_at = CURRENT_TIMESTAMP
			RETURNING *
		`;
		
		const values = [userId, planType, maxInstances, expiresAt, JSON.stringify(features)];
		const result = await pool.query(query, values);
		
		return result.rows[0];
	} catch (error) {
		console.error('Error creating user plan:', error);
		throw error;
	}
}

/**
 * Check if user's plan is active (not expired)
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if plan is active
 */
export async function isUserPlanActive(userId) {
	try {
		const query = `
			SELECT expires_at
			FROM user_plans
			WHERE user_id = $1
		`;
		
		const result = await pool.query(query, [userId]);
		
		if (result.rows.length === 0) {
			return false; // No plan found
		}
		
		const expiresAt = result.rows[0].expires_at;
		
		// If expires_at is null, plan never expires (active)
		if (!expiresAt) {
			return true;
		}
		
		// Check if current time is before expiration
		return new Date() < new Date(expiresAt);
	} catch (error) {
		console.error('Error checking plan status:', error);
		throw error;
	}
}

/**
 * Get all users with a specific plan type
 * @param {string} planType - Plan type ('free' or 'pro')
 * @param {QueryOptions} [options] - Query options
 * @returns {Promise<UserPlan[]>} Array of users with the specified plan
 */
export async function getUsersByPlanType(planType, options = {}) {
	try {
		const { limit = 100, offset = 0 } = options;
		
		const query = `
			SELECT 
				up.plan_id,
				up.user_id,
				up.plan_type,
				up.max_instances,
				up.features,
				up.expires_at,
				up.created_at,
				up.updated_at,
				u.email,
				u.name
			FROM user_plans up
			JOIN users u ON up.user_id = u.id
			WHERE up.plan_type = $1
			ORDER BY up.created_at DESC
			LIMIT $2 OFFSET $3
		`;
		
		const result = await pool.query(query, [planType, limit, offset]);
		return result.rows;
	} catch (error) {
		console.error('Error getting users by plan type:', error);
		throw error;
	}
}

/**
 * Get plan statistics
 * @returns {Promise<PlanStatistics>} Plan statistics
 */
export async function getPlanStatistics() {
	try {
		const query = `
			SELECT 
				plan_type,
				COUNT(*) as user_count,
				COUNT(CASE WHEN expires_at IS NULL OR expires_at > NOW() THEN 1 END) as active_count,
				COUNT(CASE WHEN expires_at IS NOT NULL AND expires_at <= NOW() THEN 1 END) as expired_count
			FROM user_plans
			GROUP BY plan_type
		`;
		
		const result = await pool.query(query);
		
		/** @type {PlanStatistics} */
		const stats = {
			total_users: 0,
			by_plan: {}
		};
		
		for (const row of result.rows) {
			stats.by_plan[row.plan_type] = {
				total: parseInt(row.user_count),
				active: parseInt(row.active_count),
				expired: parseInt(row.expired_count)
			};
			stats.total_users += parseInt(row.user_count);
		}
		
		return stats;
	} catch (error) {
		console.error('Error getting plan statistics:', error);
		throw error;
	}
}

/**
 * Update billing-specific fields for a user plan
 * @param {string} userId - User ID
 * @param {Object} billingData - Billing data to update
 * @param {string} billingData.subscriptionId - Subscription ID
 * @param {string} billingData.customerId - Razorpay customer ID
 * @param {string} billingData.paymentStatus - Payment status
 * @returns {Promise<UserPlan>} Updated plan object
 */
export async function updateUserPlanBilling(userId, billingData) {
	try {
		const { subscriptionId, customerId, paymentStatus } = billingData;
		
		const query = `
			UPDATE user_plans
			SET 
				subscription_id = $2,
				customer_id = $3,
				payment_status = $4,
				updated_at = CURRENT_TIMESTAMP
			WHERE user_id = $1
			RETURNING *
		`;
		
		const values = [userId, subscriptionId, customerId, paymentStatus];
		const result = await pool.query(query, values);
		
		if (result.rows.length === 0) {
			throw new Error(`User plan not found for user: ${userId}`);
		}
		
		return result.rows[0];
	} catch (error) {
		console.error('Error updating user plan billing:', error);
		throw error;
	}
}

/**
 * Get user plan by subscription ID
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<UserPlan|null>} User plan object or null if not found
 */
export async function getUserPlanBySubscriptionId(subscriptionId) {
	try {
		const query = `
			SELECT 
				plan_id,
				user_id,
				plan_type,
				max_instances,
				features,
				expires_at,
				subscription_id,
				customer_id,
				payment_status,
				created_at,
				updated_at
			FROM user_plans
			WHERE subscription_id = $1
		`;
		
		const result = await pool.query(query, [subscriptionId]);
		return result.rows[0] || null;
	} catch (error) {
		console.error('Error getting user plan by subscription ID:', error);
		throw error;
	}
}

/**
 * Deactivate all active instances for a user (used when Pro plan is cancelled)
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of instances deactivated
 */
export async function deactivateAllUserInstances(userId) {
	try {
		const query = `
			UPDATE mcp_service_table
			SET status = CASE 
				WHEN expires_at IS NOT NULL AND expires_at <= NOW() THEN 'expired'
				ELSE 'inactive'
			END,
			updated_at = CURRENT_TIMESTAMP
			WHERE user_id = $1 AND status = 'active'
			RETURNING instance_id, status
		`;
		
		const result = await pool.query(query, [userId]);
		
		console.log(`📉 Deactivated ${result.rowCount} instances for user ${userId}`);
		
		// Log each deactivated instance
		for (const row of result.rows) {
			console.log(`  - Instance ${row.instance_id} → ${row.status}`);
		}
		
		return result.rowCount || 0;
	} catch (error) {
		console.error('Error deactivating user instances:', error);
		throw error;
	}
}

/**
 * Atomically activate Pro subscription (prevents race conditions between webhook and frontend)
 * @param {string} userId - User ID
 * @param {string} subscriptionId - Razorpay subscription ID
 * @param {Date} expiresAt - Subscription expiration date
 * @param {string|null} [customerId] - Razorpay customer ID
 * @returns {Promise<Object>} Result object with status and plan data
 */
export async function atomicActivateProSubscription(userId, subscriptionId, expiresAt, customerId = null) {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');

		// Lock the user plan row to prevent concurrent updates
		const lockQuery = `
			SELECT plan_type, payment_status, subscription_id
			FROM user_plans
			WHERE user_id = $1
			FOR UPDATE
		`;
		const lockResult = await client.query(lockQuery, [userId]);

		if (lockResult.rows.length === 0) {
			await client.query('ROLLBACK');
			throw new Error(`User plan not found for user: ${userId}`);
		}

		const currentPlan = lockResult.rows[0];

		// Check if already activated to prevent duplicate processing
		if (currentPlan.plan_type === 'pro' && 
			currentPlan.payment_status === 'active' && 
			currentPlan.subscription_id === subscriptionId) {
			await client.query('COMMIT');
			return {
				status: 'already_active',
				message: 'Subscription already activated',
				plan: currentPlan
			};
		}

		// Update to Pro plan with subscription details
		const updateQuery = `
			UPDATE user_plans
			SET 
				plan_type = 'pro',
				max_instances = NULL,
				payment_status = 'active',
				subscription_id = $2,
				customer_id = $3,
				expires_at = $4,
				features = jsonb_build_object(
					'maxInstances', 'unlimited',
					'activatedAt', to_jsonb($5::timestamptz),
					'activatedBy', 'payment_system'
				),
				updated_at = CURRENT_TIMESTAMP
			WHERE user_id = $1
			RETURNING *
		`;

		const updateValues = [userId, subscriptionId, customerId, expiresAt, new Date()];
		const updateResult = await client.query(updateQuery, updateValues);

		await client.query('COMMIT');

		return {
			status: 'activated',
			message: 'Pro subscription activated successfully',
			plan: updateResult.rows[0]
		};

	} catch (error) {
		await client.query('ROLLBACK');
		console.error('Error in atomic subscription activation:', error);
		throw error;
	} finally {
		client.release();
	}
}

