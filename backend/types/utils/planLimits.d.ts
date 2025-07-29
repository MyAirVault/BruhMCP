/**
 * Plan limits configuration
 */
export type PlanConfig = {
    /**
     * - Maximum active instances (null = unlimited)
     */
    max_instances: number | null;
    /**
     * - Plan features
     */
    features: string[];
};
/**
 * Check if payments are disabled in local development
 * @returns {boolean} True if payments are disabled
 */
export function isPaymentsDisabled(): boolean;
/**
 * Plan limits configuration
 * @typedef {Object} PlanConfig
 * @property {number|null} max_instances - Maximum active instances (null = unlimited)
 * @property {string[]} features - Plan features
 */
/**
 * @type {Record<string, PlanConfig>}
 */
export const PLAN_LIMITS: Record<string, PlanConfig>;
/**
 * Get instance limit for a plan type
 * @param {string} planType - Plan type ('free' or 'pro')
 * @returns {number|null} Max instances (null = unlimited)
 */
export function getInstanceLimitForPlan(planType: string): number | null;
/**
 * Check if a plan has unlimited instances
 * @param {string} planType - Plan type ('free' or 'pro')
 * @returns {boolean} True if plan has unlimited instances
 */
export function isPlanUnlimited(planType: string): boolean;
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
 * Get user's plan summary with active instance usage
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Plan summary object
 */
export function getUserPlanSummary(userId: string): Promise<Object>;
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
 * @returns {Object} Validation result
 */
export function validatePlanTransition(currentPlan: string, newPlan: string): Object;
//# sourceMappingURL=planLimits.d.ts.map