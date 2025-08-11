/**
 * Create a Razorpay subscription plan for recurring billing
 * @param {Object} planData - Plan creation data
 * @param {string} planData.period - Billing period (weekly, monthly, yearly)
 * @param {number} planData.interval - Billing interval (1 for every period)
 * @param {Object} planData.item - Plan item details
 * @param {string} planData.item.name - Plan name
 * @param {string} planData.item.description - Plan description
 * @param {number} planData.item.amount - Plan amount in paise
 * @param {string} planData.item.currency - Currency code (default: INR)
 * @param {Object} [planData.notes] - Additional notes
 * @returns {Promise<Object>} Razorpay plan object
 * @throws {Error} If plan creation fails
 */
export function createRazorpayPlan(planData: {
    period: string;
    interval: number;
    item: {
        name: string;
        description: string;
        amount: number;
        currency: string;
    };
    notes?: Object | undefined;
}): Promise<Object>;
/**
 * Create a Razorpay subscription for recurring billing
 * @param {Object} subscriptionData - Subscription creation data
 * @returns {Promise<Object>} Razorpay subscription object
 * @throws {Error} If subscription creation fails
 */
export function createRazorpaySubscription(subscriptionData: Object): Promise<Object>;
/**
 * Update a Razorpay subscription
 * @param {string} subscriptionId - Subscription ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated subscription
 */
export function updateRazorpaySubscription(subscriptionId: string, updateData: Object): Promise<Object>;
/**
 * Cancel a Razorpay subscription
 * @param {string} subscriptionId - Subscription ID
 * @param {Object} cancelData - Cancellation data
 * @returns {Promise<Object>} Cancelled subscription
 */
export function cancelRazorpaySubscription(subscriptionId: string, cancelData: Object): Promise<Object>;
/**
 * Fetch Razorpay subscription details
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<Object>} Subscription details
 */
export function fetchRazorpaySubscription(subscriptionId: string): Promise<Object>;
/**
 * Verify subscription payment signature from webhook
 * @param {Object} webhookData - Webhook data
 * @returns {boolean} Verification result
 */
export function verifySubscriptionPaymentSignature(webhookData: Object): boolean;
/**
 * Pause a Razorpay subscription
 * @param {string} subscriptionId - Subscription ID
 * @param {Object} pauseData - Pause data
 * @returns {Promise<Object>} Paused subscription
 */
export function pauseRazorpaySubscription(subscriptionId: string, pauseData?: Object): Promise<Object>;
/**
 * Resume a Razorpay subscription
 * @param {string} subscriptionId - Subscription ID
 * @param {Object} resumeData - Resume data
 * @returns {Promise<Object>} Resumed subscription
 */
export function resumeRazorpaySubscription(subscriptionId: string, resumeData?: Object): Promise<Object>;
//# sourceMappingURL=subscriptions.d.ts.map