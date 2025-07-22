/**
 * Plan Expiration Agent - Automated monitoring and handling of expired user plans
 * @fileoverview Handles automatic deactivation of instances when pro plans expire
 */

/* global setTimeout, setInterval */

import { pool } from '../db/config.js';
import { handlePlanCancellation } from '../utils/planLimits.js';

/**
 * @typedef {Object} ExpiredProUser
 * @property {number} user_id - User ID
 * @property {string} plan_type - Plan type (should be 'pro')
 * @property {Date|string} plan_expires_at - When the plan expired
 * @property {string} email - User email
 * @property {string} name - User name
 * @property {number} active_instance_count - Number of active instances
 */

/**
 * @typedef {Object} PlanCancellationResult
 * @property {number} deactivatedInstances - Number of instances deactivated
 * @property {string} newPlan - New plan type after downgrade
 * @property {string} message - Result message
 */

/**
 * @typedef {Object} ProcessResult
 * @property {boolean} success - Whether processing was successful
 * @property {number} userId - User ID
 * @property {string} email - User email
 * @property {number} [deactivatedInstances] - Number of instances deactivated (on success)
 * @property {string} [newPlan] - New plan type (on success)
 * @property {string} [message] - Result message
 * @property {string} [error] - Error message (on failure)
 */

/**
 * @typedef {Object} AgentResult
 * @property {boolean} success - Overall success status
 * @property {number} processed - Number of users processed
 * @property {number} [successCount] - Number of successful processes
 * @property {number} [errorCount] - Number of failed processes
 * @property {ProcessResult[]} [results] - Individual processing results
 * @property {number} duration - Processing duration in milliseconds
 * @property {string} message - Overall result message
 * @property {string} [error] - Error message (on failure)
 */

/**
 * @typedef {Object} ExpiredUserCheck
 * @property {boolean} hasExpiredUsers - Whether there are expired users
 * @property {number} count - Number of expired users
 * @property {Array<{userId: number, email: string, planExpiredAt: Date|string, activeInstances: number}>} users - List of expired users
 * @property {string} [error] - Error message if check failed
 */

/**
 * Get all users with expired pro plans that still have active instances
 * @returns {Promise<ExpiredProUser[]>} Array of users with expired plans and active instances
 */
export async function getExpiredProUsersWithActiveInstances() {
	try {
		const query = `
			SELECT DISTINCT 
				up.user_id,
				up.plan_type,
				up.expires_at as plan_expires_at,
				u.email,
				u.name,
				COUNT(mst.instance_id) as active_instance_count
			FROM user_plans up
			JOIN users u ON up.user_id = u.id
			LEFT JOIN mcp_service_table mst ON up.user_id = mst.user_id 
				AND mst.status = 'active'
			WHERE up.plan_type = 'pro'
				AND up.expires_at < NOW()
				AND up.expires_at IS NOT NULL
			GROUP BY up.user_id, up.plan_type, up.expires_at, u.email, u.name
			HAVING COUNT(mst.instance_id) > 0
			ORDER BY up.expires_at ASC
		`;

		const result = await pool.query(query);
		return result.rows;
	} catch (error) {
		console.error('Error fetching expired pro users:', error);
		throw error;
	}
}

/**
 * Process a single expired pro user - deactivate instances and downgrade plan
 * @param {ExpiredProUser} user - User object with expired plan
 * @returns {Promise<ProcessResult>} Processing result
 */
export async function processExpiredProUser(user) {
	const { user_id, email, plan_expires_at, active_instance_count } = user;

	try {
		console.log(`🚫 Processing expired pro user: ${email} (ID: ${user_id})`);
		console.log(`   Plan expired: ${plan_expires_at}, Active instances: ${active_instance_count}`);

		// Use existing plan cancellation logic to handle the expiration
		/** @type {any} */
		const result = await handlePlanCancellation(String(user_id));

		console.log(`✅ Successfully processed expired pro user ${email}:`);
		console.log(`   - Deactivated ${result.deactivatedInstances} instances`);
		console.log(`   - Downgraded to ${result.newPlan} plan`);
		console.log(`   - User can now reactivate 1 instance`);

		return {
			success: true,
			userId: user_id,
			email,
			deactivatedInstances: result.deactivatedInstances,
			newPlan: result.newPlan,
			message: result.message,
		};
	} catch (error) {
		console.error(`❌ Error processing expired pro user ${email} (${user_id}):`, error);
		const errorMessage = error instanceof Error ? error.message : String(error);

		return {
			success: false,
			userId: user_id,
			email,
			error: errorMessage,
			message: `Failed to process expired user: ${errorMessage}`,
		};
	}
}

