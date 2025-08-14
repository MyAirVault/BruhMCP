/**
 * Subscription management route functions
 * Handles all subscription-related business logic for Razorpay subscription system
 *
 * @fileoverview Subscription management functions with proper Razorpay integration
 */

/**
 * @typedef {Object} DatabaseUser
 * @property {number} id - User ID
 * @property {string} name - User full name
 * @property {string} email - User email
 * @property {string} [phone] - User phone number
 * @property {string} [razorpay_customer_id] - Razorpay customer ID
 */

/**
 * @typedef {Object} PlanConfiguration
 * @property {string} plan_code - Plan code (free, pro, plus)
 * @property {string} name - Plan name
 * @property {string} description - Plan description
 * @property {number} price_monthly - Monthly price in paise
 * @property {number} price_yearly - Yearly price in paise
 * @property {string} price_currency - Currency code
 * @property {number} trial_days - Trial period in days
 * @property {string[]} features - Array of features
 * @property {Object} limits - Object containing limits
 * @property {boolean} is_active - Whether plan is active
 */

/**
 * @typedef {Object} DatabaseSubscription
 * @property {number} id - Subscription ID
 * @property {number} user_id - User ID
 * @property {string} plan_code - Plan code (free, pro, plus)
 * @property {string} status - Subscription status
 * @property {string} billing_cycle - Billing cycle (monthly/yearly)
 * @property {string} current_period_start - Current period start date
 * @property {string} current_period_end - Current period end date
 * @property {string} [trial_start] - Trial start date
 * @property {string} [trial_end] - Trial end date
 * @property {number} total_amount - Total amount in paise
 * @property {string} [razorpay_subscription_id] - Razorpay subscription ID
 * @property {string} [razorpay_customer_id] - Razorpay customer ID
 * @property {number} [cancel_at_period_end] - Whether subscription cancels at period end
 * @property {string} [cancelled_at] - Cancellation timestamp
 * @property {string} [cancellation_reason] - Reason for cancellation
 * @property {number} [failed_payment_count] - Failed payment count
 * @property {string} [last_payment_attempt] - Last payment attempt timestamp
 * @property {string} [next_billing_date] - Next billing date
 * @property {number} [auto_renewal] - Auto renewal flag
 * @property {string} [created_at] - Creation timestamp
 * @property {string} [updated_at] - Update timestamp
 */

/**
 * @typedef {Object} DatabaseTransaction
 * @property {number} id - Transaction ID
 * @property {number} user_id - User ID
 * @property {number} subscription_id - Subscription ID
 * @property {string} transaction_type - Transaction type
 * @property {number} amount - Amount in paise
 * @property {number} net_amount - Net amount in paise
 * @property {string} status - Transaction status
 * @property {string} [method_details_json] - Payment method details JSON
 * @property {string} [gateway_response_json] - Gateway response JSON
 * @property {string} [plan_code] - Plan code (from JOIN)
 * @property {string} [subscription_status] - Subscription status (from JOIN)
 */


/**
 * @typedef {Object} DatabaseCountResult
 * @property {number} total - Total count
 */

// Import individual functions from the functions directory
const getAllPlans = require('./functions/getAllPlans.js');
const getUserSubscription = require('./functions/getUserSubscription.js');
const createSubscription = require('./functions/createSubscription.js');
const upgradeSubscription = require('./functions/upgradeSubscription.js');
const cancelSubscription = require('./functions/cancelSubscription.js');
const getSubscriptionHistory = require('./functions/getSubscriptionHistory.js');
const verifyPayment = require('./functions/verifyPayment.js');
const getPaymentStatus = require('./functions/getPaymentStatus.js');


module.exports = {
	getAllPlans,
	getUserSubscription,
	createSubscription,
	upgradeSubscription,
	cancelSubscription,
	getSubscriptionHistory,
	verifyPayment,
	getPaymentStatus,
};