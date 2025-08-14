/**
 * Credit processing utilities integrated into subscription operations
 * Following MicroSAASTemplate approach of inline credit handling
 */

const { pool } = require('../db/config.js');

/**
 * Process refund to account credits for downgrades (following template approach)
 * @param {Object} refundData - Refund processing data
 * @param {string} refundData.userId - User ID
 * @param {number} refundData.subscriptionId - Subscription ID
 * @param {number} refundData.creditAmount - Credit amount in paise
 * @param {string} refundData.reason - Reason for credit
 * @param {import('pg').PoolClient} [existingClient] - Optional existing database client
 * @returns {Promise<Object>} Credit processing result
 * @throws {Error} If credit processing fails
 */
async function processRefundToCredits(refundData, existingClient = undefined) {
    try {
        const { userId, subscriptionId, creditAmount, reason } = refundData;

        // Validate input data with specific error messages
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        if (!subscriptionId) {
            throw new Error('Subscription ID is required');
        }
        
        if (typeof creditAmount !== 'number') {
            throw new Error('Credit amount is required');
        }
        
        if (!reason) {
            throw new Error('Reason is required');
        }

        if (creditAmount <= 0) {
            throw new Error('Credit amount must be positive');
        }

        // Calculate expiry date (1 year from now)
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        const client = existingClient || await pool.connect();

        // Insert account credit record
        const creditResult = await client.query(`
            INSERT INTO account_credits (
                user_id, subscription_id, credit_amount, remaining_amount, 
                credit_type, description, expires_at, is_active
            ) VALUES ($1, $2, $3, $3, $4, $5, $6, true)
            RETURNING id
        `, [
            userId,
            subscriptionId,
            creditAmount,
            'downgrade', // credit_type
            reason,
            expiresAt.toISOString()
        ]);

        if (!existingClient) {
            client.release();
        }

        const result = {
            success: true,
            creditAmount,
            transactionId: creditResult.rows[0].id
        };

        console.log('Account credit processed successfully:', result);
        return result;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Account credit processing failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Account credit processing completed');
    }
}

/**
 * Get user's available credit balance
 * @param {string} userId - User ID
 * @returns {Promise<number>} Available credit balance in paise
 */
async function getUserCreditBalance(userId) {
    try {
        const client = await pool.connect();
        
        const result = await client.query(`
            SELECT COALESCE(SUM(remaining_amount), 0) as total_credits
            FROM account_credits 
            WHERE user_id = $1 
            AND is_active = true 
            AND remaining_amount > 0
            AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        `, [userId]);

        client.release();
        
        return parseInt(result.rows[0].total_credits) || 0;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to get user credit balance:', errorMessage);
        return 0; // Return 0 on error to not block operations
    }
}

module.exports = {
    processRefundToCredits,
    getUserCreditBalance,
};