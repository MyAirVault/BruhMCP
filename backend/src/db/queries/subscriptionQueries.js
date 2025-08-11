/**
 * Database queries for subscription operations
 * Supports multiple active subscriptions per user for stacked billing periods
 * @fileoverview Contains all database query functions for subscription management
 */

const { pool } = require('../config.js');

/**
 * @typedef {Object} UserSubscription
 * @property {string} id - Subscription ID
 * @property {string} user_id - User ID
 * @property {string} plan_code - Plan code (free, pro)
 * @property {string} status - Subscription status
 * @property {string} billing_cycle - Billing cycle (monthly, yearly)
 * @property {Date} current_period_start - Current period start
 * @property {Date} current_period_end - Current period end
 * @property {number} total_amount - Total amount in paise
 * @property {string|null} razorpay_subscription_id - Razorpay subscription ID
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */

/**
 * Create a new subscription for user
 * Allows multiple subscriptions per user for stacked billing
 * @param {Object} subscriptionData - Subscription data
 * @param {string} subscriptionData.userId - User ID
 * @param {string} subscriptionData.planCode - Plan code (free, pro)
 * @param {string} subscriptionData.status - Subscription status
 * @param {string} subscriptionData.billingCycle - Billing cycle (monthly, yearly)
 * @param {Date} subscriptionData.currentPeriodStart - Period start date
 * @param {Date} subscriptionData.currentPeriodEnd - Period end date
 * @param {number} subscriptionData.totalAmount - Total amount in paise
 * @param {string|undefined} [subscriptionData.razorpaySubscriptionId] - Razorpay subscription ID
 * @returns {Promise<UserSubscription>} Created subscription record
 */
async function createUserSubscription(subscriptionData) {
    const {
        userId,
        planCode,
        status,
        billingCycle,
        currentPeriodStart,
        currentPeriodEnd,
        totalAmount,
        razorpaySubscriptionId = undefined
    } = subscriptionData;

    const query = `
        INSERT INTO user_subscriptions (
            user_id, plan_code, status, billing_cycle,
            current_period_start, current_period_end, total_amount,
            razorpay_subscription_id, next_billing_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
    `;

    const result = await pool.query(query, [
        userId,
        planCode,
        status,
        billingCycle,
        currentPeriodStart,
        currentPeriodEnd,
        totalAmount,
        razorpaySubscriptionId || null,
        currentPeriodEnd // next_billing_date same as period end for stacked subscriptions
    ]);

    return result.rows[0];
}

/**
 * Get user's active subscriptions ordered by end date
 * @param {string} userId - User ID
 * @returns {Promise<UserSubscription[]>} Active subscriptions
 */
async function getUserActiveSubscriptions(userId) {
    const query = `
        SELECT * FROM user_subscriptions 
        WHERE user_id = $1 AND status = 'active'
        ORDER BY current_period_end ASC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
}

/**
 * Get user's current active subscription with highest tier plan
 * If multiple plans are active, returns the highest tier one
 * @param {string} userId - User ID
 * @returns {Promise<UserSubscription|null>} Current subscription
 */
async function getUserCurrentSubscription(userId) {
    const query = `
        SELECT * FROM user_subscriptions 
        WHERE user_id = $1 AND status = 'active'
        AND current_period_end > NOW()
        ORDER BY 
            CASE plan_code 
                WHEN 'pro' THEN 2
                WHEN 'free' THEN 1
                ELSE 0
            END DESC,
            current_period_end DESC
        LIMIT 1
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
}

/**
 * Get user's total subscription time remaining in days
 * Calculates stacked subscription periods
 * @param {string} userId - User ID
 * @param {string} [planCode] - Optional plan code filter
 * @returns {Promise<number>} Total days remaining across all active subscriptions
 */
async function getUserSubscriptionTimeRemaining(userId, planCode = undefined) {
    let query = `
        SELECT 
            COALESCE(SUM(
                EXTRACT(EPOCH FROM (current_period_end - NOW())) / 86400
            ), 0) as total_days_remaining
        FROM user_subscriptions 
        WHERE user_id = $1 AND status = 'active'
        AND current_period_end > NOW()
    `;
    
    const params = [userId];
    
    if (planCode) {
        query += ` AND plan_code = $2`;
        params.push(planCode);
    }

    const result = await pool.query(query, params);
    return Math.max(0, Math.floor(result.rows[0]?.total_days_remaining || 0));
}

