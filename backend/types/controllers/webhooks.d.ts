export type DatabaseSubscription = {
    /**
     * - Subscription ID
     */
    id: number;
    /**
     * - User ID
     */
    user_id: number;
    /**
     * - Subscription status
     */
    status: string;
    /**
     * - Plan code
     */
    plan_code: string;
    /**
     * - Total amount
     */
    total_amount: number;
    /**
     * - Razorpay subscription ID
     */
    razorpay_subscription_id?: string | undefined;
    /**
     * - Failed payment count
     */
    failed_payment_count?: number | undefined;
    /**
     * - Pause count
     */
    pause_count?: number | undefined;
};
/**
 * @typedef {Object} DatabaseSubscription
 * @property {number} id - Subscription ID
 * @property {number} user_id - User ID
 * @property {string} status - Subscription status
 * @property {string} plan_code - Plan code
 * @property {number} total_amount - Total amount
 * @property {string} [razorpay_subscription_id] - Razorpay subscription ID
 * @property {number} [failed_payment_count] - Failed payment count
 * @property {number} [pause_count] - Pause count
 */
/**
 * Verify Razorpay webhook signature for security
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
export function verifyRazorpayWebhook(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): Promise<void>;
/**
 * Main webhook event handler
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
export function handleRazorpayWebhook(req: import("express").Request, res: import("express").Response): Promise<void>;
/**
 * Handle subscription.authenticated event
 * @param {Object} payload - Webhook payload
 * @returns {Promise<Object>} Processing result
 */
export function handleSubscriptionAuthenticated(payload: Object): Promise<Object>;
/**
 * Handle subscription.activated event
 * @param {Object} payload - Webhook payload
 * @returns {Promise<Object>} Processing result
 */
export function handleSubscriptionActivated(payload: Object): Promise<Object>;
/**
 * Handle subscription.cancelled event
 * @param {Object} payload - Webhook payload
 * @returns {Promise<Object>} Processing result
 */
export function handleSubscriptionCancelled(payload: Object): Promise<Object>;
/**
 * Handle payment.failed event
 * @param {Object} payload - Webhook payload
 * @returns {Promise<Object>} Processing result
 */
export function handlePaymentFailed(payload: Object): Promise<Object>;
//# sourceMappingURL=webhooks.d.ts.map