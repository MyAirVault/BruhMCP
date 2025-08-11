export type RazorpaySubscription = {
    /**
     * - Razorpay subscription ID
     */
    id: string;
    /**
     * - Subscription status
     */
    status: string;
    /**
     * - Current period start timestamp
     */
    current_start: number;
    /**
     * - Current period end timestamp
     */
    current_end: number;
};
export type RazorpayPayment = {
    /**
     * - Payment ID
     */
    id: string;
    /**
     * - Payment status
     */
    status: string;
    /**
     * - Payment amount
     */
    amount: number;
    /**
     * - Payment method
     */
    method: string;
    /**
     * - Associated subscription ID
     */
    subscription_id: string;
};
export type SubscriptionWebhookPayload = {
    /**
     * - Subscription data
     */
    subscription: RazorpaySubscription;
};
export type PaymentWebhookPayload = {
    /**
     * - Payment data
     */
    payment: RazorpayPayment;
};
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
 * @typedef {Object} RazorpaySubscription
 * @property {string} id - Razorpay subscription ID
 * @property {string} status - Subscription status
 * @property {number} current_start - Current period start timestamp
 * @property {number} current_end - Current period end timestamp
 */
/**
 * @typedef {Object} RazorpayPayment
 * @property {string} id - Payment ID
 * @property {string} status - Payment status
 * @property {number} amount - Payment amount
 * @property {string} method - Payment method
 * @property {string} subscription_id - Associated subscription ID
 */
/**
 * @typedef {Object} SubscriptionWebhookPayload
 * @property {RazorpaySubscription} subscription - Subscription data
 */
/**
 * @typedef {Object} PaymentWebhookPayload
 * @property {RazorpayPayment} payment - Payment data
 */
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
 * @param {SubscriptionWebhookPayload} payload - Webhook payload
 * @returns {Promise<Object>} Processing result
 */
export function handleSubscriptionAuthenticated(payload: SubscriptionWebhookPayload): Promise<Object>;
/**
 * Handle subscription.activated event
 * @param {SubscriptionWebhookPayload} payload - Webhook payload
 * @returns {Promise<Object>} Processing result
 */
export function handleSubscriptionActivated(payload: SubscriptionWebhookPayload): Promise<Object>;
/**
 * Handle subscription.cancelled event
 * @param {SubscriptionWebhookPayload} payload - Webhook payload
 * @returns {Promise<Object>} Processing result
 */
export function handleSubscriptionCancelled(payload: SubscriptionWebhookPayload): Promise<Object>;
/**
 * Handle payment.failed event
 * @param {PaymentWebhookPayload} payload - Webhook payload
 * @returns {Promise<Object>} Processing result
 */
export function handlePaymentFailed(payload: PaymentWebhookPayload): Promise<Object>;
//# sourceMappingURL=webhooks.d.ts.map