/**
 * Create default free subscription for new user
 * @param {string} userId - User ID
 * @returns {Promise<UserSubscription>} Created free subscription
 */
async function createDefaultFreeSubscription(userId) {
    const now = new Date();
    const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    return createUserSubscription({
        userId,
        planCode: 'free',
        status: 'active',
        billingCycle: 'monthly',
        currentPeriodStart: now,
        currentPeriodEnd: oneYearFromNow,
        totalAmount: 0
    });
}

/**
 * Add subscription period to user (stacking)
 * If user has existing active subscriptions, extends the end date
 * If no active subscriptions, creates new one starting now
 * @param {Object} subscriptionData - Subscription data
 * @param {string} subscriptionData.userId - User ID
 * @param {string} subscriptionData.planCode - Plan code (free, pro)
 * @param {string} subscriptionData.billingCycle - Billing cycle (monthly, yearly)
 * @param {number} subscriptionData.totalAmount - Amount in paise
 * @param {string|undefined} [subscriptionData.razorpaySubscriptionId] - Razorpay subscription ID
 * @returns {Promise<UserSubscription>} Created subscription
 */
async function addSubscriptionPeriod(subscriptionData) {
    const { userId, planCode, billingCycle, totalAmount, razorpaySubscriptionId = undefined } = subscriptionData;
    
    // Get the latest subscription end date for this user and plan
    const latestQuery = `
        SELECT MAX(current_period_end) as latest_end
        FROM user_subscriptions 
        WHERE user_id = $1 AND plan_code = $2 AND status = 'active'
    `;
    
    const latestResult = await pool.query(latestQuery, [userId, planCode]);
    const latestEnd = latestResult.rows[0]?.latest_end;
    
    // Calculate new period dates
    const now = new Date();
    const periodStart = latestEnd && new Date(latestEnd) > now ? new Date(latestEnd) : now;
    
    // Calculate period length based on billing cycle
    const periodLength = billingCycle === 'yearly' ? 365 : 30;
    const periodEnd = new Date(periodStart.getTime() + periodLength * 24 * 60 * 60 * 1000);
    
    return createUserSubscription({
        userId,
        planCode,
        status: 'active',
        billingCycle,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        totalAmount,
        razorpaySubscriptionId
    });
}

/**
 * Update subscription status
 * @param {string} subscriptionId - Subscription ID
 * @param {string} status - New status
 * @returns {Promise<UserSubscription|null>} Updated subscription
 */
async function updateSubscriptionStatus(subscriptionId, status) {
    const query = `
        UPDATE user_subscriptions 
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
    `;

    const result = await pool.query(query, [status, subscriptionId]);
    return result.rows[0] || null;
}

/**
 * Get subscription by Razorpay subscription ID
 * @param {string} razorpaySubscriptionId - Razorpay subscription ID
 * @returns {Promise<UserSubscription|null>} Subscription record
 */
async function getSubscriptionByRazorpayId(razorpaySubscriptionId) {
    const query = `
        SELECT * FROM user_subscriptions 
        WHERE razorpay_subscription_id = $1
    `;

    const result = await pool.query(query, [razorpaySubscriptionId]);
    return result.rows[0] || null;
}

/**
 * Get subscription transaction history for user
 * @param {string} userId - User ID
 * @param {number} [limit=50] - Limit number of results
 * @param {number} [offset=0] - Offset for pagination
 * @returns {Promise<Object[]>} Transaction history
 */
async function getSubscriptionHistory(userId, limit = 50, offset = 0) {
    const query = `
        SELECT 
            st.*,
            us.plan_code,
            us.billing_cycle
        FROM subscription_transactions st
        LEFT JOIN user_subscriptions us ON st.subscription_id = us.id
        WHERE st.user_id = $1
        ORDER BY st.created_at DESC
        LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
}

module.exports = {
    createUserSubscription,
    getUserActiveSubscriptions,
    getUserCurrentSubscription,
    getUserSubscriptionTimeRemaining,
    createDefaultFreeSubscription,
    addSubscriptionPeriod,
    updateSubscriptionStatus,
    getSubscriptionByRazorpayId,
    getSubscriptionHistory
};