export type UserPlan = {
    /**
     * - Plan ID
     */
    plan_id: string;
    /**
     * - User ID
     */
    user_id: string;
    /**
     * - Plan type (free/pro)
     */
    plan_type: "free" | "pro";
    /**
     * - Maximum instances allowed
     */
    max_instances: number | null;
    /**
     * - Plan features
     */
    features: Object;
    /**
     * - Plan expiration date
     */
    expires_at: string | null;
    /**
     * - Payment subscription ID
     */
    subscription_id: string | null;
    /**
     * - Payment customer ID
     */
    customer_id: string | null;
    /**
     * - Payment status
     */
    payment_status: "active" | "inactive" | "cancelled" | "processing" | null;
    /**
     * - Creation timestamp
     */
    created_at: string;
    /**
     * - Last update timestamp
     */
    updated_at: string;
};
export type PlanOptions = {
    /**
     * - Plan expiration date
     */
    expiresAt?: Date | null | undefined;
    /**
     * - Plan features
     */
    features?: Object | undefined;
};
export type QueryOptions = {
    /**
     * - Limit results
     */
    limit?: number | undefined;
    /**
     * - Offset for pagination
     */
    offset?: number | undefined;
};
export type PlanStatistics = {
    /**
     * - Total users count
     */
    total_users: number;
    /**
     * - Stats by plan type
     */
    by_plan: {
        [x: string]: {
            total: number;
            active: number;
            expired: number;
        };
    };
};
/**
 * @typedef {Object} UserPlan
 * @property {string} plan_id - Plan ID
 * @property {string} user_id - User ID
 * @property {'free'|'pro'} plan_type - Plan type (free/pro)
 * @property {number|null} max_instances - Maximum instances allowed
 * @property {Object} features - Plan features
 * @property {string|null} expires_at - Plan expiration date
 * @property {string|null} subscription_id - Payment subscription ID
 * @property {string|null} customer_id - Payment customer ID
 * @property {'active'|'inactive'|'cancelled'|'processing'|null} payment_status - Payment status
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */
/**
 * @typedef {Object} PlanOptions
 * @property {Date|null} [expiresAt] - Plan expiration date
 * @property {Object} [features] - Plan features
 */
/**
 * @typedef {Object} QueryOptions
 * @property {number} [limit] - Limit results
 * @property {number} [offset] - Offset for pagination
 */
/**
 * @typedef {Object} PlanStatistics
 * @property {number} total_users - Total users count
 * @property {Object.<string, {total: number, active: number, expired: number}>} by_plan - Stats by plan type
 */
/**
 * Get user's current plan
 * @param {string} userId - User ID
 * @returns {Promise<UserPlan|null>} User plan object or null if not found
 */
export function getUserPlan(userId: string): Promise<UserPlan | null>;
/**
 * Update user's plan
 * @param {string} userId - User ID
 * @param {string} planType - Plan type ('free' or 'pro')
 * @param {PlanOptions} [options] - Additional options
 * @returns {Promise<UserPlan>} Updated plan object
 */
export function updateUserPlan(userId: string, planType: string, options?: PlanOptions): Promise<UserPlan>;
/**
 * Create user plan (used for new users if auto-trigger fails)
 * @param {string} userId - User ID
 * @param {string} [planType] - Plan type ('free' or 'pro')
 * @param {PlanOptions} [options] - Additional options
 * @returns {Promise<UserPlan>} Created plan object
 */
export function createUserPlan(userId: string, planType?: string, options?: PlanOptions): Promise<UserPlan>;
/**
 * Check if user's plan is active (not expired)
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if plan is active
 */
export function isUserPlanActive(userId: string): Promise<boolean>;
/**
 * Get all users with a specific plan type
 * @param {string} planType - Plan type ('free' or 'pro')
 * @param {QueryOptions} [options] - Query options
 * @returns {Promise<UserPlan[]>} Array of users with the specified plan
 */
export function getUsersByPlanType(planType: string, options?: QueryOptions): Promise<UserPlan[]>;
/**
 * Get plan statistics
 * @returns {Promise<PlanStatistics>} Plan statistics
 */
export function getPlanStatistics(): Promise<PlanStatistics>;
/**
 * Update billing-specific fields for a user plan
 * @param {string} userId - User ID
 * @param {Object} billingData - Billing data to update
 * @param {string} billingData.subscriptionId - Subscription ID
 * @param {string} billingData.customerId - Razorpay customer ID
 * @param {string} billingData.paymentStatus - Payment status
 * @returns {Promise<UserPlan>} Updated plan object
 */
export function updateUserPlanBilling(userId: string, billingData: {
    subscriptionId: string;
    customerId: string;
    paymentStatus: string;
}): Promise<UserPlan>;
/**
 * Get user plan by subscription ID
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<UserPlan|null>} User plan object or null if not found
 */
export function getUserPlanBySubscriptionId(subscriptionId: string): Promise<UserPlan | null>;
/**
 * Deactivate all active instances for a user (used when Pro plan is cancelled)
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of instances deactivated
 */
export function deactivateAllUserInstances(userId: string): Promise<number>;
/**
 * Atomically activate Pro subscription (prevents race conditions between webhook and frontend)
 * @param {string} userId - User ID
 * @param {string} subscriptionId - Razorpay subscription ID
 * @param {Date} expiresAt - Subscription expiration date
 * @param {string|null} [customerId] - Razorpay customer ID
 * @returns {Promise<Object>} Result object with status and plan data
 */
export function atomicActivateProSubscription(userId: string, subscriptionId: string, expiresAt: Date, customerId?: string | null): Promise<Object>;
//# sourceMappingURL=userPlansQueries.d.ts.map