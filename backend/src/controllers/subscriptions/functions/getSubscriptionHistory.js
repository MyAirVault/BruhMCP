/**
 * Get user's subscription transaction history
 * Copied exactly from MicroSAASTemplate and adapted for PostgreSQL
 */

const { pool } = require('../../../db/config.js');
const { getPlanByCode } = require('../../../data/subscription-plans.js');

/**
 * Get user's subscription transaction history
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
async function getSubscriptionHistory(req, res) {
	try {
		const userId = /** @type {string | undefined} */ (req.user?.id);
		const { page = 1, limit = 10, type, status, dateFrom, dateTo } = req.query;

		if (!userId) {
			res.status(401).json({
				success: false,
				message: 'Please log in to view your subscription history.',
				code: 'AUTHENTICATION_REQUIRED',
			});
			return;
		}
		
		// Cast query parameters to strings for TypeScript compatibility
		const pageStr = String(page);
		const limitStr = String(limit);
		const typeStr = type ? String(type) : undefined;
		const statusStr = status ? String(status) : undefined;
		const dateFromStr = dateFrom ? String(dateFrom) : undefined;
		const dateToStr = dateTo ? String(dateTo) : undefined;

		// Build query with filters
		let query = `
			SELECT 
				st.*,
				us.status as subscription_status,
				us.plan_code
			FROM subscription_transactions st
			LEFT JOIN user_subscriptions us ON st.subscription_id = us.id
			WHERE st.user_id = $1
		`;

		const params = [userId];
		let paramCount = 1;

		if (typeStr && ['subscription', 'refund', 'adjustment'].includes(typeStr)) {
			query += ` AND st.transaction_type = $${++paramCount}`;
			params.push(typeStr);
		}

		if (statusStr && ['captured', 'failed', 'pending', 'refunded', 'cancelled'].includes(statusStr)) {
			query += ` AND st.status = $${++paramCount}`;
			params.push(statusStr);
		}

		if (dateFromStr) {
			query += ` AND st.created_at >= $${++paramCount}`;
			params.push(dateFromStr);
		}

		if (dateToStr) {
			query += ` AND st.created_at <= $${++paramCount}`;
			params.push(dateToStr);
		}

		const offset = (parseInt(pageStr) - 1) * parseInt(limitStr);
		query += ` ORDER BY st.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
		params.push(limitStr, offset.toString());

		// Get transactions from PostgreSQL
		const client = await pool.connect();
		const result = await client.query(query, params);
		const transactions = result.rows;

		// Get total count
		let countQuery = 'SELECT COUNT(*) as total FROM subscription_transactions WHERE user_id = $1';
		const countParams = [userId];
		let countParamCount = 1;

		if (typeStr && ['subscription', 'refund', 'adjustment'].includes(typeStr)) {
			countQuery += ` AND transaction_type = $${++countParamCount}`;
			countParams.push(typeStr);
		}

		if (statusStr && ['captured', 'failed', 'pending', 'refunded', 'cancelled'].includes(statusStr)) {
			countQuery += ` AND status = $${++countParamCount}`;
			countParams.push(statusStr);
		}

		if (dateFromStr) {
			countQuery += ` AND created_at >= $${++countParamCount}`;
			countParams.push(dateFromStr);
		}

		if (dateToStr) {
			countQuery += ` AND created_at <= $${++countParamCount}`;
			countParams.push(dateToStr);
		}

		const countResult = await client.query(countQuery, countParams);
		const total = parseInt(countResult.rows[0].total);

		client.release();

		// Parse JSON fields and format data with plan information
		const formattedTransactions = (transactions || []).map(transaction => {
			const planConfig = transaction.plan_code ? getPlanByCode(transaction.plan_code) : null;
			return {
				...transaction,
				plan_name: planConfig ? planConfig.name : 'Unknown Plan',
				method_details: transaction.method_details_json ? 
					(typeof transaction.method_details_json === 'string' ? JSON.parse(transaction.method_details_json) : transaction.method_details_json) : null,
				gateway_response: transaction.gateway_response_json
					? (typeof transaction.gateway_response_json === 'string' ? JSON.parse(transaction.gateway_response_json) : transaction.gateway_response_json)
					: null,
				amount_formatted: (transaction.amount / 100).toFixed(2), // Convert paise to rupees
				net_amount_formatted: (transaction.net_amount / 100).toFixed(2),
			};
		});

		const totalPages = Math.ceil(total / parseInt(limitStr));

		res.json({
			success: true,
			message: 'Subscription history retrieved successfully',
			data: {
				data: {
					transactions: formattedTransactions,
					pagination: {
						currentPage: parseInt(pageStr),
						totalPages,
						totalRecords: total,
						hasNextPage: parseInt(pageStr) < totalPages,
						hasPreviousPage: parseInt(pageStr) > 1,
					},
				},
			},
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Get subscription history failed:', errorMessage);

		res.status(500).json({
			success: false,
			message: 'Failed to retrieve subscription history. Please try again later.',
			code: 'HISTORY_FETCH_ERROR',
		});
	} finally {
		console.debug('Get subscription history process completed');
	}
}

module.exports = getSubscriptionHistory;