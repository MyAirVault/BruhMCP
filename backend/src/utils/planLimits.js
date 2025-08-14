/**
 * Plan limits utility functions
 * Handles plan limits checking and user subscription data retrieval
 */

const { pool } = require('../db/config.js');
const { getPlanByCode } = require('../data/subscription-plans.js');


/**
 * Get user's plan summary with active instance usage
 * @param {string} userId - User ID
 * @returns {Promise<{
 *   subscription: Object|null,
 *   currentPlan: import('../data/subscription-plans').SubscriptionPlan,
 *   isActive: boolean,
 *   isTrialActive?: boolean,
 *   activeInstances: number,
 *   canCreateInstances: boolean,
 *   message: string
 * }>} Plan summary object
 */
async function getUserPlanSummary(userId) {
    try {
        const client = await pool.connect();
        
        // Get user subscription from PostgreSQL user_subscriptions table
        const subscriptionResult = await client.query(
            `SELECT id, user_id, plan_code, razorpay_subscription_id, razorpay_customer_id, 
                    status, billing_cycle, current_period_start, current_period_end, 
                    trial_start, trial_end, cancel_at_period_end, cancelled_at, 
                    total_amount, auto_renewal, failed_payment_count, last_payment_attempt, 
                    created_at, updated_at 
             FROM user_subscriptions WHERE user_id = $1 
             ORDER BY created_at DESC LIMIT 1`,
            [userId]
        );

        // Count active MCP instances for the user
        const instanceResult = await client.query(
            `SELECT COUNT(*) as active_count 
             FROM mcp_service_table 
             WHERE user_id = $1 AND status = 'active'`,
            [userId]
        );
        
        client.release();

        const activeInstances = parseInt(instanceResult.rows[0]?.active_count || 0);

        if (subscriptionResult.rows.length === 0) {
            // Return free plan for users without subscription
            const freePlan = getPlanByCode('free');
            if (!freePlan) {
                throw new Error('Free plan configuration error');
            }

            const maxInstances = freePlan.limits?.instances || 1;
            
            return {
                subscription: null,
                currentPlan: freePlan,
                isActive: true,
                activeInstances: activeInstances,
                canCreateInstances: activeInstances < maxInstances,
                message: activeInstances >= maxInstances ? 
                    `You have reached the maximum number of MCP instances (${maxInstances}) for your plan.` :
                    'Plan verified successfully'
            };
        }

        const subscription = subscriptionResult.rows[0];

        // Get plan configuration for the subscription
        const planConfig = getPlanByCode(subscription.plan_code);
        if (!planConfig) {
            throw new Error('Plan configuration error');
        }

        // Determine subscription status
        const isActive = ['created', 'active', 'authenticated'].includes(subscription.status);
        const isTrialActive = subscription.trial_end && new Date(subscription.trial_end) > new Date();
        
        const maxInstances = planConfig.limits?.instances || 1;
        const canCreateInstances = isActive && activeInstances < maxInstances;

        return {
            subscription: subscription,
            currentPlan: planConfig,
            isActive: isActive,
            isTrialActive: isTrialActive,
            activeInstances: activeInstances,
            canCreateInstances: canCreateInstances,
            message: !isActive ? 
                'Your subscription is not active. Please check your payment status.' :
                activeInstances >= maxInstances ? 
                    `You have reached the maximum number of MCP instances (${maxInstances}) for your plan.` :
                    'Plan verified successfully'
        };
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to get user plan summary:', errorMessage);
        throw error;
    } finally {
        console.debug('Get user plan summary process completed');
    }
}


/**
 * Handle plan cancellation - deactivate all instances and downgrade to free plan
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result of plan cancellation
 */
async function handlePlanCancellation(userId) {
    try {
        const client = await pool.connect();
        
        // Start transaction
        await client.query('BEGIN');
        
        // Deactivate all user's MCP instances
        await client.query(
            `UPDATE mcp_service_table 
             SET status = 'inactive', updated_at = NOW() 
             WHERE user_id = $1 AND status = 'active'`,
            [userId]
        );
        
        // Mark subscription as cancelled
        await client.query(
            `UPDATE user_subscriptions 
             SET status = 'cancelled', 
                 cancelled_at = NOW(), 
                 cancel_at_period_end = true,
                 updated_at = NOW()
             WHERE user_id = $1 AND status IN ('active', 'created', 'authenticated')`,
            [userId]
        );
        
        await client.query('COMMIT');
        client.release();
        
        return {
            success: true,
            message: 'Plan cancelled successfully. All MCP instances have been deactivated.'
        };
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to handle plan cancellation:', errorMessage);
        throw error;
    } finally {
        console.debug('Plan cancellation process completed');
    }
}


/**
 * Validate plan transition (e.g., from free to pro)
 * @param {string} currentPlan - Current plan type
 * @param {string} newPlan - New plan type
 * @returns {Promise<Object>} Validation result
 */
async function validatePlanTransition(currentPlan, newPlan) {
    try {
        const currentPlanConfig = getPlanByCode(currentPlan);
        const newPlanConfig = getPlanByCode(newPlan);
        
        if (!currentPlanConfig || !newPlanConfig) {
            throw new Error('Invalid plan configuration');
        }
        
        const isUpgrade = (newPlanConfig.price_monthly || 0) > (currentPlanConfig.price_monthly || 0);
        const isDowngrade = (newPlanConfig.price_monthly || 0) < (currentPlanConfig.price_monthly || 0);
        
        return {
            isValid: true,
            isUpgrade: isUpgrade,
            isDowngrade: isDowngrade,
            currentPlan: currentPlanConfig,
            newPlan: newPlanConfig,
            message: isUpgrade ? 'Plan upgrade available' : 
                    isDowngrade ? 'Plan downgrade available' : 
                    'Same plan selected'
        };
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to validate plan transition:', errorMessage);
        throw error;
    } finally {
        console.debug('Plan transition validation process completed');
    }
}


// Export functions
module.exports = {
    getUserPlanSummary,
    handlePlanCancellation,
    validatePlanTransition
};