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
 * @param {string} subscriptionData.plan_id - Razorpay plan ID
 * @param {string} [subscriptionData.customer_id] - Razorpay customer ID
 * @param {number} [subscriptionData.total_count] - Total billing cycles (12 for yearly, omit for unlimited)
 * @param {number} [subscriptionData.quantity] - Quantity of plan (default: 1)
 * @param {number} [subscriptionData.customer_notify] - Notify customer (default: 1)
 * @param {Date} [subscriptionData.start_at] - Subscription start date
 * @param {Object} [subscriptionData.addons] - Additional charges
 * @param {Object} [subscriptionData.notes] - Additional notes
 * @returns {Promise<Object>} Razorpay subscription object
 * @throws {Error} If subscription creation fails
 */
export function createRazorpaySubscription(subscriptionData: {
    plan_id: string;
    customer_id?: string | undefined;
    total_count?: number | undefined;
    quantity?: number | undefined;
    customer_notify?: number | undefined;
    start_at?: Date | undefined;
    addons?: Object | undefined;
    notes?: Object | undefined;
}): Promise<Object>;
/**
 * Update a Razorpay subscription (plan changes, quantity, etc.)
 * @param {string} subscriptionId - Razorpay subscription ID
 * @param {Object} updateData - Subscription update data
 * @param {string} [updateData.plan_id] - New plan ID for upgrades/downgrades
 * @param {number} [updateData.quantity] - New quantity
 * @param {string} [updateData.schedule_change_at] - When to apply changes ('now' or 'cycle_end')
 * @param {Object} [updateData.addons] - Additional charges
 * @param {boolean} [updateData.prorate] - (Ignored) Razorpay handles proration automatically
 * @param {Object} [updateData.notes] - (Ignored) Notes not supported in update API
 * @returns {Promise<Object>} Updated Razorpay subscription object
 * @throws {Error} If subscription update fails
 */
export function updateRazorpaySubscription(subscriptionId: string, updateData: {
    plan_id?: string | undefined;
    quantity?: number | undefined;
    schedule_change_at?: string | undefined;
    addons?: Object | undefined;
    prorate?: boolean | undefined;
    notes?: Object | undefined;
}): Promise<Object>;
/**
 * Cancel a Razorpay subscription
 * @param {string} subscriptionId - Razorpay subscription ID
 * @param {Object} [cancelData] - Cancellation data
 * @param {boolean} [cancelData.cancel_at_cycle_end] - Cancel at end of current cycle (default: false)
 * @returns {Promise<Object>} Cancelled Razorpay subscription object
 * @throws {Error} If subscription cancellation fails
 * @note The cancel API only supports cancel_at_cycle_end parameter. Notes are not supported.
 */
export function cancelRazorpaySubscription(subscriptionId: string, cancelData?: {
    cancel_at_cycle_end?: boolean | undefined;
}): Promise<Object>;
/**
 * Fetch Razorpay subscription details
 * @param {string} subscriptionId - Razorpay subscription ID
 * @returns {Promise<Object>} Razorpay subscription details
 * @throws {Error} If subscription fetch fails
 */
export function fetchRazorpaySubscription(subscriptionId: string): Promise<Object>;
/**
 * Verify Razorpay subscription payment signature for webhooks
 * @param {Object} webhookData - Webhook verification data
 * @param {string} webhookData.razorpay_subscription_id - Subscription ID from Razorpay
 * @param {string} webhookData.razorpay_payment_id - Payment ID from Razorpay
 * @param {string} webhookData.razorpay_signature - Webhook signature from Razorpay
 * @param {string} [webhookData.webhook_secret] - Webhook secret for verification
 * @returns {boolean} True if signature is valid
 * @throws {Error} If verification fails
 */
export function verifySubscriptionPaymentSignature(webhookData: {
    razorpay_subscription_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    webhook_secret?: string | undefined;
}): boolean;
/**
 * Pause a Razorpay subscription
 * @param {string} subscriptionId - Razorpay subscription ID
 * @param {Object} [pauseData] - Pause data
 * @param {Date} [pauseData.pause_at] - When to pause (default: now)
 * @param {Object} [pauseData.notes] - Pause notes
 * @returns {Promise<Object>} Paused Razorpay subscription object
 * @throws {Error} If subscription pause fails
 */
export function pauseRazorpaySubscription(subscriptionId: string, pauseData?: {
    pause_at?: Date | undefined;
    notes?: Object | undefined;
}): Promise<Object>;
/**
 * Resume a paused Razorpay subscription
 * @param {string} subscriptionId - Razorpay subscription ID
 * @param {Object} [resumeData] - Resume data
 * @param {Date} [resumeData.resume_at] - When to resume (default: now)
 * @param {Object} [resumeData.notes] - Resume notes
 * @returns {Promise<Object>} Resumed Razorpay subscription object
 * @throws {Error} If subscription resume fails
 */
export function resumeRazorpaySubscription(subscriptionId: string, resumeData?: {
    resume_at?: Date | undefined;
    notes?: Object | undefined;
}): Promise<Object>;
/**
 * Create a Razorpay customer (with built-in duplicate prevention)
 * @param {Object} customerData - Customer creation data
 * @param {string} customerData.name - Customer full name
 * @param {string} customerData.email - Customer email address
 * @param {string} [customerData.contact] - Customer phone number
 * @param {"0" | "1"} [customerData.fail_existing] - Fail if customer already exists (default: false)
 * @param {Object} [customerData.notes] - Additional notes
 * @returns {Promise<Object>} Razorpay customer object with isNew flag
 * @throws {Error} If customer creation fails
 */
export function createRazorpayCustomer(customerData: {
    name: string;
    email: string;
    contact?: string | undefined;
    fail_existing?: "0" | "1" | undefined;
    notes?: Object | undefined;
}): Promise<Object>;
/**
 * Fetch Razorpay customer details
 * @param {string} customerId - Razorpay customer ID
 * @returns {Promise<Object>} Razorpay customer details
 * @throws {Error} If customer fetch fails
 */
export function fetchRazorpayCustomer(customerId: string): Promise<Object>;
//# sourceMappingURL=subscriptions.d.ts.map