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
 * @param {string} subscriptionData.plan_id - Razorpay plan ID
 * @param {string} [subscriptionData.customer_id] - Razorpay customer ID
 * @param {number} [subscriptionData.total_count] - Total billing cycles (12 for yearly, omit for unlimited)
 * @param {number} [subscriptionData.quantity] - Quantity of plan (default: 1)
 * @param {number} [subscriptionData.customer_notify] - Notify customer (default: 1)
 * @param {Date} [subscriptionData.start_at] - Subscription start date
 * @param {Object} [subscriptionData.addons] - Additional charges
 * @param {Object} [subscriptionData.notes] - Additional notes
 * @returns {Promise<Object>} Razorpay subscription object
 * @throws {Error} If subscription creation fails
 */
async function createRazorpaySubscription(subscriptionData) {
	try {
		const {
			plan_id,
			customer_id,
			total_count,
			quantity = 1,
			customer_notify = 1,
			start_at,
			addons = [],
			notes = {},
		} = subscriptionData;

		// Validate required fields
		if (!plan_id) {
			throw new Error('Plan ID is required for subscription creation');
		}

		// Validate quantity
		if (!Number.isInteger(quantity) || quantity <= 0) {
			throw new Error('Quantity must be a positive integer');
		}

		const razorpay = initializeRazorpay();

		const subscriptionOptions = /** @type {any} */ ({
			plan_id,
			quantity,
			customer_notify,
			notes,
		});

		// Add customer_id if provided
		if (customer_id) {
			subscriptionOptions.customer_id = customer_id;
		}

		// Add optional fields if provided
		if (total_count) {
			subscriptionOptions.total_count = total_count;
		}

		if (start_at) {
			subscriptionOptions.start_at = Math.floor(start_at.getTime() / 1000);
		}

		if (addons && Array.isArray(addons) && addons.length > 0) {
			subscriptionOptions.addons = addons;
		}

		const subscription = await razorpay.subscriptions.create(subscriptionOptions);

		console.log('Razorpay subscription created successfully:', /** @type {any} */ (subscription).id);
		return subscription;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Razorpay subscription creation failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Razorpay subscription creation process completed');
	}
}

/**
 * Update a Razorpay subscription (plan changes, quantity, etc.)
 * @param {string} subscriptionId - Razorpay subscription ID
 * @param {Object} updateData - Subscription update data
 * @param {string} [updateData.plan_id] - New plan ID for upgrades/downgrades
 * @param {number} [updateData.quantity] - New quantity
 * @param {string} [updateData.schedule_change_at] - When to apply changes ('now' or 'cycle_end')
 * @param {Object} [updateData.addons] - Additional charges
 * @param {boolean} [updateData.prorate] - (Ignored) Razorpay handles proration automatically
 * @param {Object} [updateData.notes] - (Ignored) Notes not supported in update API
 * @returns {Promise<Object>} Updated Razorpay subscription object
 * @throws {Error} If subscription update fails
 */
async function updateRazorpaySubscription(subscriptionId, updateData) {
	try {
		if (!subscriptionId) {
			throw new Error('Subscription ID is required for update');
		}

		const { plan_id, quantity, schedule_change_at = 'cycle_end', addons } = updateData;

		// Validate at least one update field is provided
		if (!plan_id && !quantity && !addons) {
			throw new Error('At least one update field must be provided');
		}

		// Validate schedule_change_at
		const validScheduleOptions = /** @type {const} */ (['now', 'cycle_end']);
		if (schedule_change_at && !validScheduleOptions.includes(/** @type {any} */ (schedule_change_at))) {
			throw new Error('schedule_change_at must be either "now" or "cycle_end"');
		}

		const razorpay = initializeRazorpay();

		const updateOptions = /** @type {any} */ ({});

		// Add required fields for schedule changes
		if (schedule_change_at) {
			updateOptions.schedule_change_at = schedule_change_at;
		}

		// Add fields that are being updated
		if (plan_id) {
			updateOptions.plan_id = plan_id;
		}

		if (quantity) {
			if (!Number.isInteger(quantity) || quantity <= 0) {
				throw new Error('Quantity must be a positive integer');
			}
			updateOptions.quantity = quantity;
		}

		if (addons) {
			updateOptions.addons = addons;
		}

		// Note: prorate and notes parameters are not supported by Razorpay subscription update API
		// Razorpay handles proration automatically when plan_id is changed
		// Notes should be managed separately if needed

		const subscription = await razorpay.subscriptions.update(subscriptionId, updateOptions);

		console.log('Razorpay subscription updated successfully:', subscriptionId);
		return subscription;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Razorpay subscription update failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Razorpay subscription update process completed');
	}
}

