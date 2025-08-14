/**
 * Subscription cleanup utilities
 * Handles automatic expiration of unpaid subscriptions and general cleanup tasks
 * Adapted for PostgreSQL database from MicroSAASTemplate
 */

const { pool } = require('../db/config.js');

/**
 * @typedef {Object} ExpiredSubscription
 * @property {string} id - Subscription ID (UUID)
 * @property {string} user_id - User ID (UUID)
 * @property {string} plan_code - Plan code
 * @property {string} razorpay_subscription_id - Razorpay subscription ID
 * @property {number} total_amount - Total amount in paise
 * @property {string} created_at - Creation timestamp
 * @property {string} plan_name - Plan name
 */

/**
 * Configuration for subscription cleanup
 */
const SUBSCRIPTION_TIMEOUT_MINUTES = 20; // 20 minutes timeout for created subscriptions
const CLEANUP_BATCH_SIZE = 100; // Process subscriptions in batches

/**
 * Expire unpaid subscriptions that have been in 'created' status for more than 20 minutes
 * @returns {Promise<{expired: number, errors: string[]}>} Cleanup result
 */
async function expireUnpaidSubscriptions() {
	try {
		console.log('🧹 Starting cleanup of expired unpaid subscriptions...');
		
		const client = await pool.connect();
		const errors = [];
		let totalExpired = 0;

		try {
			// Find subscriptions that are 'created' for more than 20 minutes
			// Only target paid subscriptions (amount > 0) that haven't been activated
			const findExpiredQuery = `
				SELECT 
					us.id,
					us.user_id,
					us.plan_code,
					us.razorpay_subscription_id,
					us.total_amount,
					us.created_at,
					us.plan_code as plan_name
				FROM user_subscriptions us
				WHERE us.status = 'created'
				AND us.total_amount > 0
				AND us.created_at < NOW() - INTERVAL '${SUBSCRIPTION_TIMEOUT_MINUTES} minutes'
				ORDER BY us.created_at ASC
				LIMIT $1
			`;

			const expiredResult = await client.query(findExpiredQuery, [CLEANUP_BATCH_SIZE]);
			const expiredSubscriptions = expiredResult.rows;
			
			console.log(`Found ${expiredSubscriptions.length} expired subscriptions to process`);

			if (expiredSubscriptions.length === 0) {
				console.log('✅ No expired subscriptions found');
				return { expired: 0, errors: [] };
			}

			// Process each expired subscription within a transaction
			for (const subscription of expiredSubscriptions) {
				try {
					console.log(`Processing expired subscription ID: ${subscription.id} (User: ${subscription.user_id}, Plan: ${subscription.plan_code})`);
					
					await client.query('BEGIN');

					// Update subscription status
					const updateSubscriptionQuery = `
						UPDATE user_subscriptions 
						SET 
							status = 'cancelled',
							cancelled_at = NOW(),
							cancellation_reason = 'payment_timeout',
							updated_at = NOW()
						WHERE id = $1
					`;
					await client.query(updateSubscriptionQuery, [subscription.id]);

					// Record expiration transaction for audit trail
					const insertTransactionQuery = `
						INSERT INTO subscription_transactions (
							user_id, subscription_id, transaction_type, amount, net_amount,
							status, method, description, method_details_json,
							created_at, updated_at
						) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
						RETURNING id
					`;

					const transactionResult = await client.query(insertTransactionQuery, [
						subscription.user_id,
						subscription.id,
						'adjustment',
						0, // No amount for expiration
						0,
						'cancelled',
						'system_expiry',
						`Subscription expired due to payment timeout (${SUBSCRIPTION_TIMEOUT_MINUTES} minutes)`,
						JSON.stringify({
							plan_code: subscription.plan_code,
							plan_name: subscription.plan_name,
							original_amount: subscription.total_amount,
							timeout_minutes: SUBSCRIPTION_TIMEOUT_MINUTES,
							razorpay_subscription_id: subscription.razorpay_subscription_id,
							expiry_reason: 'payment_timeout'
						})
					]);

					await client.query('COMMIT');

					const transactionId = transactionResult.rows[0].id;
					totalExpired++;
					
					console.log(`✅ Successfully expired subscription ${subscription.id} (Transaction ID: ${transactionId})`);

				} catch (subscriptionError) {
					await client.query('ROLLBACK');
					const errorMessage = `Failed to expire subscription ${subscription.id}: ${subscriptionError instanceof Error ? subscriptionError.message : String(subscriptionError)}`;
					console.error(`❌ ${errorMessage}`);
					errors.push(errorMessage);
				}
			}

			console.log(`🎯 Cleanup completed: ${totalExpired} subscriptions expired, ${errors.length} errors`);
			
			return {
				expired: totalExpired,
				errors: errors
			};

		} finally {
			client.release();
		}

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('❌ Fatal error during subscription cleanup:', errorMessage);
		throw new Error(`Subscription cleanup failed: ${errorMessage}`);
	} finally {
		console.debug('Expire unpaid subscriptions process completed');
	}
}

/**
 * Clean up old expired and replaced subscriptions to keep database tidy
 * Removes subscriptions that have been expired/replaced for more than 30 days
 * @returns {Promise<{cleaned: number}>} Cleanup result
 */
async function cleanupOldSubscriptions() {
	try {
		console.log('🧹 Starting cleanup of old expired/replaced subscriptions...');
		
		const client = await pool.connect();

		try {
			// Clean up subscriptions that have been expired/replaced for more than 30 days
			const cleanupQuery = `
				DELETE FROM user_subscriptions 
				WHERE status IN ('cancelled', 'completed')
				AND cancelled_at < NOW() - INTERVAL '30 days'
			`;

			const result = await client.query(cleanupQuery);
			
			console.log(`✅ Cleaned up ${result.rowCount} old subscriptions`);
			
			return { cleaned: result.rowCount || 0 };

		} finally {
			client.release();
		}

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('❌ Error during old subscription cleanup:', errorMessage);
		throw new Error(`Old subscription cleanup failed: ${errorMessage}`);
	} finally {
		console.debug('Cleanup old subscriptions process completed');
	}
}

/**
 * Comprehensive subscription cleanup - runs all cleanup tasks
 * @returns {Promise<{expired: number, cleaned: number, errors: string[]}>} Complete cleanup result
 */
async function runSubscriptionCleanup() {
	try {
		console.log('🚀 Starting comprehensive subscription cleanup...');
		
		const expiredResult = await expireUnpaidSubscriptions();
		const cleanedResult = await cleanupOldSubscriptions();
		
		const result = {
			expired: expiredResult.expired,
			cleaned: cleanedResult.cleaned,
			errors: expiredResult.errors
		};
		
		console.log('🎉 Subscription cleanup completed:', result);
		
		return result;

	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('❌ Comprehensive subscription cleanup failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Comprehensive subscription cleanup process completed');
	}
}

module.exports = {
	expireUnpaidSubscriptions,
	cleanupOldSubscriptions,
	runSubscriptionCleanup,
	SUBSCRIPTION_TIMEOUT_MINUTES
};