/**
 * Get user's current plan
 * @param {string} userId - User ID
 * @returns {Promise<import('../../types/billing.d.ts').UserPlan|null>} User plan object or null if not found
 */
export function getUserPlan(userId: string): Promise<import("../../types/billing.d.ts").UserPlan | null>;
/**
 * Update user's plan
 * @param {string} userId - User ID
 * @param {string} planType - Plan type ('free' or 'pro')
 * @param {Object} options - Additional options
 * @param {Date|null} options.expiresAt - Plan expiration date
 * @param {Object} options.features - Plan features
 * @returns {Promise<import('../../types/billing.d.ts').UserPlan>} Updated plan object
 */
export function updateUserPlan(userId: string, planType: string, options?: {
    expiresAt: Date | null;
    features: Object;
}): Promise<import("../../types/billing.d.ts").UserPlan>;
/**
 * Create user plan (used for new users if auto-trigger fails)
 * @param {string} userId - User ID
 * @param {string} planType - Plan type ('free' or 'pro')
 * @param {Object} options - Additional options
 * @param {Date|null} options.expiresAt - Plan expiration date
 * @param {Object} options.features - Plan features
 * @returns {Promise<import('../../types/billing.d.ts').UserPlan>} Created plan object
 */
export function createUserPlan(userId: string, planType?: string, options?: {
    expiresAt: Date | null;
    features: Object;
}): Promise<import("../../types/billing.d.ts").UserPlan>;
/**
 * Check if user's plan is active (not expired)
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if plan is active
 */
export function isUserPlanActive(userId: string): Promise<boolean>;
/**
 * Get all users with a specific plan type
 * @param {string} planType - Plan type ('free' or 'pro')
 * @param {Object} options - Query options
 * @param {number} options.limit - Limit results
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<Array>} Array of users with the specified plan
 */
export function getUsersByPlanType(planType: string, options?: {
    limit: number;
    offset: number;
}): Promise<any[]>;
/**
 * Get plan statistics
 * @returns {Promise<Object>} Plan statistics
 */
export function getPlanStatistics(): Promise<Object>;
/**
 * Update billing-specific fields for a user plan
 * @param {string} userId - User ID
 * @param {Object} billingData - Billing data to update
 * @param {string} billingData.subscriptionId - Subscription ID
 * @param {string} billingData.customerId - Razorpay customer ID
 * @param {string} billingData.paymentStatus - Payment status
 * @returns {Promise<import('../../types/billing.d.ts').UserPlan>} Updated plan object
 */
export function updateUserPlanBilling(userId: string, billingData: {
    subscriptionId: string;
    customerId: string;
    paymentStatus: string;
}): Promise<import("../../types/billing.d.ts").UserPlan>;
/**
 * Get user plan by subscription ID
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<import('../../types/billing.d.ts').UserPlan|null>} User plan object or null if not found
 */
export function getUserPlanBySubscriptionId(subscriptionId: string): Promise<import("../../types/billing.d.ts").UserPlan | null>;
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
 * @param {string} customerId - Razorpay customer ID
 * @returns {Promise<Object>} Result object with status and plan data
 */
export function atomicActivateProSubscription(userId: string, subscriptionId: string, expiresAt: Date, customerId?: string): Promise<Object>;
//# sourceMappingURL=userPlansQueries.d.ts.map