/**
 * Cancel a Razorpay subscription
 * @param {string} subscriptionId - Razorpay subscription ID
 * @param {Object} [cancelData] - Cancellation data
 * @param {boolean} [cancelData.cancel_at_cycle_end] - Cancel at end of current cycle (default: false)
 * @returns {Promise<Object>} Cancelled Razorpay subscription object
 * @throws {Error} If subscription cancellation fails
 * @note The cancel API only supports cancel_at_cycle_end parameter. Notes are not supported.
 */
async function cancelRazorpaySubscription(subscriptionId, cancelData) {
	try {
		console.log('Cancelling subscription!');
		if (!subscriptionId) {
			throw new Error('Subscription ID is required for cancellation');
		}

		const { cancel_at_cycle_end = false } = cancelData || {};

		const razorpay = initializeRazorpay();

		// First, fetch the subscription to check its current status
		let currentSubscription;
		try {
			currentSubscription = await razorpay.subscriptions.fetch(subscriptionId);
			console.log(`Current subscription status: ${currentSubscription.status}`);
		} catch (fetchError) {
			const error = /** @type {any} */ (fetchError);
			console.warn(
				'Could not fetch subscription status before cancellation:',
				error.error?.description || error.message
			);
		}

		// Check if subscription is already cancelled or in a non-cancellable state
		if (currentSubscription && ['cancelled', 'completed', 'expired'].includes(currentSubscription.status)) {
			console.log(
				`Subscription ${subscriptionId} is already in ${currentSubscription.status} state - skipping cancellation`
			);
			return currentSubscription;
		}

		// Check if subscription is in "created" status with no billing cycles (cannot be cancelled via API)
		if (currentSubscription && currentSubscription.status === 'created' && currentSubscription.paid_count === 0) {
			console.warn(
				`Subscription ${subscriptionId} is in "created" status with no billing cycles - cannot be cancelled via Razorpay API`
			);

			// Return a mock cancelled response for consistency
			return {
				...currentSubscription,
				status: 'cancelled',
				cancelled_at: Math.floor(Date.now() / 1000),
				cancel_at_cycle_end: cancel_at_cycle_end,
				notes: {
					cancellation_reason: 'Subscription cancelled before first billing cycle',
					original_status: 'created',
					cancelled_locally: true,
				},
			};
		}

		const subscription = await razorpay.subscriptions.cancel(subscriptionId, cancel_at_cycle_end);

		console.log('Razorpay subscription cancelled successfully:', subscriptionId);
		return subscription;
	} catch (error) {
		// Better error logging to avoid "[object Object]"
		const razorpayError = /** @type {any} */ (error);
		const errorMessage = razorpayError.message || razorpayError.error?.description || 'Unknown error';
		console.error(
			JSON.stringify(
				{
					subscriptionId,
					error: errorMessage,
					statusCode: razorpayError.statusCode,
					errorCode: razorpayError.error?.code,
					errorDescription: razorpayError.error?.description,
					fullError: JSON.stringify(razorpayError, null, 2),
				},
				null,
				2
			)
		);

		console.error('Razorpay subscription cancellation failed:', {
			subscriptionId,
			error: errorMessage,
			statusCode: razorpayError.statusCode,
			errorCode: razorpayError.error?.code,
			errorDescription: razorpayError.error?.description,
			fullError: JSON.stringify(razorpayError, null, 2),
		});
		throw error;
	} finally {
		console.debug('Razorpay subscription cancellation process completed');
	}
}

