/**
 * Checkout Controller - Handles Pro plan subscription checkout flow
 * @fileoverview Manages subscription creation and checkout session handling
 */

import { createProSubscriptionCheckout, getSubscriptionDetails, validateRazorpayConfig } from '../services/paymentGateway.js';
import { getUserPlan, updateUserPlan } from '../../db/queries/userPlansQueries.js';
import { ErrorResponses } from '../../utils/errorResponse.js';

/**
 * @typedef {import('../../types/billing.d.ts').UserPlan} UserPlan
 * @typedef {import('../../types/billing.d.ts').RazorpayConfig} RazorpayConfig
 * @typedef {import('../../types/billing.d.ts').CheckoutSession} CheckoutSession
 * @typedef {import('../../types/billing.d.ts').SubscriptionDetails} SubscriptionDetails
 * @typedef {import('../../types/billing.d.ts').CancellationResult} CancellationResult
 */

/**
 * Create checkout session for Pro plan upgrade
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export async function createCheckoutSession(req, res) {
	try {
		// Check authentication
		if (!req.user) {
			res.status(401).json({
				error: {
					code: 'UNAUTHORIZED',
					message: 'User not authenticated'
				}
			});
			return;
		}

		// Validate Razorpay configuration first
		/** @type {RazorpayConfig} */
		const config = validateRazorpayConfig();
		if (!config.valid) {
			res.status(500).json({
				error: {
					code: 'BILLING_CONFIG_ERROR',
					message: 'Payment gateway not properly configured',
					details: { missingVars: config.missingVars }
				}
			});
			return;
		}

		const userId = req.user.id;
		const userEmail = req.user.email;

		// Check if user already has a pro plan
		/** @type {UserPlan | null} */
		const userPlan = await getUserPlan(userId);
		
		if (userPlan && userPlan.plan_type === 'pro' && userPlan.payment_status === 'active') {
			res.status(400).json({
				error: {
					code: 'ALREADY_PRO',
					message: 'User already has an active Pro plan',
					details: {
						currentPlan: userPlan.plan_type,
						paymentStatus: userPlan.payment_status
					}
				}
			});
			return;
		}

		// Create success and cancel URLs
		const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
		const successUrl = `${baseUrl}/billing/success?payment_id={PAYMENT_ID}&payment_link_id={PAYMENT_LINK_ID}`;
		const cancelUrl = `${baseUrl}/billing/cancelled`;

		// Create Razorpay checkout session
		/** @type {CheckoutSession} */
		const checkout = await createProSubscriptionCheckout(
			userId,
			userEmail,
			successUrl,
			cancelUrl
		);

		console.log(`🛒 Created Razorpay checkout for user ${userId}: ${checkout.subscriptionId}`);

		res.json({
			message: 'Checkout session created successfully',
			data: {
				subscriptionId: checkout.subscriptionId,
				amount: checkout.amount,
				currency: checkout.currency,
				customerId: checkout.customerId,
				razorpayKeyId: checkout.razorpayKeyId,
				customerEmail: checkout.customerEmail,
				customerName: checkout.customerName,
				userId: userId
			}
		});

	} catch (error) {
		console.error('Error creating checkout session:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		res.status(500).json({
			error: {
				code: 'CHECKOUT_ERROR',
				message: 'Failed to create checkout session',
				details: errorMessage
			}
		});
	}
}

/**
 * Handle successful checkout (called from frontend after payment)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export async function handleCheckoutSuccess(req, res) {
	try {
		// Check authentication
		if (!req.user) {
			res.status(401).json({
				error: {
					code: 'UNAUTHORIZED',
					message: 'User not authenticated'
				}
			});
			return;
		}

		const { sessionId } = req.body;
		const userId = req.user.id;

		if (!sessionId) {
			res.status(400).json({
				error: {
					code: 'MISSING_SESSION_ID',
					message: 'Checkout session ID is required'
				}
			});
			return;
		}

		// Handle successful payment - coordinate with webhook processing
		console.log(`✅ Checkout success callback for user ${userId}, session: ${sessionId}`);

		// Poll for subscription activation with timeout (webhook should handle the actual upgrade)
		let attempts = 0;
		const maxAttempts = 10; // 10 seconds maximum wait
		
		while (attempts < maxAttempts) {
			/** @type {UserPlan | null} */
			const userPlan = await getUserPlan(userId);
			
			if (userPlan && userPlan.plan_type === 'pro' && userPlan.payment_status === 'active') {
				// Successfully activated (likely by webhook)
				res.json({
					message: 'Payment successful - Pro plan activated',
					data: {
						planType: 'pro',
						paymentStatus: 'active',
						activatedBy: 'webhook',
						maxInstances: userPlan.max_instances
					}
				});
				return;
			}
			
			// Wait 1 second before checking again
			if (attempts < maxAttempts - 1) {
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
			attempts++;
		}

		// If webhook hasn't processed after timeout, return pending status
		/** @type {UserPlan | null} */
		const userPlan = await getUserPlan(userId);
		res.json({
			message: 'Payment successful - Pro plan activation in progress',
			data: {
				planType: userPlan?.plan_type || 'free',
				paymentStatus: 'processing',
				note: 'Plan upgrade will be activated shortly via webhook processing'
			}
		});

	} catch (error) {
		console.error('Error handling checkout success:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		res.status(500).json(ErrorResponses.internal(res, errorMessage));
		return;
	}
}

