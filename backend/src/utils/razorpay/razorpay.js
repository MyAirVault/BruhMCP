/**
 * Razorpay payment processing utility functions
 * Modular structure - imports from specialized modules and exports unified interface
 */

// Import all modules
const coreModule = require('./modules/core');
const customersModule = require('./modules/customers');
const ordersModule = require('./modules/orders');
const utilsModule = require('./modules/utils');
const subscriptionsModule = require('./modules/subscriptions');

// Export unified interface for backward compatibility
module.exports = {
	// Core functions
	initializeRazorpay: coreModule.initializeRazorpay,
	_resetRazorpayInstance: coreModule._resetRazorpayInstance,

	// Customer management
	createRazorpayCustomer: customersModule.createRazorpayCustomer,
	fetchRazorpayCustomer: customersModule.fetchRazorpayCustomer,
	updateRazorpayCustomer: customersModule.updateRazorpayCustomer,

	// Order-based payments (for one-time payments)
	createRazorpayOrder: ordersModule.createRazorpayOrder,
	fetchPaymentDetails: ordersModule.fetchPaymentDetails,
	capturePayment: ordersModule.capturePayment,
	createRefund: ordersModule.createRefund,

	// Subscription-based payments (recurring billing)
	createRazorpayPlan: subscriptionsModule.createRazorpayPlan,
	createRazorpaySubscription: subscriptionsModule.createRazorpaySubscription,
	updateRazorpaySubscription: subscriptionsModule.updateRazorpaySubscription,
	cancelRazorpaySubscription: subscriptionsModule.cancelRazorpaySubscription,
	fetchRazorpaySubscription: subscriptionsModule.fetchRazorpaySubscription,
	verifySubscriptionPaymentSignature: subscriptionsModule.verifySubscriptionPaymentSignature,
	pauseRazorpaySubscription: subscriptionsModule.pauseRazorpaySubscription,
	resumeRazorpaySubscription: subscriptionsModule.resumeRazorpaySubscription,

	// Utilities
	calculateProratedAmount: utilsModule.calculateProratedAmount,
	processRefundToCredits: utilsModule.processRefundToCredits,
	handleFailedPayments: utilsModule.handleFailedPayments,
};