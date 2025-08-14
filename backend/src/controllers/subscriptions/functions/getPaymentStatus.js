/**
 * Get payment status and subscription state for polling
 * Copied exactly from MicroSAASTemplate and adapted for PostgreSQL
 */

const { pool } = require('../../../db/config.js');
const { getPlanByCode } = require('../../../data/subscription-plans.js');

/**
 * Format amount for display
 * @param {number} amount - Amount in paise
 * @returns {string} Formatted amount with currency
 */
function formatAmount(amount) {
	return `₹${(amount / 100).toFixed(2)}`;
}

/**
 * Calculate days until date
 * @param {string} dateString - ISO date string
 * @returns {number} Days until the date
 */
function calculateDaysUntil(dateString) {
	if (!dateString) return 0;
	const targetDate = new Date(dateString);
	const today = new Date();
	const diffTime = targetDate.getTime() - today.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return Math.max(0, diffDays);
}

/**
 * @typedef {Object} DatabaseSubscription
 * @property {string} plan_code
 * @property {number} total_amount
 * @property {string} status
 * @property {number} [failed_payment_count]
 * @property {string} [last_payment_attempt]
 */

/**
 * @typedef {Object} DatabaseTransaction
 * @property {string} status
 * @property {string} [failure_reason]
 * @property {string} [razorpay_payment_id]
 * @property {string} created_at
 */

/**
 * Determine payment status based on subscription and transactions
 * @param {DatabaseSubscription} subscription - Subscription data from database
 * @param {DatabaseTransaction[]} recentTransactions - Recent transaction history from database
 * @returns {Object} Payment status details
 */
function determinePaymentStatus(subscription, recentTransactions) {
	const latestTransaction = recentTransactions[0];
	
	// Count successful and failed payments
	const successfulPayments = recentTransactions.filter(t => 
		t.status === 'captured' || t.status === 'completed'
	).length;
	
	const failedPayments = recentTransactions.filter(t => 
		t.status === 'failed' || t.status === 'cancelled'
	).length;

	// Determine overall payment status
	let paymentStatus = 'pending';
	let paymentMessage = 'Payment verification in progress';
	let requiresPayment = true;

	// Free plan logic
	if (subscription.plan_code === 'free' || subscription.total_amount === 0) {
		paymentStatus = 'not_required';
		paymentMessage = 'No payment required for free plan';
		requiresPayment = false;
	}
	// Active subscription with successful payments
	else if (subscription.status === 'active' && successfulPayments > 0) {
		paymentStatus = 'completed';
		paymentMessage = 'Payment completed successfully';
		requiresPayment = false;
	}
	// Latest transaction is successful
	else if (latestTransaction && (latestTransaction.status === 'captured' || latestTransaction.status === 'completed')) {
		paymentStatus = 'completed';
		paymentMessage = 'Payment completed successfully';
		requiresPayment = false;
	}
	// Latest transaction failed
	else if (latestTransaction && (latestTransaction.status === 'failed' || latestTransaction.status === 'cancelled')) {
		paymentStatus = 'failed';
		paymentMessage = latestTransaction.failure_reason || 'Payment failed';
		requiresPayment = true;
	}
	// Subscription is cancelled/expired
	else if (subscription.status === 'cancelled' || subscription.status === 'expired') {
		paymentStatus = 'cancelled';
		paymentMessage = 'Subscription has been cancelled';
		requiresPayment = false;
	}
	// Still pending
	else {
		paymentStatus = 'pending';
		paymentMessage = 'Waiting for payment confirmation';
		requiresPayment = true;
	}

	return {
		status: paymentStatus,
		message: paymentMessage,
		is_active: subscription.status === 'active',
		is_pending: paymentStatus === 'pending',
		is_cancelled: subscription.status === 'cancelled',
		is_expired: subscription.status === 'expired',
		requires_payment: requiresPayment,
		latest_payment_id: latestTransaction?.razorpay_payment_id || null,
		latest_payment_date: latestTransaction?.created_at || null,
		successful_payments: successfulPayments,
		failed_payments: failedPayments,
		failed_payment_count: subscription.failed_payment_count || 0,
		last_payment_attempt: subscription.last_payment_attempt || null
	};
}

/**
 * @typedef {Object} PaymentStatus
 * @property {string} status
 * @property {number} failed_payment_count
 */

/**
 * Determine polling configuration
 * @param {PaymentStatus} paymentStatus - Payment status object
 * @param {DatabaseSubscription} subscription - Subscription data
 * @returns {Object} Polling configuration
 */
function determinePollingConfig(paymentStatus, subscription) {
	// Don't continue polling if payment is complete or failed permanently
	if (paymentStatus.status === 'completed' || 
		paymentStatus.status === 'not_required' ||
		paymentStatus.status === 'cancelled' ||
		paymentStatus.failed_payment_count >= 3) {
		return {
			should_continue: false,
			interval_seconds: 0,
			max_attempts: 0,
			recommended_timeout: 0
		};
	}

	// Continue polling for pending payments
	return {
		should_continue: true,
		interval_seconds: 3, // Start with 3 seconds
		max_attempts: 40, // 40 attempts max
		recommended_timeout: 300 // 5 minutes total timeout
	};
}

