/**
 * Check if payments are disabled in local development
 * @returns {boolean} True if payments are disabled
 */
export function isPaymentsDisabled(): boolean;
/**
 * Get user's current subscription from user_subscriptions table
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User subscription object or null if not found
 */
export function getUserSubscription(userId: string): Promise<Object | null>;
/**
 * Check if user's subscription is active
 * @param {Object} subscription - Subscription object from database
 * @returns {boolean} True if subscription is active
 */
export function isSubscriptionActive(subscription: Object): boolean;
/**
 * Get instance limit for a plan type
 * @param {string} planCode - Plan code ('free' or 'pro')
 * @returns {number|null} Max instances (null = unlimited)
 */
export function getInstanceLimitForPlan(planCode: string): number | null;
/**
 * Check if a plan has unlimited instances
 * @param {string} planCode - Plan code ('free' or 'pro')
 * @returns {boolean} True if plan has unlimited instances
 */
export function isPlanUnlimited(planCode: string): boolean;
/**
 * Check if user can create a new MCP instance (based on active instances)
 * @param {string} userId - User ID
 * @returns {Promise<{canCreate: boolean, message: string, maxInstances?: number|null, activeInstances?: number, reason?: string, details?: any}>} Result object with canCreate flag and details
 */
export function checkInstanceLimit(userId: string): Promise<{
    canCreate: boolean;
    message: string;
    maxInstances?: number | null;
    activeInstances?: number;
    reason?: string;
    details?: any;
}>;
/**
 * Get user's subscription summary with active instance usage
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Subscription summary object
 */
export function getUserSubscriptionSummary(userId: string): Promise<Object>;
/**
 * Handle subscription cancellation - update status in user_subscriptions
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result of subscription cancellation
 */
export function handleSubscriptionCancellation(userId: string): Promise<Object>;
/**
 * Validate plan transition (e.g., from free to pro)
 * @param {string} currentPlan - Current plan code
 * @param {string} newPlan - New plan code
 * @returns {Object} Validation result
 */
export function validatePlanTransition(currentPlan: string, newPlan: string): Object;
/**
 * Create default free subscription for new users
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Created subscription object
 */
export function createFreeSubscription(userId: string): Promise<Object>;
//# sourceMappingURL=subscriptionLimits.d.ts.map