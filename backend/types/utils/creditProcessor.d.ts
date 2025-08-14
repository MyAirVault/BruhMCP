/**
 * Process refund to account credits for downgrades (following template approach)
 * @param {Object} refundData - Refund processing data
 * @param {string} refundData.userId - User ID
 * @param {number} refundData.subscriptionId - Subscription ID
 * @param {number} refundData.creditAmount - Credit amount in paise
 * @param {string} refundData.reason - Reason for credit
 * @param {import('pg').PoolClient} [existingClient] - Optional existing database client
 * @returns {Promise<Object>} Credit processing result
 * @throws {Error} If credit processing fails
 */
export function processRefundToCredits(refundData: {
    userId: string;
    subscriptionId: number;
    creditAmount: number;
    reason: string;
}, existingClient?: import("pg").PoolClient): Promise<Object>;
/**
 * Get user's available credit balance
 * @param {string} userId - User ID
 * @returns {Promise<number>} Available credit balance in paise
 */
export function getUserCreditBalance(userId: string): Promise<number>;
//# sourceMappingURL=creditProcessor.d.ts.map