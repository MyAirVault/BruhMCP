/**
 * Razorpay order and payment management functions
 * Handles one-time payments, order creation, and payment processing
 */

const { initializeRazorpay } = require('./core');

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
async function createRazorpayOrder(orderData) {
	try {
		const { amount, currency = 'INR', receipt, notes = {} } = orderData;

		// Validate required fields
		if (!amount || !receipt) {
			throw new Error('Amount and receipt are required for order creation');
		}

		// Validate amount (must be positive integer)
		if (!Number.isInteger(amount) || amount <= 0) {
			throw new Error('Amount must be a positive integer in paise');
		}

		const razorpay = initializeRazorpay();

		/** @type {any} */
		const orderOptions = {
			amount,
			currency,
			receipt,
			notes,
			payment_capture: 1, // Auto-capture payments
		};

		/** @type {any} */
		const order = await razorpay.orders.create({
			amount: orderOptions.amount,
			currency: orderOptions.currency,
			receipt: orderOptions.receipt,
			notes: orderOptions.notes,
			payment_capture: true
		});

		console.log('Razorpay order created successfully:', order.id);
		return order;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Razorpay order creation failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Razorpay order creation process completed');
	}
}

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<Object>} Payment details
 * @throws {Error} If payment fetch fails
 */
async function fetchPaymentDetails(paymentId) {
	try {
		if (!paymentId) {
			throw new Error('Payment ID is required');
		}

		const razorpay = initializeRazorpay();
		const payment = await razorpay.payments.fetch(paymentId);

		console.log('Payment details fetched successfully:', paymentId);
		return payment;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Payment details fetch failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Payment details fetch process completed');
	}
}

/**
 * Capture an authorized payment
 * @param {string} paymentId - Payment ID to capture
 * @param {number} amount - Amount to capture in paise
 * @param {string} [currency] - Currency code (default: INR)
 * @returns {Promise<Object>} Captured payment details
 * @throws {Error} If capture fails
 */
async function capturePayment(paymentId, amount, currency = 'INR') {
	try {
		if (!paymentId) {
			throw new Error('Payment ID is required');
		}

		if (!amount || !Number.isInteger(amount) || amount <= 0) {
			throw new Error('Amount must be a positive integer in paise');
		}

		const razorpay = initializeRazorpay();
		const capturedPayment = await razorpay.payments.capture(paymentId, amount, currency);

		console.log('Payment captured successfully:', paymentId, JSON.stringify(capturedPayment, null, '\t'));
		return capturedPayment;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Payment capture failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Payment capture process completed');
	}
}

/**
 * Create a refund for a payment
 * @param {Object} refundData - Refund data
 * @param {string} refundData.paymentId - Payment ID to refund
 * @param {number} [refundData.amount] - Amount to refund (full refund if not specified)
 * @param {string} [refundData.reason] - Reason for refund
 * @returns {Promise<Object>} Refund details
 * @throws {Error} If refund fails
 */
async function createRefund(refundData) {
	try {
		const { paymentId, amount, reason } = refundData;

		if (!paymentId) {
			throw new Error('Payment ID is required for refund');
		}

		const razorpay = initializeRazorpay();

		const refundOptions = {
			payment_id: paymentId,
			...(amount && { amount }),
			...(reason && { notes: { reason } }),
		};

		const refund = await razorpay.payments.refund(paymentId, refundOptions);

		console.log('Refund created successfully:', refund.id);
		return refund;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Refund creation failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Refund creation process completed');
	}
}

module.exports = {
	createRazorpayOrder,
	fetchPaymentDetails,
	capturePayment,
	createRefund,
};