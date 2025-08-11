/**
 * Razorpay subscription plans configuration
 * Maps internal plan IDs to Razorpay plan IDs for both monthly and yearly billing
 *
 * @fileoverview Razorpay plans configuration for subscription management
 */
/**
 * Complete subscription plan configuration
 * Contains all plan details including pricing, features, and Razorpay plan mappings
 *
 * @type {Record<string, {
 *   name: string,
 *   description: string,
 *   tagline: string,
 *   price_monthly: number,
 *   price_yearly: number,
 *   price_currency: string,
 *   features: string[],
 *   limits: Record<string, any>,
 *   trial_days: number,
 *   is_active: boolean,
 *   is_featured: boolean,
 *   display_order: number,
 *   razorpay_plan_ids: {monthly?: string, yearly?: string}
 * }>}
 */
export const SUBSCRIPTION_PLANS: Record<string, {
    name: string;
    description: string;
    tagline: string;
    price_monthly: number;
    price_yearly: number;
    price_currency: string;
    features: string[];
    limits: Record<string, any>;
    trial_days: number;
    is_active: boolean;
    is_featured: boolean;
    display_order: number;
    razorpay_plan_ids: {
        monthly?: string;
        yearly?: string;
    };
}>;
/**
 * Get Razorpay plan ID for a specific internal plan and billing cycle
 * @param {string} planCode - Internal plan code (free, pro, plus)
 * @param {string} billingCycle - Billing cycle (monthly, yearly)
 * @returns {string|null} Razorpay plan ID or null if not found
 * @throws {Error} If plan code or billing cycle is invalid
 */
export function getRazorpayPlanId(planCode: string, billingCycle: string): string | null;
/**
 * Get all active subscription plans for API responses
 * @returns {Array<Object>} Array of active plan configurations
 */
export function getAllActivePlans(): Array<Object>;
/**
 * Get all plan configurations (including internal data)
 * @returns {Record<string, Object>} All plan configurations
 */
export function getAllPlanConfigurations(): Record<string, Object>;
/**
 * Check if a plan code is valid
 * @param {string} planCode - Plan code to validate
 * @returns {boolean} True if plan code is valid
 */
export function isValidPlanCode(planCode: string): boolean;
/**
 * Check if billing cycle is valid
 * @param {string} billingCycle - Billing cycle to validate
 * @returns {boolean} True if billing cycle is valid
 */
export function isValidBillingCycle(billingCycle: string): boolean;
/**
 * Get plan configuration by plan code
 * @param {string} planCode - Internal plan code
 * @returns {Object|null} Plan configuration or null if not found
 */
export function getPlanConfiguration(planCode: string): Object | null;
/**
 * Update Razorpay plan ID for a specific plan and billing cycle
 * This function should be used when setting up plans in Razorpay
 * @param {string} planCode - Internal plan code
 * @param {string} billingCycle - Billing cycle (monthly, yearly)
 * @param {string} razorpayPlanId - Razorpay plan ID to set
 * @returns {void}
 * @throws {Error} If plan code, billing cycle, or plan ID is invalid
 */
export function updateRazorpayPlanId(planCode: string, billingCycle: string, razorpayPlanId: string): void;
//# sourceMappingURL=razorpay-plans.d.ts.map