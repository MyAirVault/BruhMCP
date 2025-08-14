/**
 * Resume Subscription Controller Function
 * Resumes a paused subscription
 */

const { pool } = require('../../../db/config');

/**
 * Resume a user's paused subscription
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<import('express').Response>} Resume result
 */
async function resumeSubscription(req, res) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        
        const userId = req.user.id;

        // Get user's paused subscription
        const subscriptionQuery = `
            SELECT 
                id, 
                plan_code, 
                status, 
                paused_at,
                resume_at,
                current_period_end,
                next_billing_date,
                billing_cycle,
                total_amount,
                razorpay_subscription_id
            FROM user_subscriptions 
            WHERE user_id = $1 
            AND status = 'paused'
            ORDER BY created_at DESC 
            LIMIT 1
        `;
        
        const subscriptionResult = await client.query(subscriptionQuery, [userId]);
        
        if (subscriptionResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No paused subscription found to resume'
            });
        }

        const subscription = subscriptionResult.rows[0];

        // Calculate billing extension based on pause duration
        const pausedAt = new Date(subscription.paused_at);
        const resumeDate = new Date();
        const pauseDurationMs = resumeDate.getTime() - pausedAt.getTime();
        const pauseDurationDays = Math.ceil(pauseDurationMs / (24 * 60 * 60 * 1000));

        // Extend current period and next billing by pause duration
        const currentPeriodEnd = new Date(subscription.current_period_end);
        const newPeriodEnd = new Date(currentPeriodEnd.getTime() + pauseDurationMs);
        
        let newBillingDate = null;
        if (subscription.next_billing_date) {
            const nextBilling = new Date(subscription.next_billing_date);
            newBillingDate = new Date(nextBilling.getTime() + pauseDurationMs);
        }

        // Update subscription to active status
        const updateQuery = `
            UPDATE user_subscriptions 
            SET 
                status = 'active',
                paused_at = NULL,
                resume_at = NULL,
                current_period_end = $1,
                next_billing_date = $2,
                updated_at = NOW()
            WHERE id = $3 AND user_id = $4
            RETURNING 
                id,
                plan_code,
                status,
                current_period_end,
                next_billing_date
        `;
        
        const updateResult = await client.query(updateQuery, [
            newPeriodEnd.toISOString(),
            newBillingDate ? newBillingDate.toISOString() : null,
            subscription.id,
            userId
        ]);

        if (updateResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Failed to resume subscription'
            });
        }

        const resumedSubscription = updateResult.rows[0];

        // Create transaction record for resume action
        const transactionQuery = `
            INSERT INTO subscription_transactions (
                user_id, 
                subscription_id, 
                transaction_type, 
                amount, 
                net_amount, 
                currency, 
                status, 
                description,
                processed_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            RETURNING id
        `;

        const transactionValues = [
            userId,
            subscription.id,
            'adjustment',
            0, // No charge for resuming
            0,
            'INR',
            'captured',
            `Subscription resumed after ${pauseDurationDays} days. Billing extended accordingly.`
        ];

        await client.query(transactionQuery, transactionValues);

        await client.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'Subscription resumed successfully',
            data: {
                subscriptionId: resumedSubscription.id,
                status: resumedSubscription.status,
                resumedAt: resumeDate.toISOString(),
                pauseDuration: pauseDurationDays,
                newPeriodEnd: resumedSubscription.current_period_end,
                nextBillingDate: resumedSubscription.next_billing_date,
                billingExtension: `Billing period extended by ${pauseDurationDays} days`
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Resume subscription error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to resume subscription',
            error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : 'Internal server error'
        });
    } finally {
        client.release();
        console.debug('Resume subscription request completed');
    }
}

module.exports = resumeSubscription;