/**
 * Plan Expiration Agent - Automated monitoring and handling of expired user plans
 * @fileoverview Handles automatic deactivation of instances when pro plans expire
 */

/* global setTimeout, setInterval */

import { pool } from '../db/config.js';
import { handlePlanCancellation } from '../utils/planLimits.js';

/**
 * Get all users with expired pro plans that still have active instances
 * @returns {Promise<Array>} Array of users with expired plans and active instances
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
 * @param {Object} user - User object with expired plan
 * @returns {Promise<Object>} Processing result
 */
export async function processExpiredProUser(user) {
	const { user_id, email, plan_expires_at, active_instance_count } = user;

	try {
		console.log(`🚫 Processing expired pro user: ${email} (ID: ${user_id})`);
		console.log(`   Plan expired: ${plan_expires_at}, Active instances: ${active_instance_count}`);

		// Use existing plan cancellation logic to handle the expiration
		const result = await handlePlanCancellation(user_id);

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

		return {
			success: false,
			userId: user_id,
			email,
			error: error.message,
			message: `Failed to process expired user: ${error.message}`,
		};
	}
}

/**
 * Run the plan expiration agent - process all expired pro users
 * @returns {Promise<Object>} Overall processing result
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
		const results = [];
		let successCount = 0;
		let errorCount = 0;

		for (const user of expiredUsers) {
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

		console.error('❌ Plan Expiration Agent failed:', error);

		return {
			success: false,
			processed: 0,
			error: error.message,
			duration,
			message: `Agent failed after ${duration}ms: ${error.message}`,
		};
	}
}

/**
 * Check if there are any users that need plan expiration processing
 * @returns {Promise<Object>} Check result with count of users needing processing
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
		return {
			hasExpiredUsers: false,
			count: 0,
			users: [],
			error: error.message,
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
