/**
 * Payment Gateway Service - Razorpay integration for Pro plan subscriptions
 * @fileoverview Handles Razorpay payment processing for Pro plan upgrades
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay
let razorpay;
try {
	razorpay = new Razorpay({
		key_id: process.env.RAZORPAY_KEY_ID,
		key_secret: process.env.RAZORPAY_KEY_SECRET,
	});
} catch (error) {
	console.error('❌ Failed to initialize Razorpay:', error);
}

/**
 * Pro plan configuration
 */
const PRO_PLAN_CONFIG = {
	name: 'Pro Plan',
	description: 'Unlimited MCP instances',
	currency: 'INR',
	interval: 'monthly',
	amount: process.env.PRO_PLAN_PRICE || 99900, // ₹999 in paise
};

/**
 * Validate Razorpay configuration
 * @returns {Object} Validation result
 */
export function validateRazorpayConfig() {
	const requiredVars = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
	const missing = requiredVars.filter(varName => !process.env[varName]);
	
	if (missing.length > 0) {
		return {
			valid: false,
			missingVars: missing,
			message: `Missing required Razorpay environment variables: ${missing.join(', ')}`
		};
	}
	
	if (!razorpay) {
		return {
			valid: false,
			message: 'Razorpay instance failed to initialize'
		};
	}
	
	return {
		valid: true,
		message: 'Razorpay configuration is valid'
	};
}

/**
 * Create a Razorpay subscription for Pro plan
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} successUrl - URL to redirect after successful payment
 * @param {string} cancelUrl - URL to redirect if user cancels
 * @returns {Promise<Object>} Subscription and payment link details
 */
export async function createProSubscriptionCheckout(userId, email, successUrl, cancelUrl) {
	try {
		const config = validateRazorpayConfig();
		if (!config.valid) {
			throw new Error(config.message);
		}

		// Create Razorpay plan (if not exists)
		let plan;
		try {
			// List existing plans to check if Pro plan exists
			const plans = await razorpay.plans.all({
				count: 100
			});
			
			plan = plans.items.find(p => p.item.name === PRO_PLAN_CONFIG.name);
			
			if (!plan) {
				// Create new plan
				plan = await razorpay.plans.create({
					period: PRO_PLAN_CONFIG.interval,
					interval: 1,
					item: {
						name: PRO_PLAN_CONFIG.name,
						description: PRO_PLAN_CONFIG.description,
						amount: PRO_PLAN_CONFIG.amount,
						currency: PRO_PLAN_CONFIG.currency
					},
					notes: {
						plan_type: 'pro',
						created_for: 'mcp_platform'
					}
				});
				
				console.log(`✅ Created Razorpay plan: ${plan.id}`);
			}
		} catch (error) {
			console.error('Error creating/retrieving Razorpay plan:', error);
			throw new Error('Failed to setup subscription plan');
		}

		// Create customer
		let customer;
		try {
			customer = await razorpay.customers.create({
				name: email.split('@')[0], // Use email prefix as name
				email: email,
				contact: '', // Optional, can be added later
				notes: {
					userId: userId,
					platform: 'mcp_instances'
				}
			});
			
			console.log(`✅ Created Razorpay customer: ${customer.id}`);
		} catch (error) {
			console.error('Error creating Razorpay customer:', error);
			throw new Error('Failed to create customer profile');
		}

		// Create subscription
		const subscription = await razorpay.subscriptions.create({
			plan_id: plan.id,
			customer_id: customer.id,
			quantity: 1,
			total_count: 120, // 10 years worth of monthly payments
			start_at: Math.floor(Date.now() / 1000), // Start immediately
			expire_by: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // Expire in 24 hours if not paid
			notes: {
				userId: userId,
				planType: 'pro',
				successUrl: successUrl,
				cancelUrl: cancelUrl
			},
			notify_info: {
				notify_phone: '',
				notify_email: email
			}
		});

		console.log(`✅ Created Razorpay subscription for user ${userId}: ${subscription.id}`);

		// Create payment link for the subscription
		const paymentLink = await razorpay.paymentLinks.create({
			amount: PRO_PLAN_CONFIG.amount,
			currency: PRO_PLAN_CONFIG.currency,
			description: `${PRO_PLAN_CONFIG.name} - ${PRO_PLAN_CONFIG.description}`,
			customer: {
				name: customer.name,
				email: customer.email,
				contact: customer.contact || ''
			},
			notify: {
				sms: false,
				email: true
			},
			reminder_enable: true,
			notes: {
				userId: userId,
				subscriptionId: subscription.id,
				planType: 'pro'
			},
			callback_url: successUrl,
			callback_method: 'get'
		});

		return {
			subscriptionId: subscription.id,
			paymentLinkId: paymentLink.id,
			checkoutUrl: paymentLink.short_url,
			customerId: customer.id,
			planId: plan.id
		};

	} catch (error) {
		console.error('Error creating Razorpay subscription checkout:', error);
		throw error;
	}
}

