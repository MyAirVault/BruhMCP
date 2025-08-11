export type UserSubscription = {
    /**
     * - Subscription ID
     */
    id: string;
    /**
     * - User ID
     */
    user_id: string;
    /**
     * - Plan code (free, pro)
     */
    plan_code: string;
    /**
     * - Subscription status
     */
    status: string;
    /**
     * - Billing cycle (monthly, yearly)
     */
    billing_cycle: string;
    /**
     * - Current period start
     */
    current_period_start: Date;
    /**
     * - Current period end
     */
    current_period_end: Date;
    /**
     * - Total amount in paise
     */
    total_amount: number;
    /**
     * - Razorpay subscription ID
     */
    razorpay_subscription_id: string | null;
    /**
     * - Creation timestamp
     */
    created_at: Date;
    /**
     * - Last update timestamp
     */
    updated_at: Date;
};
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
export function createUserSubscription(subscriptionData: {
    userId: string;
    planCode: string;
    status: string;
    billingCycle: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    totalAmount: number;
    razorpaySubscriptionId?: string | undefined;
}): Promise<UserSubscription>;
/**
 * Get user's active subscriptions ordered by end date
 * @param {string} userId - User ID
 * @returns {Promise<UserSubscription[]>} Active subscriptions
 */
export function getUserActiveSubscriptions(userId: string): Promise<UserSubscription[]>;
/**
 * Get user's current active subscription with highest tier plan
 * If multiple plans are active, returns the highest tier one
 * @param {string} userId - User ID
 * @returns {Promise<UserSubscription|null>} Current subscription
 */
export function getUserCurrentSubscription(userId: string): Promise<UserSubscription | null>;
/**
 * Get user's total subscription time remaining in days
 * Calculates stacked subscription periods
 * @param {string} userId - User ID
 * @param {string} [planCode] - Optional plan code filter
 * @returns {Promise<number>} Total days remaining across all active subscriptions
 */
export function getUserSubscriptionTimeRemaining(userId: string, planCode?: string): Promise<number>;
/**
 * Create default free subscription for new user
 * @param {string} userId - User ID
 * @returns {Promise<UserSubscription>} Created free subscription
 */
export function createDefaultFreeSubscription(userId: string): Promise<UserSubscription>;
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
export function addSubscriptionPeriod(subscriptionData: {
    userId: string;
    planCode: string;
    billingCycle: string;
    totalAmount: number;
    razorpaySubscriptionId?: string | undefined;
}): Promise<UserSubscription>;
/**
 * Update subscription status
 * @param {string} subscriptionId - Subscription ID
 * @param {string} status - New status
 * @returns {Promise<UserSubscription|null>} Updated subscription
 */
export function updateSubscriptionStatus(subscriptionId: string, status: string): Promise<UserSubscription | null>;
/**
 * Get subscription by Razorpay subscription ID
 * @param {string} razorpaySubscriptionId - Razorpay subscription ID
 * @returns {Promise<UserSubscription|null>} Subscription record
 */
export function getSubscriptionByRazorpayId(razorpaySubscriptionId: string): Promise<UserSubscription | null>;
/**
 * Get subscription transaction history for user
 * @param {string} userId - User ID
 * @param {number} [limit=50] - Limit number of results
 * @param {number} [offset=0] - Offset for pagination
 * @returns {Promise<Object[]>} Transaction history
 */
export function getSubscriptionHistory(userId: string, limit?: number, offset?: number): Promise<Object[]>;
//# sourceMappingURL=subscriptionQueries.d.ts.map