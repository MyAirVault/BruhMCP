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
export function getUserPlanSummary(userId: string): Promise<{
    subscription: Object | null;
    currentPlan: import("../data/subscription-plans").SubscriptionPlan;
    isActive: boolean;
    isTrialActive?: boolean;
    activeInstances: number;
    canCreateInstances: boolean;
    message: string;
}>;
/**
 * Handle plan cancellation - deactivate all instances and downgrade to free plan
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result of plan cancellation
 */
export function handlePlanCancellation(userId: string): Promise<Object>;
/**
 * Validate plan transition (e.g., from free to pro)
 * @param {string} currentPlan - Current plan type
 * @param {string} newPlan - New plan type
 * @returns {Promise<Object>} Validation result
 */
export function validatePlanTransition(currentPlan: string, newPlan: string): Promise<Object>;
//# sourceMappingURL=planLimits.d.ts.map