/**
 * Get payment status for subscription polling
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
async function getPaymentStatus(req, res) {
	try {
		const userId = req.user?.userId;
		if (!userId) {
			res.status(401).json({
				success: false,
				message: 'User authentication required',
			});
			return;
		}
		const subscriptionId = req.params.subscriptionId;

		// Get subscription from PostgreSQL
		const client = await pool.connect();
		try {
			const result = await client.query(
				`SELECT * FROM user_subscriptions WHERE id = $1 AND user_id = $2`,
				[subscriptionId, userId]
			);

			if (result.rows.length === 0) {
				res.status(404).json({
					success: false,
					message: 'Subscription not found',
					code: 'SUBSCRIPTION_NOT_FOUND',
				});
				return;
			}

			const subscription = result.rows[0];

			// Get recent transactions for this subscription (last 10)
			const transactionResult = await client.query(
				`SELECT 
					id, user_id, subscription_id, razorpay_payment_id, razorpay_order_id,
					transaction_type, amount, status, method, description, failure_reason,
					created_at, updated_at
				FROM subscription_transactions 
				WHERE subscription_id = $1 AND user_id = $2
				ORDER BY created_at DESC LIMIT 10`,
				[subscriptionId, userId]
			);

			const recentTransactions = transactionResult.rows;

			// Get plan configuration
			const planConfig = getPlanByCode(subscription.plan_code);
			const planConfigData = planConfig || { name: '', features: [], limits: {} };

			// Determine comprehensive payment status
			const paymentStatus = determinePaymentStatus(subscription, recentTransactions);
			
			// Calculate timing information
			const isInTrial = subscription.trial_end && new Date(subscription.trial_end) > new Date();
			const daysUntilExpiry = calculateDaysUntil(subscription.current_period_end);
			const daysUntilBilling = calculateDaysUntil(subscription.next_billing_date || subscription.current_period_end);

			// Determine polling configuration (cast paymentStatus for TypeScript)
			const pollingConfig = determinePollingConfig(/** @type {PaymentStatus} */ (paymentStatus), subscription);

			// Format transactions for response
			const formattedTransactions = recentTransactions.map(transaction => ({
				id: transaction.id,
				transaction_type: transaction.transaction_type || 'subscription_payment',
				amount: transaction.amount || 0,
				status: transaction.status || 'pending',
				method: transaction.method || 'unknown',
				description: transaction.description,
				razorpay_payment_id: transaction.razorpay_payment_id,
				razorpay_order_id: transaction.razorpay_order_id,
				failure_reason: transaction.failure_reason,
				processed_at: transaction.updated_at || transaction.created_at,
				created_at: transaction.created_at,
				amount_formatted: formatAmount(transaction.amount || 0),
				created_at_formatted: new Date(transaction.created_at).toLocaleString('en-IN'),
				processed_at_formatted: new Date(transaction.updated_at || transaction.created_at).toLocaleString('en-IN')
			}));

			// Build comprehensive response following MicroSAAS pattern
			const responseData = {
				subscription: {
					id: subscription.id,
					status: subscription.status,
					plan_code: subscription.plan_code,
					plan_name: planConfigData.name || subscription.plan_code,
					billing_cycle: subscription.billing_cycle,
					total_amount: subscription.total_amount || 0,
					total_amount_formatted: formatAmount(subscription.total_amount || 0),
					currency: 'INR',
					razorpay_subscription_id: subscription.razorpay_subscription_id,
					auto_renewal: subscription.auto_renewal || 0,
					created_at: subscription.created_at,
					updated_at: subscription.updated_at
				},
				payment: paymentStatus,
				timing: {
					is_in_trial: isInTrial,
					trial_end: subscription.trial_end,
					current_period_start: subscription.current_period_start,
					current_period_end: subscription.current_period_end,
					next_billing_date: subscription.next_billing_date || subscription.current_period_end,
					days_until_expiry: daysUntilExpiry,
					days_until_billing: daysUntilBilling,
					cancel_at_period_end: subscription.cancel_at_period_end || 0,
					cancelled_at: subscription.cancelled_at
				},
				polling: pollingConfig,
				recent_transactions: formattedTransactions,
				metadata: {
					checked_at: new Date().toISOString(),
					user_id: userId,
					plan_features: planConfigData.features || [],
					plan_limits: planConfigData.limits || {}
				}
			};

			res.json({
				success: true,
				message: 'Payment status retrieved successfully',
				data: responseData
			});

		} finally {
			client.release();
		}
		
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Failed to get payment status:', errorMessage);

		res.status(500).json({
			success: false,
			message: 'Failed to get payment status',
		});
	} finally {
		console.debug('Get payment status process completed');
	}
}

module.exports = getPaymentStatus;