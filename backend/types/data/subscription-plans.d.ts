export type PlanLimits = Object & Record<string, number>;
export type SubscriptionPlan = {
    /**
     * - Plan code identifier
     */
    plan_code: string;
    /**
     * - Plan display name
     */
    name: string;
    /**
     * - Plan description
     */
    description: string;
    /**
     * - Plan tagline
     */
    tagline: string;
    /**
     * - Monthly price in paise
     */
    price_monthly: number;
    /**
     * - Yearly price in paise
     */
    price_yearly: number;
    /**
     * - Price currency
     */
    price_currency: string;
    /**
     * - List of features
     */
    features: string[];
    /**
     * - Plan limits
     */
    limits: PlanLimits;
    /**
     * - Trial period in days
     */
    trial_days: number;
    /**
     * - Whether plan is active
     */
    is_active: boolean;
    /**
     * - Whether plan is featured
     */
    is_featured: boolean;
    /**
     * - Display order
     */
    display_order: number;
    /**
     * - Monthly Razorpay plan ID
     */
    razorpay_plan_id_monthly: string | null;
    /**
     * - Yearly Razorpay plan ID
     */
    razorpay_plan_id_yearly: string | null;
};
/**
 * Subscription Plans Configuration
 * Single source of truth for all subscription plan data
 * Adapted for MCP instance limits instead of generic projects
 *
 * @fileoverview Comprehensive subscription plans configuration with features, limits, and pricing
 */
/**
 * @typedef {Object & Record<string, number>} PlanLimits
 * @property {number} instances - Maximum instances allowed
 * @property {number} api_calls - Maximum API calls allowed
 * @property {number} storage_gb - Maximum storage in GB
 * @property {number} users - Maximum users allowed
 * @property {number} integrations - Maximum integrations allowed
 */
/**
 * @typedef {Object} SubscriptionPlan
 * @property {string} plan_code - Plan code identifier
 * @property {string} name - Plan display name
 * @property {string} description - Plan description
 * @property {string} tagline - Plan tagline
 * @property {number} price_monthly - Monthly price in paise
 * @property {number} price_yearly - Yearly price in paise
 * @property {string} price_currency - Price currency
 * @property {string[]} features - List of features
 * @property {PlanLimits} limits - Plan limits
 * @property {number} trial_days - Trial period in days
 * @property {boolean} is_active - Whether plan is active
 * @property {boolean} is_featured - Whether plan is featured
 * @property {number} display_order - Display order
 * @property {string|null} razorpay_plan_id_monthly - Monthly Razorpay plan ID
 * @property {string|null} razorpay_plan_id_yearly - Yearly Razorpay plan ID
 */
/**
 * Complete subscription plans configuration
 * @type {Record<string, SubscriptionPlan>}
 */
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan>;
/**
 * Get all active subscription plans
 * @returns {Array<SubscriptionPlan>} Array of active plans sorted by display order
 */
export function getActivePlans(): Array<SubscriptionPlan>;
/**
 * Get subscription plan by plan code
 * @param {string} planCode - Plan code (free, pro)
 * @returns {SubscriptionPlan|null} Plan object or null if not found
 * @throws {Error} If plan code is invalid
 */
export function getPlanByCode(planCode: string): SubscriptionPlan | null;
/**
 * Get all subscription plans
 * @returns {Array<Object>} Array of all plans sorted by display order
 */
export function getAllPlans(): Array<Object>;
/**
 * Get Razorpay plan ID for a specific plan and billing cycle
 * @param {string} planCode - Plan code (free, pro)
 * @param {string} billingCycle - Billing cycle (monthly, yearly)
 * @returns {string|null} Razorpay plan ID or null if not found
 * @throws {Error} If plan code or billing cycle is invalid
 */
export function getRazorpayPlanId(planCode: string, billingCycle: string): string | null;
/**
 * Get plan pricing for display
 * @param {string} planCode - Plan code (free, pro)
 * @param {string} billingCycle - Billing cycle (monthly, yearly)
 * @returns {Object} Pricing information with formatted amounts
 * @throws {Error} If plan code or billing cycle is invalid
 */
export function getPlanPricing(planCode: string, billingCycle: string): Object;
/**
 * Check if a plan has a specific feature
 * @param {string} planCode - Plan code (free, pro)
 * @param {string} featureName - Feature name to check
 * @returns {boolean} True if plan has the feature
 * @throws {Error} If plan code is invalid
 */
export function planHasFeature(planCode: string, featureName: string): boolean;
/**
 * Get plan limits for a specific resource
 * @param {string} planCode - Plan code (free, pro)
 * @param {string} resource - Resource name (instances, api_calls, storage_gb, users, etc.)
 * @returns {number} Limit value (-1 for unlimited, 0 for none)
 * @throws {Error} If plan code is invalid
 */
export function getPlanLimit(planCode: string, resource: string): number;
/**
 * Check if a plan is unlimited for a specific resource
 * @param {string} planCode - Plan code (free, pro)
 * @param {string} resource - Resource name
 * @returns {boolean} True if unlimited (-1)
 */
export function isPlanUnlimited(planCode: string, resource: string): boolean;
//# sourceMappingURL=subscription-plans.d.ts.map