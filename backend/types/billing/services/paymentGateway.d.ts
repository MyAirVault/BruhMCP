/**
 * Validate Razorpay configuration
 * @returns {import('../../types/billing.d.ts').RazorpayConfig} Validation result
 */
export function validateRazorpayConfig(): import("../../types/billing.d.ts").RazorpayConfig;
/**
 * Create a Razorpay subscription for Pro plan
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} successUrl - URL to redirect after successful payment
 * @param {string} cancelUrl - URL to redirect if user cancels
 * @returns {Promise<import('../../types/billing.d.ts').CheckoutSession>} Subscription and payment link details
 */
export function createProSubscriptionCheckout(userId: string, email: string, successUrl: string, cancelUrl: string): Promise<import("../../types/billing.d.ts").CheckoutSession>;
/**
 * Cancel a Razorpay subscription
 * @param {string} subscriptionId - Razorpay subscription ID
 * @returns {Promise<import('../../types/billing.d.ts').CancellationResult>} Cancellation result
 */
export function cancelSubscription(subscriptionId: string): Promise<import("../../types/billing.d.ts").CancellationResult>;
/**
 * Retrieve subscription details from Razorpay
 * @param {string} subscriptionId - Razorpay subscription ID
 * @returns {Promise<import('../../types/billing.d.ts').SubscriptionDetails>} Subscription details
 */
export function getSubscriptionDetails(subscriptionId: string): Promise<import("../../types/billing.d.ts").SubscriptionDetails>;
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
export let razorpay: any;
//# sourceMappingURL=paymentGateway.d.ts.map