/**
 * Get current billing status for the user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getBillingStatus(req, res) {
	try {
		// Check authentication
		if (!req.user) {
			res.status(401).json({
				error: {
					code: 'UNAUTHORIZED',
					message: 'User not authenticated'
				}
			});
			return;
		}

		const userId = req.user.id;

		const userPlan = await getUserPlan(userId);

		if (!userPlan) {
			res.status(404).json({
				error: {
					code: 'NO_PLAN',
					message: 'No plan found for user'
				}
			});
			return;
		}

		// Get subscription details if user has active subscription
		let subscriptionDetails = null;
		if (userPlan.subscription_id && userPlan.payment_status === 'active') {
			try {
				subscriptionDetails = await getSubscriptionDetails(userPlan.subscription_id);
			} catch (error) {
				console.warn(`Failed to get subscription details for ${userPlan.subscription_id}:`, error);
			}
		}

		res.json({
			message: 'Billing status retrieved successfully',
			data: {
				userId,
				plan: {
					type: userPlan.plan_type,
					maxInstances: userPlan.max_instances,
					paymentStatus: userPlan.payment_status,
					features: userPlan.features,
					expiresAt: userPlan.expires_at,
					subscriptionId: userPlan.subscription_id
				},
				subscription: subscriptionDetails,
				canUpgrade: userPlan.plan_type === 'free' || userPlan.payment_status !== 'active'
			}
		});

	} catch (error) {
		console.error('Error getting billing status:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		ErrorResponses.internal(res, errorMessage);
	}
}

/**
 * Cancel current subscription
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function cancelSubscription(req, res) {
	try {
		// Check authentication
		if (!req.user) {
			res.status(401).json({
				error: {
					code: 'UNAUTHORIZED',
					message: 'User not authenticated'
				}
			});
			return;
		}

		const userId = req.user.id;

		const userPlan = await getUserPlan(userId);

		if (!userPlan || !userPlan.subscription_id) {
			res.status(400).json({
				error: {
					code: 'NO_SUBSCRIPTION',
					message: 'No active subscription found'
				}
			});
			return;
		}

		if (userPlan.payment_status !== 'active') {
			res.status(400).json({
				error: {
					code: 'SUBSCRIPTION_NOT_ACTIVE',
					message: 'Subscription is not active',
					details: {
						currentStatus: userPlan.payment_status
					}
				}
			});
			return;
		}

		// Cancel subscription via payment gateway
		const { cancelSubscription } = await import('../services/paymentGateway.js');
		const cancellationResult = await cancelSubscription(userPlan.subscription_id);

		// Update payment status (the plan downgrade will happen via webhook)
		await updateUserPlan(userId, userPlan.plan_type, {
			expiresAt: userPlan.expires_at ? new Date(userPlan.expires_at) : null,
			features: {
				...userPlan.features,
				cancelled_at: new Date().toISOString(),
				cancellation_reason: 'user_requested'
			}
		});

		console.log(`🚫 User ${userId} cancelled subscription ${userPlan.subscription_id}`);

		res.json({
			message: 'Subscription cancelled successfully',
			data: {
				subscriptionId: userPlan.subscription_id,
				cancelledAt: cancellationResult.cancelledAt,
				note: 'Plan will be downgraded at the end of the billing period'
			}
		});

	} catch (error) {
		console.error('Error cancelling subscription:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		ErrorResponses.internal(res, errorMessage);
	}
}

/**
 * Get payment history from Razorpay
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getPaymentHistory(req, res) {
	try {
		// Check authentication
		if (!req.user) {
			res.status(401).json({
				error: {
					code: 'UNAUTHORIZED',
					message: 'User not authenticated'
				}
			});
			return;
		}

		const userId = req.user.id;
		const { limit = 10, offset = 0 } = req.query;

		const userPlan = await getUserPlan(userId);
		
		if (!userPlan || !userPlan.subscription_id) {
			res.json({
				message: 'Payment history retrieved successfully',
				data: {
					payments: [],
					total: 0,
					hasMore: false
				}
			});
			return;
		}

		// Get payments from Razorpay via subscription
		/** @type {any} */
		const { razorpay } = await import('../services/paymentGateway.js');
		
		// Get invoices for this subscription instead of all payments
		/** @type {any} */
		const invoices = await razorpay.invoices.all({
			subscription_id: userPlan.subscription_id,
			count: parseInt(String(limit)),
			skip: parseInt(String(offset))
		});

		// Get payment details for each invoice
		const subscriptionPayments = [];
		for (const invoice of invoices.items) {
			if (invoice.payment_id) {
				try {
					const payment = await razorpay.payments.fetch(invoice.payment_id);
					subscriptionPayments.push(payment);
				} catch (err) {
					console.warn(`Failed to fetch payment ${invoice.payment_id}:`, err);
				}
			}
		}

		// Format payment data
		const formattedPayments = subscriptionPayments.map(payment => ({
			id: payment.id,
			amount: payment.amount / 100, // Convert from paise to rupees
			currency: payment.currency,
			status: payment.status,
			method: payment.method,
			cardLast4: payment.card ? payment.card.last4 : null,
			cardBrand: payment.card ? payment.card.network : null,
			createdAt: new Date(payment.created_at * 1000).toISOString(),
			description: payment.description || 'Pro Plan Subscription'
		}));

		res.json({
			message: 'Payment history retrieved successfully',
			data: {
				payments: formattedPayments,
				total: invoices.count || formattedPayments.length,
				hasMore: invoices.items.length === parseInt(String(limit))
			}
		});

	} catch (error) {
		console.error('Error getting payment history:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		ErrorResponses.internal(res, errorMessage);
		return;
	}
}

