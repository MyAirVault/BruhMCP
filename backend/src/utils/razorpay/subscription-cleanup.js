/**
 * Subscription cleanup utilities
 * Handles automatic expiration of unpaid subscriptions and general cleanup tasks
 */

/**
 * @typedef {Object} ExpiredSubscription
 * @property {number} id - Subscription ID
 * @property {number} user_id - User ID
 * @property {string} plan_code - Plan code
 * @property {string} razorpay_subscription_id - Razorpay subscription ID
 * @property {number} total_amount - Total amount in paise
 * @property {string} created_at - Creation timestamp
 * @property {string} plan_name - Plan name
 */

const { pool } = require('../../db/config.js');

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

        // Find subscriptions that are 'created' for more than 20 minutes
        // Only target paid subscriptions (amount > 0) that haven't been activated
        const findExpiredSubscriptionsQuery = `
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
            LIMIT ${CLEANUP_BATCH_SIZE}
        `;

        const result = await client.query(findExpiredSubscriptionsQuery);
        const expiredSubscriptions = /** @type {ExpiredSubscription[]} */ (result.rows);
        
        console.log(`Found ${expiredSubscriptions.length} expired subscriptions to process`);

        if (expiredSubscriptions.length === 0) {
            console.log('✅ No expired subscriptions found');
            client.release();
            return { expired: 0, errors: [] };
        }

        // Process each expired subscription
        for (const subscription of expiredSubscriptions) {
            try {
                console.log(`Processing expired subscription ID: ${subscription.id} (User: ${subscription.user_id}, Plan: ${subscription.plan_code})`);
                
                // Mark subscription as expired in database using transaction
                await client.query('BEGIN');
                
                try {
                    // Update subscription status
                    await client.query(`
                        UPDATE user_subscriptions 
                        SET 
                            status = 'expired',
                            cancelled_at = CURRENT_TIMESTAMP,
                            cancellation_reason = 'payment_timeout',
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = $1
                    `, [subscription.id]);

                    // Record expiration transaction for audit trail
                    const transactionResult = await client.query(`
                        INSERT INTO subscription_transactions (
                            user_id, subscription_id, transaction_type, amount, net_amount,
                            status, method, description, method_details_json,
                            created_at, updated_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                        RETURNING id
                    `, [
                        subscription.user_id,
                        subscription.id,
                        'adjustment',
                        0, // No amount for expiration
                        0,
                        'expired',
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
                    
                } catch (transactionError) {
                    await client.query('ROLLBACK');
                    throw transactionError;
                }

            } catch (subscriptionError) {
                /** @type {any} */
                const error = subscriptionError;
                const errorMessage = `Failed to expire subscription ${subscription.id}: ${error.message}`;
                console.error(`❌ ${errorMessage}`);
                errors.push(errorMessage);
            }
        }

        console.log(`🎯 Cleanup completed: ${totalExpired} subscriptions expired, ${errors.length} errors`);
        
        client.release();
        
        return {
            expired: totalExpired,
            errors: errors
        };

    } catch (error) {
        /** @type {any} */
        const err = error;
        console.error('❌ Fatal error during subscription cleanup:', err);
        throw new Error(`Subscription cleanup failed: ${err.message}`);
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
        
        // Clean up subscriptions that have been expired/replaced for more than 30 days
        const result = await client.query(`
            DELETE FROM user_subscriptions 
            WHERE status IN ('expired', 'replaced')
            AND cancelled_at < NOW() - INTERVAL '30 days'
        `);
        
        client.release();
        
        console.log(`✅ Cleaned up ${result.rowCount || 0} old subscriptions`);
        
        return { cleaned: result.rowCount || 0 };

    } catch (error) {
        /** @type {any} */
        const err = error;
        console.error('❌ Error during old subscription cleanup:', err);
        throw new Error(`Old subscription cleanup failed: ${err.message}`);
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
        console.error('❌ Comprehensive subscription cleanup failed:', error);
        throw error;
    }
}

module.exports = {
    expireUnpaidSubscriptions,
    cleanupOldSubscriptions,
    runSubscriptionCleanup,
    SUBSCRIPTION_TIMEOUT_MINUTES
};