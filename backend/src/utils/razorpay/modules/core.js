/**
 * Razorpay core initialization and instance management
 * Handles the singleton pattern for Razorpay instance
 */

const Razorpay = require('razorpay');
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = require('../../../config/env.js');

/**
 * Razorpay instance (singleton)
 * @type {Razorpay|null}
 */
let razorpayInstance = null;

/**
 * Initialize Razorpay instance with credentials
 * @returns {Razorpay} Razorpay instance
 * @throws {Error} If credentials are missing
 */
function initializeRazorpay() {
	try {
		if (razorpayInstance) {
			return razorpayInstance;
		}

		const keyId = RAZORPAY_KEY_ID;
		const keySecret = RAZORPAY_KEY_SECRET;

		if (!keyId || !keySecret) {
			throw new Error('Razorpay credentials not configured');
		}

		razorpayInstance = new Razorpay({
			key_id: keyId,
			key_secret: keySecret,
		});

		console.log('Razorpay instance initialized successfully');
		return razorpayInstance;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Razorpay initialization failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Razorpay initialization process completed');
	}
}

/**
 * Reset Razorpay instance (for testing purposes only)
 * @private
 */
function _resetRazorpayInstance() {
	try {
		razorpayInstance = null;
	} catch (error) {
		// Ignore errors during reset
	}
}

module.exports = {
	initializeRazorpay,
	_resetRazorpayInstance,
};