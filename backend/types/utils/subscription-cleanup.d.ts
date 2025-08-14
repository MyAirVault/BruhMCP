export type ExpiredSubscription = {
    /**
     * - Subscription ID (UUID)
     */
    id: string;
    /**
     * - User ID (UUID)
     */
    user_id: string;
    /**
     * - Plan code
     */
    plan_code: string;
    /**
     * - Razorpay subscription ID
     */
    razorpay_subscription_id: string;
    /**
     * - Total amount in paise
     */
    total_amount: number;
    /**
     * - Creation timestamp
     */
    created_at: string;
    /**
     * - Plan name
     */
    plan_name: string;
};
/**
 * Expire unpaid subscriptions that have been in 'created' status for more than 20 minutes
 * @returns {Promise<{expired: number, errors: string[]}>} Cleanup result
 */
export function expireUnpaidSubscriptions(): Promise<{
    expired: number;
    errors: string[];
}>;
/**
 * Clean up old expired and replaced subscriptions to keep database tidy
 * Removes subscriptions that have been expired/replaced for more than 30 days
 * @returns {Promise<{cleaned: number}>} Cleanup result
 */
export function cleanupOldSubscriptions(): Promise<{
    cleaned: number;
}>;
/**
 * Comprehensive subscription cleanup - runs all cleanup tasks
 * @returns {Promise<{expired: number, cleaned: number, errors: string[]}>} Complete cleanup result
 */
export function runSubscriptionCleanup(): Promise<{
    expired: number;
    cleaned: number;
    errors: string[];
}>;
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
export const SUBSCRIPTION_TIMEOUT_MINUTES: 20;
//# sourceMappingURL=subscription-cleanup.d.ts.map