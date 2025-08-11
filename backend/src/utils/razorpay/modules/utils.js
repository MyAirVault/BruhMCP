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
function calculateProratedAmount(calculationData) {
	try {
		const { currentPlanPrice, newPlanPrice, daysRemaining, totalDays } = calculationData;

		// Validate input data
		if (typeof currentPlanPrice !== 'number' || typeof newPlanPrice !== 'number') {
			throw new Error('Plan prices must be numbers');
		}

		if (typeof daysRemaining !== 'number' || typeof totalDays !== 'number') {
			throw new Error('Days must be numbers');
		}

		// Validate basic requirements
		if (totalDays <= 0) {
			throw new Error('Total days must be positive');
		}
		
		if (daysRemaining < 0) {
			throw new Error('Days remaining cannot be negative');
		}
		
		// Allow some flexibility in days remaining vs total days
		// Real billing cycles might be 28-31 days for monthly, 360-366 for yearly
		const maxAllowedDays = totalDays === 30 ? 35 : (totalDays === 365 ? 370 : totalDays + 5);
		if (daysRemaining > maxAllowedDays) {
			throw new Error(`Days remaining (${daysRemaining}) exceeds maximum allowed (${maxAllowedDays})`);
		}

		const priceDifference = newPlanPrice - currentPlanPrice;
		const proratedAmount = Math.round((priceDifference * daysRemaining) / totalDays);

		const result = {
			proratedAmount,
			isUpgrade: priceDifference > 0,
			isDowngrade: priceDifference < 0,
			requiresPayment: proratedAmount > 0,
			creditAmount: proratedAmount < 0 ? Math.abs(proratedAmount) : 0,
			priceDifference,
			daysUsed: totalDays - daysRemaining,
			daysRemaining,
			totalDays,
		};

		console.log('Proration calculation completed:', result);
		return result;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Proration calculation failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Proration calculation process completed');
	}
}

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
async function processRefundToCredits(refundData, db) {
	try {
		const { userId, subscriptionId, creditAmount, reason } = refundData;

		// Validate input data with specific error messages
		if (!userId) {
			throw new Error('User ID is required');
		}
		
		if (!subscriptionId) {
			throw new Error('Subscription ID is required');
		}
		
		if (typeof creditAmount !== 'number') {
			throw new Error('Credit amount is required');
		}
		
		if (!reason) {
			throw new Error('Reason is required');
		}

		if (creditAmount <= 0) {
			throw new Error('Credit amount must be positive');
		}

		// Calculate expiry date (1 year from now)
		const expiresAt = new Date();
		expiresAt.setFullYear(expiresAt.getFullYear() + 1);

		// Insert account credit record
		const creditResult = await db.query(`
            INSERT INTO account_credits (
                user_id, subscription_id, credit_amount, credit_type, description, expires_at
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `, [
			userId,
			subscriptionId,
			creditAmount,
			'credit',
			reason,
			expiresAt.toISOString()
		]);

		const result = {
			success: true,
			creditAmount,
			transactionId: creditResult.rows[0]?.id || Date.now()
		};

		console.log('Account credit processed successfully:', result);
		return result;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Account credit processing failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Account credit processing completed');
	}
}

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
async function handleFailedPayments(failureData, db) {
	try {
		const { paymentId, orderId, errorCode, errorDescription, subscriptionId } = failureData;

		// Validate input data with specific error messages
		if (!paymentId) {
			throw new Error('Payment ID is required');
		}
		
		if (!orderId) {
			throw new Error('Order ID is required');
		}
		
		if (!subscriptionId) {
			throw new Error('Subscription ID is required');
		}

		// Get current subscription details
		const subscriptionResult = await db.query(`
            SELECT * FROM user_subscriptions WHERE id = $1
        `, [subscriptionId]);
		/** @type {any} */
		const subscription = subscriptionResult.rows[0];

		if (!subscription) {
			throw new Error('Subscription not found');
		}

		// Update failed payment count
		await db.query(`
            UPDATE user_subscriptions 
            SET failed_payment_count = failed_payment_count + 1,
                last_payment_attempt = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
        `, [subscriptionId]);

		// Check if maximum failures reached
		const maxFailures = 3; // Configure this value
		const currentFailureCount = subscription.failed_payment_count || 0;
		const newFailureCount = currentFailureCount + 1;

		// Create retry date (24 hours from now)
		const retryAfter = new Date();
		retryAfter.setHours(retryAfter.getHours() + 24);

		let result;
		if (newFailureCount >= maxFailures) {
			// Move subscription to cancelled status
			await db.query(`
                UPDATE user_subscriptions 
                SET status = 'cancelled',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
            `, [subscriptionId]);

			result = {
				action: 'subscription_cancelled',
				failureCount: newFailureCount,
				maxFailures,
				reason: 'Maximum payment failures reached'
			};
		} else {
			result = {
				action: 'retry_allowed',
				failureCount: newFailureCount,
				maxFailures,
				retryAfter
			};
		}

		// Log the transaction failure
		await db.query(`
            INSERT INTO subscription_transactions (
                user_id, subscription_id, razorpay_payment_id, razorpay_order_id,
                transaction_type, amount, net_amount, currency, status,
                failure_reason, failure_code, gateway_response_json, retry_count
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
			subscription.user_id,
			subscriptionId,
			paymentId,
			orderId,
			'subscription',
			subscription.total_amount || 0,
			subscription.total_amount || 0,
			'INR',
			'failed',
			errorDescription,
			errorCode,
			JSON.stringify(failureData),
			newFailureCount
		]);

		console.log('Payment failure handled:', result);
		return result;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Payment failure handling failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Payment failure handling process completed');
	}
}

module.exports = {
	calculateProratedAmount,
	processRefundToCredits,
	handleFailedPayments,
};