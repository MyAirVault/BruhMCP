/**
 * Create a new subscription
 * Handles both free and paid subscription creation with Razorpay integration
 */

const { pool } = require('../../../db/config.js');
const { getPlanByCode, getRazorpayPlanId } = require('../../../data/subscription-plans.js');
const { createRazorpayCustomer, createRazorpaySubscription } = require('../../../utils/razorpay/razorpay.js');

/**
 * Create a new subscription
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
async function createSubscription(req, res) {
	try {
		const userId = req.user?.userId;
		if (!userId) {
			res.status(401).json({
				success: false,
				message: 'User authentication required',
			});
			return;
		}
		const { planCode, billingCycle = 'monthly' } = req.body;

		// Free plan handling
		if (planCode === 'free') {
			const { createFreeSubscription } = require('../../../utils/razorpay/subscriptionLimits.js');
			const subscription = await createFreeSubscription(userId);
			const subscriptionData = subscription;
			
			res.json({
				success: true,
				message: 'Free subscription activated successfully',
				data: {
					subscriptionId: (subscriptionData && typeof subscriptionData === 'object' && 'id' in subscriptionData) ? subscriptionData.id : 'free',
					razorpayOrderId: null,
					amount: 0,
					currency: 'INR',
				},
			});
			return;
		}

		// Validate plan exists
		const plan = getPlanByCode(planCode);
		if (!plan) {
			res.status(400).json({
				success: false,
				message: 'Invalid subscription plan',
			});
			return;
		}

		// Get Razorpay plan ID for paid plans
		const razorpayPlanId = getRazorpayPlanId(planCode, billingCycle);
		if (!razorpayPlanId) {
			res.status(400).json({
				success: false,
				message: 'Plan not available for selected billing cycle',
			});
			return;
		}

		// Get user details from PostgreSQL
		const client = await pool.connect();
		const userResult = await client.query(
			'SELECT id, first_name, last_name, email, NULL as phone FROM users WHERE id = $1',
			[userId]
		);

		if (userResult.rows.length === 0) {
			client.release();
			res.status(404).json({
				success: false,
				message: 'User not found',
			});
			return;
		}

		const user = userResult.rows[0];

		// Check for existing subscription
		const existingResult = await client.query(
			'SELECT id, plan_code, status FROM user_subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
			[userId]
		);

		let customerId = null;
		if (existingResult.rows.length > 0) {
			const currentSub = existingResult.rows[0];
			
			// Check if already subscribed to same plan
			if (currentSub.plan_code === planCode && ['active', 'created', 'authenticated'].includes(currentSub.status)) {
				client.release();
				res.status(400).json({
					success: false,
					message: 'User is already subscribed to this plan',
				});
				return;
			}
		}

		// Create Razorpay customer
		const customer = await createRazorpayCustomer({
			name: `${user.first_name} ${user.last_name}`,
			email: user.email,
			contact: user.phone || undefined, // Phone will be null from query
		});
		const customerData = customer;
		customerId = (customerData && typeof customerData === 'object' && 'id' in customerData) ? customerData.id : null;

		// Calculate amounts and dates
		const planData = plan;
		const amount = billingCycle === 'yearly' 
			? (planData && typeof planData === 'object' && 'price_yearly' in planData ? planData.price_yearly : 0)
			: (planData && typeof planData === 'object' && 'price_monthly' in planData ? planData.price_monthly : 0);
		const currentPeriodStart = new Date();
		const currentPeriodEnd = new Date();
		if (billingCycle === 'yearly') {
			currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
		} else {
			currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
		}

		// Create Razorpay subscription
		const razorpaySubscription = await createRazorpaySubscription({
			plan_id: razorpayPlanId,
			customer_id: customerId,
			total_count: billingCycle === 'yearly' ? 10 : 120, // 10 years for yearly, 10 years for monthly
			notes: {
				user_id: userId,
				plan_code: planCode,
				billing_cycle: billingCycle,
			},
		});

		const razorpaySubscriptionData = razorpaySubscription;

		// Create subscription in database
		const subscriptionResult = await client.query(
			`INSERT INTO user_subscriptions (
				user_id, plan_code, razorpay_subscription_id, razorpay_customer_id,
				status, billing_cycle, current_period_start, current_period_end,
				total_amount, auto_renewal
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
			RETURNING id`,
			[
				userId,
				planCode,
				(razorpaySubscriptionData && typeof razorpaySubscriptionData === 'object' && 'id' in razorpaySubscriptionData) ? razorpaySubscriptionData.id : null,
				customerId,
				'created', // Will be updated to 'active' by webhook
				billingCycle,
				currentPeriodStart,
				currentPeriodEnd,
				amount,
				true
			]
		);

		client.release();

		res.json({
			success: true,
			message: 'Subscription created successfully',
			data: {
				subscriptionId: subscriptionResult.rows[0].id,
				razorpayOrderId: (razorpaySubscriptionData && typeof razorpaySubscriptionData === 'object' && 'id' in razorpaySubscriptionData) ? razorpaySubscriptionData.id : null,
				amount: amount,
				currency: 'INR',
			},
		});
		
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Failed to create subscription:', errorMessage);

		res.status(500).json({
			success: false,
			message: 'Failed to create subscription',
		});
	} finally {
		console.debug('Create subscription process completed');
	}
}

module.exports = createSubscription;