/**
 * Cancel a Razorpay subscription
 * @param {string} subscriptionId - Razorpay subscription ID
 * @returns {Promise<Object>} Cancellation result
 */
export async function cancelSubscription(subscriptionId) {
	try {
		const config = validateRazorpayConfig();
		if (!config.valid) {
			throw new Error(config.message);
		}

		const subscription = await razorpay.subscriptions.cancel(subscriptionId, {
			cancel_at_cycle_end: 0 // Cancel immediately
		});
		
		console.log(`✅ Cancelled Razorpay subscription: ${subscriptionId}`);
		
		return {
			success: true,
			subscriptionId: subscription.id,
			status: subscription.status,
			cancelledAt: new Date(subscription.ended_at * 1000)
		};

	} catch (error) {
		console.error('Error cancelling Razorpay subscription:', error);
		throw error;
	}
}

/**
 * Retrieve subscription details from Razorpay
 * @param {string} subscriptionId - Razorpay subscription ID
 * @returns {Promise<Object>} Subscription details
 */
export async function getSubscriptionDetails(subscriptionId) {
	try {
		const config = validateRazorpayConfig();
		if (!config.valid) {
			throw new Error(config.message);
		}

		const subscription = await razorpay.subscriptions.fetch(subscriptionId);
		
		return {
			id: subscription.id,
			customerId: subscription.customer_id,
			status: subscription.status,
			currentPeriodStart: new Date(subscription.current_start * 1000),
			currentPeriodEnd: new Date(subscription.current_end * 1000),
			cancelAtPeriodEnd: subscription.cancel_at_cycle_end === 1,
			notes: subscription.notes
		};

	} catch (error) {
		console.error('Error retrieving Razorpay subscription:', error);
		throw error;
	}
}

/**
 * Verify webhook signature from Razorpay
 * @param {string} payload - Raw request body
 * @param {string} signature - Razorpay signature header
 * @returns {boolean} Signature verification result
 */
export function verifyWebhookSignature(payload, signature) {
	try {
		const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
		if (!webhookSecret) {
			throw new Error('RAZORPAY_WEBHOOK_SECRET not configured');
		}

		const expectedSignature = crypto
			.createHmac('sha256', webhookSecret)
			.update(payload)
			.digest('hex');
		
		return crypto.timingSafeEqual(
			Buffer.from(signature, 'utf8'),
			Buffer.from(expectedSignature, 'utf8')
		);

	} catch (error) {
		console.error('Error verifying Razorpay webhook signature:', error);
		return false;
	}
}

/**
 * Parse Razorpay webhook event
 * @param {string} payload - Raw webhook payload
 * @param {string} signature - Webhook signature
 * @returns {Object} Parsed webhook event
 */
export function parseWebhookEvent(payload, signature) {
	// Verify signature first
	if (!verifyWebhookSignature(payload, signature)) {
		throw new Error('Invalid webhook signature');
	}

	try {
		const event = JSON.parse(payload);
		return {
			id: event.created_at + '_' + event.event, // Create unique ID
			type: event.event,
			data: event.payload,
			created: event.created_at
		};
	} catch (error) {
		console.error('Error parsing Razorpay webhook:', error);
		throw new Error('Invalid webhook payload');
	}
}

/**
 * Get customer by email
 * @param {string} email - Customer email
 * @returns {Promise<Object|null>} Customer details or null
 */
export async function getCustomerByEmail(email) {
	try {
		const config = validateRazorpayConfig();
		if (!config.valid) {
			throw new Error(config.message);
		}

		const customers = await razorpay.customers.all({
			count: 100
		});
		
		const customer = customers.items.find(c => c.email === email);
		return customer || null;

	} catch (error) {
		console.error('Error retrieving Razorpay customer:', error);
		throw error;
	}
}

/**
 * Export Razorpay instance for advanced operations
 */
export { razorpay };