/**
 * Run the plan expiration agent - process all expired pro users
 * @returns {Promise<AgentResult>} Overall processing result
 */
export async function runPlanExpirationAgent() {
	const startTime = new Date();
	console.log(`🤖 Plan Expiration Agent started at ${startTime.toISOString()}`);

	try {
		// Get all expired pro users with active instances
		const expiredUsers = await getExpiredProUsersWithActiveInstances();

		if (expiredUsers.length === 0) {
			console.log('✅ No expired pro users with active instances found');
			return {
				success: true,
				processed: 0,
				results: [],
				duration: Date.now() - startTime.getTime(),
				message: 'No expired pro users to process',
			};
		}

		console.log(`📋 Found ${expiredUsers.length} expired pro users with active instances`);

		// Process each expired user
		/** @type {ProcessResult[]} */
		const results = [];
		let successCount = 0;
		let errorCount = 0;

		for (const user of expiredUsers) {
			/** @type {ProcessResult} */
		const result = await processExpiredProUser(user);
			results.push(result);

			if (result.success) {
				successCount++;
			} else {
				errorCount++;
			}

			// Add small delay between processing to avoid overwhelming the database
			await new Promise(resolve => setTimeout(resolve, 100));
		}

		const endTime = new Date();
		const duration = endTime.getTime() - startTime.getTime();

		console.log(`🏁 Plan Expiration Agent completed in ${duration}ms`);
		console.log(`   ✅ Successfully processed: ${successCount} users`);
		console.log(`   ❌ Failed to process: ${errorCount} users`);

		return {
			success: errorCount === 0,
			processed: expiredUsers.length,
			successCount,
			errorCount,
			results,
			duration,
			message: `Processed ${expiredUsers.length} expired users: ${successCount} success, ${errorCount} errors`,
		};
	} catch (error) {
		const endTime = new Date();
		const duration = endTime.getTime() - startTime.getTime();
		const errorMessage = error instanceof Error ? error.message : String(error);

		console.error('❌ Plan Expiration Agent failed:', error);

		return {
			success: false,
			processed: 0,
			error: errorMessage,
			duration,
			message: `Agent failed after ${duration}ms: ${errorMessage}`,
		};
	}
}

/**
 * Check if there are any users that need plan expiration processing
 * @returns {Promise<ExpiredUserCheck>} Check result with count of users needing processing
 */
export async function checkForExpiredUsers() {
	try {
		const expiredUsers = await getExpiredProUsersWithActiveInstances();

		return {
			hasExpiredUsers: expiredUsers.length > 0,
			count: expiredUsers.length,
			users: expiredUsers.map(user => ({
				userId: user.user_id,
				email: user.email,
				planExpiredAt: user.plan_expires_at,
				activeInstances: user.active_instance_count,
			})),
		};
	} catch (error) {
		console.error('Error checking for expired users:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		return {
			hasExpiredUsers: false,
			count: 0,
			users: [],
			error: errorMessage,
		};
	}
}

/**
 * Schedule the plan expiration agent to run periodically
 * @param {number} intervalMinutes - How often to run the agent (in minutes)
 * @returns {NodeJS.Timeout} Timer object for the scheduled job
 */
export function schedulePlanExpirationAgent(intervalMinutes = 60) {
	const intervalMs = intervalMinutes * 60 * 1000;

	console.log(`📅 Scheduling Plan Expiration Agent to run every ${intervalMinutes} minutes`);

	// Run immediately on startup
	setTimeout(() => {
		runPlanExpirationAgent().catch(error => {
			console.error('❌ Scheduled Plan Expiration Agent failed:', error);
		});
	}, 5000); // 5 second delay on startup

	// Schedule periodic runs
	return setInterval(async () => {
		try {
			await runPlanExpirationAgent();
		} catch (error) {
			console.error('❌ Scheduled Plan Expiration Agent failed:', error);
		}
	}, intervalMs);
}