/**
 * Get detailed subscription information from Razorpay
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getDetailedSubscriptionInfo(req, res) {
	try {
		// Check authentication
		if (!req.user) {
			res.status(401).json({
				error: {
					code: 'UNAUTHORIZED',
					message: 'User not authenticated'
				}
			});
			return;
		}

		const userId = req.user.id;

		const userPlan = await getUserPlan(userId);
		
		if (!userPlan || !userPlan.subscription_id) {
			res.status(404).json({
				error: {
					code: 'NO_SUBSCRIPTION',
					message: 'No active subscription found'
				}
			});
			return;
		}

		// Get subscription details from Razorpay
		const { getSubscriptionDetails } = await import('../services/paymentGateway.js');
		const subscriptionDetails = await getSubscriptionDetails(userPlan.subscription_id);

		// Get additional subscription info from Razorpay
		/** @type {any} */
		const { razorpay } = await import('../services/paymentGateway.js');
		/** @type {any} */
		const subscription = await razorpay.subscriptions.fetch(userPlan.subscription_id);
		
		// Get plan details
		/** @type {any} */
		const plan = await razorpay.plans.fetch(subscription.plan_id);

		res.json({
			message: 'Subscription details retrieved successfully',
			data: {
				subscriptionId: subscription.id,
				planId: subscription.plan_id,
				planName: plan.item.name,
				amount: plan.item.amount / 100, // Convert from paise to rupees
				currency: plan.item.currency,
				interval: plan.period,
				status: subscription.status,
				currentPeriodStart: subscriptionDetails.currentPeriodStart,
				currentPeriodEnd: subscriptionDetails.currentPeriodEnd,
				nextBilling: subscriptionDetails.currentPeriodEnd,
				cancelAtPeriodEnd: subscriptionDetails.cancelAtPeriodEnd,
				customerId: subscription.customer_id,
				totalCount: subscription.total_count,
				paidCount: subscription.paid_count,
				remainingCount: subscription.remaining_count,
				startedAt: new Date(subscription.start_at * 1000).toISOString(),
				createdAt: new Date(subscription.created_at * 1000).toISOString(),
				notes: subscription.notes
			}
		});

	} catch (error) {
		console.error('Error getting subscription details:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		ErrorResponses.internal(res, errorMessage);
		return;
	}
}