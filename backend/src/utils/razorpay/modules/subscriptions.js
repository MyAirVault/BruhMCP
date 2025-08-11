/**
 * Razorpay subscription management functions
 * Handles recurring billing, plans, subscriptions, and related operations
 */

const crypto = require('crypto');
const { initializeRazorpay } = require('./core');

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
async function createRazorpayPlan(planData) {
	try {
		const { period, interval = 1, item, notes = {} } = planData;

		// Validate required fields
		if (!period || !item || !item.name || !item.amount) {
			throw new Error('Period, item name, and amount are required for plan creation');
		}

		// Validate period
		const validPeriods = /** @type {const} */ (['weekly', 'monthly', 'yearly', 'daily']);
		if (!validPeriods.includes(/** @type {any} */ (period))) {
			throw new Error('Period must be one of: weekly, monthly, yearly, daily');
		}

		// Validate amount (must be positive integer)
		if (!Number.isInteger(item.amount) || item.amount <= 0) {
			throw new Error('Amount must be a positive integer in paise');
		}

		const razorpay = initializeRazorpay();

		const planOptions = {
			period,
			interval,
			item: {
				name: item.name,
				description: item.description || '',
				amount: item.amount,
				currency: item.currency || 'INR',
			},
			notes,
		};

		const plan = await razorpay.plans.create(/** @type {any} */ (planOptions));

		console.log('Razorpay plan created successfully:', /** @type {any} */ (plan).id);
		return plan;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Razorpay plan creation failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Razorpay plan creation process completed');
	}
}

/**
 * Create a Razorpay subscription for recurring billing
 * @param {Object} subscriptionData - Subscription creation data
 * @returns {Promise<Object>} Razorpay subscription object
 * @throws {Error} If subscription creation fails
 */
async function createRazorpaySubscription(subscriptionData) {
	// Implementation will be moved from main file
	const razorpay = initializeRazorpay();
	// TODO: Copy full implementation from original file
	throw new Error('Function implementation to be moved from main file');
}

/**
 * Update a Razorpay subscription
 * @param {string} subscriptionId - Subscription ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated subscription
 */
async function updateRazorpaySubscription(subscriptionId, updateData) {
	// TODO: Copy full implementation from original file
	throw new Error('Function implementation to be moved from main file');
}

/**
 * Cancel a Razorpay subscription
 * @param {string} subscriptionId - Subscription ID
 * @param {Object} cancelData - Cancellation data
 * @returns {Promise<Object>} Cancelled subscription
 */
async function cancelRazorpaySubscription(subscriptionId, cancelData) {
	// TODO: Copy full implementation from original file
	throw new Error('Function implementation to be moved from main file');
}

/**
 * Fetch Razorpay subscription details
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<Object>} Subscription details
 */
async function fetchRazorpaySubscription(subscriptionId) {
	// TODO: Copy full implementation from original file
	throw new Error('Function implementation to be moved from main file');
}

/**
 * Verify subscription payment signature from webhook
 * @param {Object} webhookData - Webhook data
 * @returns {boolean} Verification result
 */
function verifySubscriptionPaymentSignature(webhookData) {
	// TODO: Copy full implementation from original file
	throw new Error('Function implementation to be moved from main file');
}

/**
 * Pause a Razorpay subscription
 * @param {string} subscriptionId - Subscription ID
 * @param {Object} pauseData - Pause data
 * @returns {Promise<Object>} Paused subscription
 */
async function pauseRazorpaySubscription(subscriptionId, pauseData = {}) {
	// TODO: Copy full implementation from original file
	throw new Error('Function implementation to be moved from main file');
}

/**
 * Resume a Razorpay subscription
 * @param {string} subscriptionId - Subscription ID
 * @param {Object} resumeData - Resume data
 * @returns {Promise<Object>} Resumed subscription
 */
async function resumeRazorpaySubscription(subscriptionId, resumeData = {}) {
	// TODO: Copy full implementation from original file
	throw new Error('Function implementation to be moved from main file');
}

module.exports = {
	createRazorpayPlan,
	createRazorpaySubscription,
	updateRazorpaySubscription,
	cancelRazorpaySubscription,
	fetchRazorpaySubscription,
	verifySubscriptionPaymentSignature,
	pauseRazorpaySubscription,
	resumeRazorpaySubscription,
};