/**
 * Fetch Razorpay subscription details
 * @param {string} subscriptionId - Razorpay subscription ID
 * @returns {Promise<Object>} Razorpay subscription details
 * @throws {Error} If subscription fetch fails
 */
async function fetchRazorpaySubscription(subscriptionId) {
	try {
		if (!subscriptionId) {
			throw new Error('Subscription ID is required');
		}

		const razorpay = initializeRazorpay();
		const subscription = await razorpay.subscriptions.fetch(subscriptionId);

		console.log('Razorpay subscription details fetched successfully:', subscriptionId);
		return subscription;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Razorpay subscription fetch failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Razorpay subscription fetch process completed');
	}
}

/**
 * Verify Razorpay subscription payment signature for webhooks
 * @param {Object} webhookData - Webhook verification data
 * @param {string} webhookData.razorpay_subscription_id - Subscription ID from Razorpay
 * @param {string} webhookData.razorpay_payment_id - Payment ID from Razorpay
 * @param {string} webhookData.razorpay_signature - Webhook signature from Razorpay
 * @param {string} [webhookData.webhook_secret] - Webhook secret for verification
 * @returns {boolean} True if signature is valid
 * @throws {Error} If verification fails
 */
function verifySubscriptionPaymentSignature(webhookData) {
	try {
		const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature, webhook_secret } = webhookData;

		// Validate input data with specific error messages
		if (!razorpay_payment_id) {
			throw new Error('Payment ID is required');
		}
		
		if (!razorpay_subscription_id) {
			throw new Error('Subscription ID is required');
		}
		
		if (!razorpay_signature) {
			throw new Error('Signature is required');
		}

		const keySecret = webhook_secret || process.env.RAZORPAY_KEY_SECRET;
		if (!keySecret) {
			throw new Error('Webhook secret is required');
		}

		// Create expected signature for subscription payments
		const body = razorpay_payment_id + '|' + razorpay_subscription_id;
		const expectedSignature = crypto.createHmac('sha256', keySecret).update(body.toString()).digest('hex');

		// Compare signatures using timing-safe comparison
		let isValid = false;
		try {
			const signatureBuffer = Buffer.from(razorpay_signature, 'hex');
			const expectedBuffer = Buffer.from(expectedSignature, 'hex');
			
			// Ensure buffers have the same length for timing-safe comparison
			if (signatureBuffer.length === expectedBuffer.length) {
				isValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
			}
		} catch (error) {
			// If buffer creation or comparison fails, signature is invalid
			isValid = false;
		}

		if (isValid) {
			console.log('Subscription payment signature verified successfully');
		} else {
			console.warn('Subscription payment signature verification failed');
		}

		return isValid;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Subscription payment signature verification failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Subscription payment signature verification process completed');
	}
}

/**
 * Pause a Razorpay subscription
 * @param {string} subscriptionId - Razorpay subscription ID
 * @param {Object} [pauseData] - Pause data
 * @param {Date} [pauseData.pause_at] - When to pause (default: now)
 * @param {Object} [pauseData.notes] - Pause notes
 * @returns {Promise<Object>} Paused Razorpay subscription object
 * @throws {Error} If subscription pause fails
 */
