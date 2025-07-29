export type RazorpayConfig = {
    valid: boolean;
    missingVars?: string[] | undefined;
    message: string;
};
export type CheckoutSession = {
    subscriptionId: string;
    amount: number;
    currency: string;
    customerId: string;
    planId: string;
    razorpayKeyId: string;
    customerEmail: string;
    customerName: string;
};
export type CancellationResult = {
    success: boolean;
    subscriptionId: string;
    status: string;
    cancelledAt: string;
};
export type SubscriptionDetails = {
    id: string;
    customerId: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    planId: string;
    cancelAtPeriodEnd: boolean;
};
/**
 * @typedef {Object} RazorpayConfig
 * @property {boolean} valid
 * @property {string[]} [missingVars]
 * @property {string} message
 */
/**
 * @typedef {Object} CheckoutSession
 * @property {string} subscriptionId
 * @property {number} amount
 * @property {string} currency
 * @property {string} customerId
 * @property {string} planId
 * @property {string} razorpayKeyId
 * @property {string} customerEmail
 * @property {string} customerName
 */
/**
 * @typedef {Object} CancellationResult
 * @property {boolean} success
 * @property {string} subscriptionId
 * @property {string} status
 * @property {string} cancelledAt
 */
/**
 * @typedef {Object} SubscriptionDetails
 * @property {string} id
 * @property {string} customerId
 * @property {string} status
 * @property {string} currentPeriodStart
 * @property {string} currentPeriodEnd
 * @property {string} planId
 * @property {boolean} cancelAtPeriodEnd
 */
/** @type {any} */
export let razorpay: any;
/**
 * Validate Razorpay configuration
 * @returns {RazorpayConfig} Validation result
 */
export function validateRazorpayConfig(): RazorpayConfig;
/**
 * Create a Razorpay subscription for Pro plan
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} successUrl - URL to redirect after successful payment
 * @param {string} cancelUrl - URL to redirect if user cancels
 * @returns {Promise<CheckoutSession>} Subscription and payment link details
 */
export function createProSubscriptionCheckout(userId: string, email: string, successUrl: string, cancelUrl: string): Promise<CheckoutSession>;
/**
 * Cancel a Razorpay subscription
 * @param {string} subscriptionId - Razorpay subscription ID
 * @returns {Promise<CancellationResult>} Cancellation result
 */
export function cancelSubscription(subscriptionId: string): Promise<CancellationResult>;
/**
 * Retrieve subscription details from Razorpay
 * @param {string} subscriptionId - Razorpay subscription ID
 * @returns {Promise<SubscriptionDetails>} Subscription details
 */
export function getSubscriptionDetails(subscriptionId: string): Promise<SubscriptionDetails>;
/**
 * Verify webhook signature from Razorpay
 * @param {string} payload - Raw request body
 * @param {string} signature - Razorpay signature header
 * @returns {boolean} Signature verification result
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean;
/**
 * Parse Razorpay webhook event
 * @param {string} payload - Raw webhook payload
 * @param {string} signature - Webhook signature
 * @returns {Object} Parsed webhook event
 */
export function parseWebhookEvent(payload: string, signature: string): Object;
/**
 * Get customer by email
 * @param {string} email - Customer email
 * @returns {Promise<Object|null>} Customer details or null
 */
export function getCustomerByEmail(email: string): Promise<Object | null>;
//# sourceMappingURL=paymentGateway.d.ts.map