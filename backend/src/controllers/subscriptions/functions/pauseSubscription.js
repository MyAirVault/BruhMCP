/**
 * Pause Subscription Controller Function
 * Pauses an active subscription temporarily
 */

const { pool } = require('../../../db/config');

/**
 * Pause a user's active subscription
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<import('express').Response>} Pause result
 */
async function pauseSubscription(req, res) {
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
        const { reason, pauseDuration } = req.body;

        // Validate pause duration (max 6 months)
        const maxPauseDays = 180;
        const pauseDays = pauseDuration || 30; // Default 30 days
        
        if (pauseDays > maxPauseDays) {
            return res.status(400).json({
                success: false,
                message: `Pause duration cannot exceed ${maxPauseDays} days`
            });
        }

        // Get user's active subscription
        const subscriptionQuery = `
            SELECT 
                id, 
                plan_code, 
                status, 
                pause_count,
                current_period_end,
                razorpay_subscription_id
            FROM user_subscriptions 
            WHERE user_id = $1 
            AND status IN ('active', 'authenticated')
            ORDER BY created_at DESC 
            LIMIT 1
        `;
        
        const subscriptionResult = await client.query(subscriptionQuery, [userId]);
        
        if (subscriptionResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No active subscription found to pause'
            });
        }

        const subscription = subscriptionResult.rows[0];

        // Check pause limits (max 3 pauses per subscription)
        if (subscription.pause_count >= 3) {
            return res.status(400).json({
                success: false,
                message: 'Maximum pause limit reached. You can only pause a subscription 3 times.',
                code: 'PAUSE_LIMIT_EXCEEDED'
            });
        }

        // Free plans cannot be paused
        if (subscription.plan_code === 'free') {
            return res.status(400).json({
                success: false,
                message: 'Free subscriptions cannot be paused'
            });
        }

        // Calculate resume date
        const pausedAt = new Date();
        const resumeAt = new Date(pausedAt.getTime() + (pauseDays * 24 * 60 * 60 * 1000));

        // Update subscription to paused status
        const updateQuery = `
            UPDATE user_subscriptions 
            SET 
                status = 'paused',
                pause_count = pause_count + 1,
                paused_at = $1,
                resume_at = $2,
                updated_at = NOW()
            WHERE id = $3 AND user_id = $4
            RETURNING 
                id,
                plan_code,
                status,
                pause_count,
                paused_at,
                resume_at
        `;
        
        const updateResult = await client.query(updateQuery, [
            pausedAt.toISOString(),
            resumeAt.toISOString(),
            subscription.id,
            userId
        ]);

        if (updateResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Failed to pause subscription'
            });
        }

        const pausedSubscription = updateResult.rows[0];

        // Create transaction record for pause action
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
            0, // No charge for pausing
            0,
            'INR',
            'captured',
            `Subscription paused for ${pauseDays} days. Reason: ${reason || 'User request'}`
        ];

        await client.query(transactionQuery, transactionValues);

        await client.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: `Subscription paused successfully for ${pauseDays} days`,
            data: {
                subscriptionId: pausedSubscription.id,
                status: pausedSubscription.status,
                pausedAt: pausedSubscription.paused_at,
                resumeAt: pausedSubscription.resume_at,
                pauseCount: pausedSubscription.pause_count,
                remainingPauses: 3 - pausedSubscription.pause_count,
                reason: reason || 'User request'
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Pause subscription error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to pause subscription',
            error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : 'Internal server error'
        });
    } finally {
        client.release();
        console.debug('Pause subscription request completed');
    }
}

module.exports = pauseSubscription;