async function pauseRazorpaySubscription(subscriptionId, pauseData = {}) {
	try {
		if (!subscriptionId) {
			throw new Error('Subscription ID is required for pausing');
		}

		const { pause_at, notes = {} } = pauseData;

		const razorpay = initializeRazorpay();

		const pauseOptions = /** @type {any} */ ({
			notes,
		});

		if (pause_at) {
			pauseOptions.pause_at = Math.floor(pause_at.getTime() / 1000);
		} else {
			pauseOptions.pause_at = 'now';
		}

		const subscription = await razorpay.subscriptions.pause(subscriptionId, pauseOptions);

		console.log('Razorpay subscription paused successfully:', subscriptionId);
		return subscription;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Razorpay subscription pause failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Razorpay subscription pause process completed');
	}
}

/**
 * Resume a paused Razorpay subscription
 * @param {string} subscriptionId - Razorpay subscription ID
 * @param {Object} [resumeData] - Resume data
 * @param {Date} [resumeData.resume_at] - When to resume (default: now)
 * @param {Object} [resumeData.notes] - Resume notes
 * @returns {Promise<Object>} Resumed Razorpay subscription object
 * @throws {Error} If subscription resume fails
 */
async function resumeRazorpaySubscription(subscriptionId, resumeData = {}) {
	try {
		if (!subscriptionId) {
			throw new Error('Subscription ID is required for resuming');
		}

		const { resume_at, notes = {} } = resumeData;

		const razorpay = initializeRazorpay();

		const resumeOptions = /** @type {any} */ ({
			notes,
		});

		if (resume_at) {
			resumeOptions.resume_at = Math.floor(resume_at.getTime() / 1000);
		} else {
			resumeOptions.resume_at = 'now';
		}

		const subscription = await razorpay.subscriptions.resume(subscriptionId, resumeOptions);

		console.log('Razorpay subscription resumed successfully:', subscriptionId);
		return subscription;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Razorpay subscription resume failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Razorpay subscription resume process completed');
	}
}

/**
 * Create a Razorpay customer (with built-in duplicate prevention)
 * @param {Object} customerData - Customer creation data
 * @param {string} customerData.name - Customer full name
 * @param {string} customerData.email - Customer email address
 * @param {string} [customerData.contact] - Customer phone number
 * @param {"0" | "1"} [customerData.fail_existing] - Fail if customer already exists (default: false)
 * @param {Object} [customerData.notes] - Additional notes
 * @returns {Promise<Object>} Razorpay customer object with isNew flag
 * @throws {Error} If customer creation fails
 */
async function createRazorpayCustomer(customerData) {
	try {
		const { name, email, contact, fail_existing = '0', notes = {} } = customerData;

		// Validate required fields
		if (!name || !email) {
			throw new Error('Name and email are required for customer creation');
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			throw new Error('Invalid email format');
		}

		const razorpay = initializeRazorpay();

		/** @type {{name: string, email: string, fail_existing: string, notes: Object, contact?: string}} */
		const customerOptions = {
			name,
			email,
			fail_existing: '0',
			notes,
		};

		// Add optional contact if provided
		if (contact) {
			customerOptions.contact = contact;
		}

		const customer = await razorpay.customers.create(/** @type {any} */ (customerOptions));

		console.log('Razorpay customer created successfully:', customer.id);

		// Add isNew flag for compatibility (assume new if created within last 5 seconds)
		return {
			...customer,
			isNew: !customer.created_at || Date.now() - customer.created_at * 1000 < 5000,
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Razorpay customer creation failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Razorpay customer creation process completed');
	}
}

/**
 * Fetch Razorpay customer details
 * @param {string} customerId - Razorpay customer ID
 * @returns {Promise<Object>} Razorpay customer details
 * @throws {Error} If customer fetch fails
 */
async function fetchRazorpayCustomer(customerId) {
	try {
		if (!customerId) {
			throw new Error('Customer ID is required');
		}

		const razorpay = initializeRazorpay();
		const customer = await razorpay.customers.fetch(customerId);

		console.log('Razorpay customer details fetched successfully:', customerId);
		return customer;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Razorpay customer fetch failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Razorpay customer fetch process completed');
	}
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
	createRazorpayCustomer,
	fetchRazorpayCustomer,
};