/**
 * Create a Razorpay order for payment processing
 * @param {Object} orderData - Order creation data
 * @param {number} orderData.amount - Amount in paise
 * @param {string} orderData.currency - Currency code (default: INR)
 * @param {string} orderData.receipt - Unique receipt identifier
 * @param {Object} [orderData.notes] - Additional notes
 * @returns {Promise<Object>} Razorpay order object
 * @throws {Error} If order creation fails
 */
export function createRazorpayOrder(orderData: {
    amount: number;
    currency: string;
    receipt: string;
    notes?: Object | undefined;
}): Promise<Object>;
/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 * @throws {Error} If payment fetch fails
 */
export function fetchPaymentDetails(paymentId: string): Promise<Object>;
/**
 * Capture an authorized payment
 * @param {string} paymentId - Payment ID to capture
 * @param {number} amount - Amount to capture in paise
 * @param {string} [currency] - Currency code (default: INR)
 * @returns {Promise<Object>} Captured payment details
 * @throws {Error} If capture fails
 */
export function capturePayment(paymentId: string, amount: number, currency?: string): Promise<Object>;
/**
 * Create a refund for a payment
 * @param {Object} refundData - Refund data
 * @param {string} refundData.paymentId - Payment ID to refund
 * @param {number} [refundData.amount] - Amount to refund (full refund if not specified)
 * @param {string} [refundData.reason] - Reason for refund
 * @returns {Promise<Object>} Refund details
 * @throws {Error} If refund fails
 */
export function createRefund(refundData: {
    paymentId: string;
    amount?: number | undefined;
    reason?: string | undefined;
}): Promise<Object>;
//# sourceMappingURL=orders.d.ts.map