export type UserPlan = import('../../types/billing.d.ts').UserPlan;
export type RazorpayConfig = import('../../types/billing.d.ts').RazorpayConfig;
export type CheckoutSession = import('../../types/billing.d.ts').CheckoutSession;
export type SubscriptionDetails = import('../../types/billing.d.ts').SubscriptionDetails;
export type CancellationResult = import('../../types/billing.d.ts').CancellationResult;
/**
 * @typedef {import('../../types/billing.d.ts').UserPlan} UserPlan
 * @typedef {import('../../types/billing.d.ts').RazorpayConfig} RazorpayConfig
 * @typedef {import('../../types/billing.d.ts').CheckoutSession} CheckoutSession
 * @typedef {import('../../types/billing.d.ts').SubscriptionDetails} SubscriptionDetails
 * @typedef {import('../../types/billing.d.ts').CancellationResult} CancellationResult
 */
/**
 * Create checkout session for Pro plan upgrade
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export function createCheckoutSession(req: import('express').Request, res: import('express').Response): Promise<void>;
/**
 * Handle successful checkout (called from frontend after payment)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export function handleCheckoutSuccess(req: import('express').Request, res: import('express').Response): Promise<void>;
/**
 * Get current billing status for the user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function getBillingStatus(req: import('express').Request, res: import('express').Response): Promise<void>;
/**
 * Cancel current subscription
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function cancelSubscription(req: import('express').Request, res: import('express').Response): Promise<void>;
/**
 * Get payment history from Razorpay
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function getPaymentHistory(req: import('express').Request, res: import('express').Response): Promise<void>;
/**
 * Get detailed subscription information from Razorpay
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export function getDetailedSubscriptionInfo(req: import('express').Request, res: import('express').Response): Promise<void>;
//# sourceMappingURL=checkoutController.d.ts.map