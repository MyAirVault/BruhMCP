/**
 * Database queries for user plans operations
 * @fileoverview Contains all database query functions for user plan management
 */

import { pool } from '../config.js';

/**
 * Get user's current plan
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User plan object or null if not found
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
 * @param {Object} options - Additional options
 * @param {Date|null} options.expiresAt - Plan expiration date
 * @param {Object} options.features - Plan features
 * @returns {Promise<Object>} Updated plan object
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
 * @param {string} planType - Plan type ('free' or 'pro')
 * @param {Object} options - Additional options
 * @param {Date|null} options.expiresAt - Plan expiration date
 * @param {Object} options.features - Plan features
 * @returns {Promise<Object>} Created plan object
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
 * @param {Object} options - Query options
 * @param {number} options.limit - Limit results
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<Array>} Array of users with the specified plan
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
 * @returns {Promise<Object>} Plan statistics
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
		
		return result.rowCount;
	} catch (error) {
		console.error('Error deactivating user instances:', error);
		throw error;
	}
}

