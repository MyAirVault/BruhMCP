/**
 * Razorpay utility functions
 * Handles calculations, credits processing, and payment failure handling
 */
/**
 * Calculate prorated amount for plan changes
 * @param {Object} calculationData - Proration calculation data
 * @param {number} calculationData.currentPlanPrice - Current plan price in paise
 * @param {number} calculationData.newPlanPrice - New plan price in paise
 * @param {number} calculationData.daysRemaining - Days remaining in current period
 * @param {number} calculationData.totalDays - Total days in billing period
 * @returns {Object} Proration calculation result
 */
export function calculateProratedAmount(calculationData: {
    currentPlanPrice: number;
    newPlanPrice: number;
    daysRemaining: number;
    totalDays: number;
}): Object;
/**
 * Process refund to account credits for downgrades
 * @param {Object} refundData - Refund processing data
 * @param {number} refundData.userId - User ID
 * @param {number} refundData.subscriptionId - Subscription ID
 * @param {number} refundData.creditAmount - Credit amount in paise
 * @param {string} refundData.reason - Reason for credit
 * @param {{query: function}} db - PostgreSQL database connection
 * @returns {Promise<Object>} Credit processing result
 * @throws {Error} If credit processing fails
 */
export function processRefundToCredits(refundData: {
    userId: number;
    subscriptionId: number;
    creditAmount: number;
    reason: string;
}, db: {
    query: Function;
}): Promise<Object>;
/**
 * Handle failed payment scenarios with retry logic
 * @param {Object} failureData - Payment failure data
 * @param {string} failureData.paymentId - Payment ID
 * @param {string} failureData.orderId - Order ID
 * @param {string} failureData.errorCode - Error code from Razorpay
 * @param {string} failureData.errorDescription - Error description
 * @param {number} failureData.subscriptionId - Subscription ID
 * @param {{query: function}} db - PostgreSQL database connection
 * @returns {Promise<Object>} Failure handling result
 * @throws {Error} If failure handling fails
 */
export function handleFailedPayments(failureData: {
    paymentId: string;
    orderId: string;
    errorCode: string;
    errorDescription: string;
    subscriptionId: number;
}, db: {
    query: Function;
}): Promise<Object>;
//# sourceMappingURL=utils.d.ts.map