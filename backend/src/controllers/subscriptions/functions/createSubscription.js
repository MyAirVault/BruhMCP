/**
 * Create new subscription with Razorpay payment processing
 * Handles both free and paid subscription creation with comprehensive error handling
 */

const { pool } = require('../../../db/config.js');
const { getPlanByCode, getRazorpayPlanId, isValidPlanCode, isValidBillingCycle } = require('../../../data/subscription-plans.js');
const { 
    createRazorpayCustomer, 
    createRazorpaySubscription, 
    fetchRazorpayCustomer,
    cancelRazorpaySubscription 
} = require('../../../utils/razorpay/razorpay.js');
const { RAZORPAY_KEY_ID } = require('../../../config/env.js');

/**
 * @typedef {Object} TransactionData
 * @property {string} userId
 * @property {number} subscriptionId
 * @property {string} transactionType
 * @property {number} amount
 * @property {string} status
 * @property {string} description
 * @property {string|null} [razorpayPaymentId]
 * @property {string|null} [razorpayOrderId]
 * @property {string|null} [method]
 * @property {Object|null} [methodDetails]
 * @property {Object|null} [gatewayResponse]
 */

/**
 * @typedef {Object} DatabaseSubscription
 * @property {number} id
 * @property {string} status
 * @property {string} plan_code
 * @property {string|null} razorpay_subscription_id
 */

/**
 * @typedef {Object} RazorpayCustomerResponse
 * @property {string} id
 * @property {boolean} [isNew]
 */

/**
 * @typedef {Object} RazorpaySubscriptionResponse
 * @property {string} id
 * @property {string} [short_url]
 * @property {string} status
 */

/**
 * @typedef {Object} PlanConfig
 * @property {string} name
 * @property {string} description
 * @property {string[]} features
 * @property {Object} limits
 * @property {number} price_monthly
 * @property {number} price_yearly
 * @property {string} price_currency
 * @property {number} trial_days
 * @property {boolean} is_featured
 */

/**
 * Record subscription transaction in PostgreSQL
 * @param {TransactionData} transactionData - Transaction data to record
 * @param {import('pg').PoolClient} [existingClient] - Optional existing database client to reuse transaction
 * @returns {Promise<number>} Transaction ID
 * @throws {Error} If transaction recording fails
 */
async function recordSubscriptionTransaction(transactionData, existingClient = undefined) {
    try {
        const {
            userId,
            subscriptionId,
            transactionType,
            amount,
            status,
            description,
            razorpayPaymentId = null,
            razorpayOrderId = null,
            method = null,
            methodDetails = null,
            gatewayResponse = null
        } = transactionData;

        const client = existingClient || await pool.connect();
        
        const result = await client.query(
            `INSERT INTO subscription_transactions (
                user_id, subscription_id, transaction_type, amount, tax_amount, 
                discount_amount, fee_amount, net_amount, currency, status,
                method, method_details_json, description, razorpay_payment_id,
                razorpay_order_id, gateway_response_json
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING id`,
            [
                userId,
                subscriptionId,
                transactionType,
                amount,
                0, // tax_amount
                0, // discount_amount
                0, // fee_amount
                amount, // net_amount
                'INR',
                status,
                method,
                methodDetails ? JSON.stringify(methodDetails) : null,
                description,
                razorpayPaymentId,
                razorpayOrderId,
                gatewayResponse ? JSON.stringify(gatewayResponse) : null
            ]
        );

        if (!existingClient) {
            client.release();
        }
        return result.rows[0].id;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to record subscription transaction:', errorMessage);
        throw error;
    } finally {
        console.debug('Subscription transaction recording process completed');
    }
}

/**
 * Extend existing subscription with additional billing period
 * @param {string} userId - User ID
 * @param {DatabaseSubscription} existingSubscription - Existing subscription to extend
 * @param {string} planCode - Plan code (should match existing)
 * @param {string} billingCycle - Billing cycle
 * @param {number} amount - Subscription amount
 * @param {PlanConfig} planConfig - Plan configuration
 * @param {string | null} razorpayPlanId - Razorpay plan ID
 * @returns {Promise<Object>} Extension result
 */
async function extendExistingSubscription(userId, existingSubscription, planCode, billingCycle, amount, planConfig, razorpayPlanId) {
    try {
        if (amount === 0) {
            // Handle free plan extension - just extend the period
            const client = await pool.connect();
            
            try {
                await client.query('BEGIN');

                // Calculate new end date from current end date
                const currentEndDate = new Date(existingSubscription.current_period_end);
                const newEndDate = new Date(currentEndDate);
                if (billingCycle === 'yearly') {
                    newEndDate.setFullYear(currentEndDate.getFullYear() + 1);
                } else {
                    newEndDate.setMonth(currentEndDate.getMonth() + 1);
                }

                // Update existing subscription with extended period
                await client.query(
                    `UPDATE user_subscriptions 
                     SET current_period_end = $1, next_billing_date = $2, updated_at = CURRENT_TIMESTAMP
                     WHERE id = $3`,
                    [newEndDate.toISOString(), newEndDate.toISOString(), existingSubscription.id]
                );

                // Record extension transaction
                const transactionId = await recordSubscriptionTransaction({
                    userId: userId,
                    subscriptionId: existingSubscription.id,
                    transactionType: 'subscription',
                    amount: 0,
                    status: 'captured',
                    description: `Free plan (${planConfig.name}) subscription extended`,
                    method: 'free_plan',
                    methodDetails: {
                        plan_code: planCode,
                        plan_name: planConfig.name,
                        billing_cycle: billingCycle,
                        activation_type: 'extension',
                        previous_end_date: existingSubscription.current_period_end,
                        new_end_date: newEndDate.toISOString()
                    }
                }, client);

                await client.query('COMMIT');

                return {
                    success: true,
                    message: `Subscription extended successfully. ${planConfig.name} plan extended until ${newEndDate.toDateString()}.`,
                    data: {
                        subscriptionId: existingSubscription.id,
                        planName: planConfig.name,
                        amount: 0,
                        status: 'active',
                        requiresPayment: false,
                        wasExtended: true,
                        previousEndDate: existingSubscription.current_period_end,
                        newEndDate: newEndDate.toISOString(),
                        transactionId: transactionId,
                    },
                };
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        }

        // Handle paid plan extension - requires payment
        const client = await pool.connect();
        const userResult = await client.query(
            `SELECT (first_name || ' ' || last_name) as name, email, NULL as phone, razorpay_customer_id 
             FROM users WHERE id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            client.release();
            throw new Error('User not found');
        }

        const userDetails = userResult.rows[0];

        // Get or create Razorpay customer
        /** @type {RazorpayCustomerResponse} */
        let razorpayCustomer;
        if (userDetails.razorpay_customer_id) {
            try {
                const fetchedCustomer = await fetchRazorpayCustomer(userDetails.razorpay_customer_id);
                razorpayCustomer = /** @type {RazorpayCustomerResponse} */ (fetchedCustomer);
                razorpayCustomer.isNew = false;
            } catch (fetchError) {
                const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
                console.warn('Failed to fetch existing customer, creating new one:', errorMessage);
                const newCustomer = await createRazorpayCustomer({
                    name: userDetails.name,
                    email: userDetails.email,
                    contact: userDetails.phone || undefined,
                    notes: {
                        user_id: userId.toString(),
                        created_for: 'subscription_extension',
                    },
                });
                razorpayCustomer = /** @type {RazorpayCustomerResponse} */ (newCustomer);
                razorpayCustomer.isNew = true;
            }
        } else {
            const newCustomer = await createRazorpayCustomer({
                name: userDetails.name,
                email: userDetails.email,
                contact: userDetails.phone || undefined,
                notes: {
                    user_id: userId.toString(),
                    created_for: 'subscription_extension',
                },
            });
            razorpayCustomer = /** @type {RazorpayCustomerResponse} */ (newCustomer);
            razorpayCustomer.isNew = true;
        }

        // Update user record with customer ID if it's new
        if (razorpayCustomer.isNew) {
            await client.query(
                `UPDATE users SET razorpay_customer_id = $1 WHERE id = $2`,
                [razorpayCustomer.id, userId]
            );
        }

        // Create new Razorpay subscription for extension
        const subscriptionResult = await createRazorpaySubscription({
            plan_id: /** @type {string} */ (razorpayPlanId),
            customer_id: razorpayCustomer.id,
            total_count: billingCycle === 'yearly' ? 1 : 12,
            quantity: 1,
            customer_notify: 1,
            notes: {
                user_id: userId.toString(),
                plan_code: planCode,
                billing_cycle: billingCycle,
                plan_name: planConfig.name,
                customer_id: razorpayCustomer.id,
                extended_subscription_id: existingSubscription.id.toString(),
                is_extension: 'true',
            },
        });
        /** @type {RazorpaySubscriptionResponse} */
        const subscription = /** @type {RazorpaySubscriptionResponse} */ (subscriptionResult);

        try {
            await client.query('BEGIN');

            // Calculate new end date from current end date
            const currentEndDate = new Date(existingSubscription.current_period_end);
            const newEndDate = new Date(currentEndDate);
            if (billingCycle === 'yearly') {
                newEndDate.setFullYear(currentEndDate.getFullYear() + 1);
            } else {
                newEndDate.setMonth(currentEndDate.getMonth() + 1);
            }

            // Update existing subscription with extended period and new Razorpay subscription ID
            await client.query(
                `UPDATE user_subscriptions 
                 SET current_period_end = $1, next_billing_date = $2, 
                     total_amount = total_amount + $3, razorpay_subscription_id = $4, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $5`,
                [newEndDate.toISOString(), newEndDate.toISOString(), amount, subscription.id, existingSubscription.id]
            );

            // Record extension transaction (will be updated to 'captured' by webhooks)
            const transactionId = await recordSubscriptionTransaction({
                userId: userId,
                subscriptionId: existingSubscription.id,
                transactionType: 'subscription',
                amount: amount,
                status: 'created',
                description: `Paid plan (${planConfig.name}) subscription extended`,
                method: 'razorpay_subscription',
                methodDetails: {
                    plan_code: planCode,
                    plan_name: planConfig.name,
                    billing_cycle: billingCycle,
                    activation_type: 'extension',
                    previous_end_date: existingSubscription.current_period_end,
                    new_end_date: newEndDate.toISOString(),
                    razorpay_subscription_id: subscription.id,
                    razorpay_customer_id: razorpayCustomer.id
                },
                gatewayResponse: {
                    razorpay_subscription_id: subscription.id,
                    razorpay_plan_id: razorpayPlanId,
                    customer_id: razorpayCustomer.id
                }
            }, client);

            await client.query('COMMIT');

            return {
                success: true,
                message: `Subscription extended successfully. ${planConfig.name} plan extended until ${newEndDate.toDateString()}.`,
                data: {
                    razorpayKeyId: RAZORPAY_KEY_ID,
                    subscriptionId: existingSubscription.id,
                    razorpaySubscriptionId: subscription.id,
                    razorpayCustomerId: razorpayCustomer.id,
                    planName: planConfig.name,
                    billingCycle,
                    amount: amount,
                    trialDays: 0,
                    hasTrialPeriod: false,
                    nextBillingDate: newEndDate.toISOString(),
                    requiresPayment: true,
                    isSubscription: true,
                    subscriptionUrl: subscription.short_url,
                    status: 'created',
                    wasExtended: true,
                    previousEndDate: existingSubscription.current_period_end,
                    newEndDate: newEndDate.toISOString(),
                    transactionId: transactionId,
                },
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Subscription extension failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Subscription extension process completed');
    }
}

/**
 * Replace existing subscription with new one (atomic operation)
 * @param {string} userId - User ID
 * @param {DatabaseSubscription} existingSubscription - Existing subscription to replace
 * @param {string} newPlanCode - New plan code
 * @param {string} billingCycle - Billing cycle
 * @param {number} amount - Subscription amount
 * @param {PlanConfig} planConfig - Plan configuration
 * @param {string | null} razorpayPlanId - Razorpay plan ID
 * @returns {Promise<Object>} Replacement result
 */
async function replaceExistingSubscription(userId, existingSubscription, newPlanCode, billingCycle, amount, planConfig, razorpayPlanId) {
    try {
        // Cancel existing Razorpay subscription if it exists and is active
        if (existingSubscription.razorpay_subscription_id && ['active', 'authenticated', 'created'].includes(existingSubscription.status)) {
            try {
                await cancelRazorpaySubscription(existingSubscription.razorpay_subscription_id, {
                    cancel_at_cycle_end: false, // Cancel immediately
                });
                console.log(`Cancelled existing Razorpay subscription: ${existingSubscription.razorpay_subscription_id}`);
            } catch (cancelError) {
                const errorMessage = cancelError instanceof Error ? cancelError.message : String(cancelError);
                // Log error but continue - we'll mark as replaced in our DB
                console.warn('Failed to cancel existing Razorpay subscription:', errorMessage);
                console.log('Continuing with local subscription replacement');
            }
        }

        if (amount === 0) {
            // Handle free plan replacement - no payment required
            const currentDate = new Date();
            const nextYear = new Date(currentDate);
            nextYear.setFullYear(currentDate.getFullYear() + 1);

            const client = await pool.connect();
            
            try {
                await client.query('BEGIN');

                // Mark existing subscription as replaced
                await client.query(
                    `UPDATE user_subscriptions 
                     SET status = 'replaced', cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                     WHERE id = $1`,
                    [existingSubscription.id]
                );

                // Only record cancellation transaction if the existing subscription was actually active/paid
                // Don't create false cancellation records for subscriptions that were never activated
                if (['active', 'authenticated'].includes(existingSubscription.status)) {
                    await recordSubscriptionTransaction({
                        userId: userId,
                        subscriptionId: existingSubscription.id,
                        transactionType: 'adjustment',
                        amount: 0,
                        status: 'cancelled',
                        description: `Subscription replaced: ${existingSubscription.plan_code} to ${newPlanCode}`,
                        method: 'replacement',
                        methodDetails: {
                            old_plan_code: existingSubscription.plan_code,
                            new_plan_code: newPlanCode,
                            replacement_reason: 'plan_change'
                        }
                    }, client);
                }

                // Create new subscription
                const subscriptionResult = await client.query(
                    `INSERT INTO user_subscriptions (
                        user_id, plan_code, status, billing_cycle,
                        current_period_start, current_period_end, next_billing_date,
                        total_amount, auto_renewal
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING id`,
                    [
                        userId,
                        newPlanCode,
                        'active',
                        billingCycle,
                        currentDate.toISOString(),
                        nextYear.toISOString(),
                        nextYear.toISOString(),
                        0,
                        false // No auto-renewal for free plan
                    ]
                );

                // Record activation transaction for new free subscription
                const transactionId = await recordSubscriptionTransaction({
                    userId: userId,
                    subscriptionId: subscriptionResult.rows[0].id,
                    transactionType: 'subscription',
                    amount: 0,
                    status: 'captured',
                    description: `Free plan (${planConfig.name}) activation via replacement`,
                    method: 'free_plan',
                    methodDetails: {
                        plan_code: newPlanCode,
                        plan_name: planConfig.name,
                        billing_cycle: billingCycle,
                        activation_type: 'replacement',
                        replaced_subscription_id: existingSubscription.id
                    }
                }, client);

                await client.query('COMMIT');

                return {
                    success: true,
                    message: `Subscription replaced successfully. ${planConfig.name} plan activated.`,
                    data: {
                        subscriptionId: subscriptionResult.rows[0].id,
                        planName: planConfig.name,
                        amount: 0,
                        status: 'active',
                        requiresPayment: false,
                        wasReplaced: true,
                        previousPlan: existingSubscription.plan_code,
                        transactionId: transactionId,
                    },
                };
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        }

        // Handle paid plan replacement - requires payment
        // Get user details for customer creation
        const client = await pool.connect();
        const userResult = await client.query(
            `SELECT (first_name || ' ' || last_name) as name, email, NULL as phone, razorpay_customer_id 
             FROM users WHERE id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            client.release();
            throw new Error('User not found');
        }

        const userDetails = userResult.rows[0];

        // Get or create Razorpay customer
        /** @type {RazorpayCustomerResponse} */
        let razorpayCustomer;
        if (userDetails.razorpay_customer_id) {
            try {
                const fetchedCustomer = await fetchRazorpayCustomer(userDetails.razorpay_customer_id);
                razorpayCustomer = /** @type {RazorpayCustomerResponse} */ (fetchedCustomer);
                razorpayCustomer.isNew = false;
            } catch (fetchError) {
                const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
                console.warn('Failed to fetch existing customer, creating new one:', errorMessage);
                const newCustomer = await createRazorpayCustomer({
                    name: userDetails.name,
                    email: userDetails.email,
                    contact: userDetails.phone || undefined,
                    notes: {
                        user_id: userId.toString(),
                        created_for: 'subscription_replacement',
                    },
                });
                razorpayCustomer = /** @type {RazorpayCustomerResponse} */ (newCustomer);
                razorpayCustomer.isNew = true;
            }
        } else {
            const newCustomer = await createRazorpayCustomer({
                name: userDetails.name,
                email: userDetails.email,
                contact: userDetails.phone || undefined,
                notes: {
                    user_id: userId.toString(),
                    created_for: 'subscription_replacement',
                },
            });
            razorpayCustomer = /** @type {RazorpayCustomerResponse} */ (newCustomer);
            razorpayCustomer.isNew = true;
        }

        // Update user record with customer ID if it's new
        if (razorpayCustomer.isNew) {
            await client.query(
                `UPDATE users SET razorpay_customer_id = $1 WHERE id = $2`,
                [razorpayCustomer.id, userId]
            );
        }

        // Create new Razorpay subscription
        const subscriptionResult = await createRazorpaySubscription({
            plan_id: /** @type {string} */ (razorpayPlanId),
            customer_id: razorpayCustomer.id,
            total_count: billingCycle === 'yearly' ? 1 : 12,
            quantity: 1,
            customer_notify: 1,
            notes: {
                user_id: userId.toString(),
                plan_code: newPlanCode,
                billing_cycle: billingCycle,
                plan_name: planConfig.name,
                customer_id: razorpayCustomer.id,
                replaced_subscription_id: existingSubscription.id.toString(),
                is_replacement: 'true',
            },
        });
        /** @type {RazorpaySubscriptionResponse} */
        const subscription = /** @type {RazorpaySubscriptionResponse} */ (subscriptionResult);

        // Atomic replacement transaction
        const currentDate = new Date();
        const periodEnd = new Date(currentDate);
        if (billingCycle === 'yearly') {
            periodEnd.setFullYear(currentDate.getFullYear() + 1);
        } else {
            periodEnd.setMonth(currentDate.getMonth() + 1);
        }

        try {
            await client.query('BEGIN');

            // Mark existing subscription as replaced
            await client.query(
                `UPDATE user_subscriptions 
                 SET status = 'replaced', cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1`,
                [existingSubscription.id]
            );

            // Only record cancellation transaction if the existing subscription was actually active/paid
            // Don't create false cancellation records for subscriptions that were never activated
            if (['active', 'authenticated'].includes(existingSubscription.status)) {
                await recordSubscriptionTransaction({
                    userId: userId,
                    subscriptionId: existingSubscription.id,
                    transactionType: 'adjustment',
                    amount: 0,
                    status: 'cancelled',
                    description: `Subscription replaced: ${existingSubscription.plan_code} to ${newPlanCode}`,
                    method: 'replacement',
                    methodDetails: {
                        old_plan_code: existingSubscription.plan_code,
                        new_plan_code: newPlanCode,
                        replacement_reason: 'plan_change',
                        old_razorpay_subscription_id: /** @type {any} */ (existingSubscription).razorpay_subscription_id
                    }
                }, client);
            }

            // Create new subscription
            const subscriptionResult = await client.query(
                `INSERT INTO user_subscriptions (
                    user_id, plan_code, status, billing_cycle,
                    current_period_start, current_period_end, next_billing_date,
                    trial_start, trial_end, total_amount, auto_renewal,
                    razorpay_subscription_id, razorpay_customer_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING id`,
                [
                    userId,
                    newPlanCode,
                    'created',
                    billingCycle,
                    currentDate.toISOString(),
                    periodEnd.toISOString(),
                    periodEnd.toISOString(),
                    null, // trial_start
                    null, // trial_end
                    amount,
                    true, // auto_renewal
                    subscription.id,
                    razorpayCustomer.id
                ]
            );

            // Record subscription creation transaction (will be updated to 'captured' by webhooks)
            const transactionId = await recordSubscriptionTransaction({
                userId: userId,
                subscriptionId: subscriptionResult.rows[0].id,
                transactionType: 'subscription',
                amount: amount,
                status: 'created',
                description: `Paid plan (${planConfig.name}) subscription replacement`,
                method: 'razorpay_subscription',
                methodDetails: {
                    plan_code: newPlanCode,
                    plan_name: planConfig.name,
                    billing_cycle: billingCycle,
                    activation_type: 'replacement',
                    replaced_subscription_id: existingSubscription.id,
                    razorpay_subscription_id: subscription.id,
                    razorpay_customer_id: razorpayCustomer.id
                },
                gatewayResponse: {
                    razorpay_subscription_id: subscription.id,
                    razorpay_plan_id: razorpayPlanId,
                    customer_id: razorpayCustomer.id
                }
            }, client);

            await client.query('COMMIT');

            return {
                success: true,
                message: `Subscription replaced successfully. Previous ${existingSubscription.plan_code} subscription cancelled and new ${planConfig.name} subscription created.`,
                data: {
                    razorpayKeyId: RAZORPAY_KEY_ID,
                    subscriptionId: subscriptionResult.rows[0].id,
                    razorpaySubscriptionId: subscription.id,
                    razorpayCustomerId: razorpayCustomer.id,
                    planName: planConfig.name,
                    billingCycle,
                    amount: amount,
                    trialDays: 0,
                    hasTrialPeriod: false,
                    nextBillingDate: periodEnd.toISOString(),
                    requiresPayment: true,
                    isSubscription: true,
                    subscriptionUrl: subscription.short_url,
                    status: 'created',
                    wasReplaced: true,
                    previousPlan: existingSubscription.plan_code,
                    transactionId: transactionId,
                },
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Subscription replacement failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Subscription replacement process completed');
    }
}

/**
 * Create new subscription with Razorpay payment processing
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
async function createSubscription(req, res) {
    try {
        const userId = /** @type {string | undefined} */ (req.user?.id);
        const { planCode, billingCycle = 'monthly' } = req.body;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Please log in to create a subscription.',
                code: 'AUTHENTICATION_REQUIRED',
            });
            return;
        }

        if (!planCode) {
            res.status(400).json({
                success: false,
                message: 'Please select a valid subscription plan.',
                code: 'PLAN_CODE_REQUIRED',
            });
            return;
        }

        if (!isValidPlanCode(planCode)) {
            res.status(400).json({
                success: false,
                message: 'Invalid plan code provided.',
                code: 'INVALID_PLAN_CODE',
            });
            return;
        }

        if (!isValidBillingCycle(billingCycle)) {
            res.status(400).json({
                success: false,
                message: 'Please select a valid billing cycle (monthly or yearly).',
                code: 'INVALID_BILLING_CYCLE',
            });
            return;
        }

        // Get plan configuration
        const planConfig = getPlanByCode(planCode);
        if (!planConfig || !planConfig.is_active) {
            res.status(404).json({
                success: false,
                message: 'Selected subscription plan not found or inactive.',
                code: 'PLAN_NOT_FOUND',
            });
            return;
        }

        // Calculate amount based on billing cycle
        const amount = billingCycle === 'yearly' ? planConfig.price_yearly : planConfig.price_monthly;

        // Get Razorpay plan ID for paid plans
        let razorpayPlanId = null;
        if (amount > 0) {
            try {
                razorpayPlanId = getRazorpayPlanId(planCode, billingCycle);

                if (!razorpayPlanId) {
                    res.status(500).json({
                        success: false,
                        message: `Razorpay plan ID not configured for ${planCode} ${billingCycle}. Please contact support.`,
                        code: 'RAZORPAY_PLAN_NOT_CONFIGURED',
                    });
                    return;
                }
            } catch (planError) {
                console.error('Failed to get Razorpay plan ID:', planError);
                res.status(500).json({
                    success: false,
                    message: 'Subscription plan configuration error. Please contact support.',
                    code: 'PLAN_CONFIGURATION_ERROR',
                });
                return;
            }
        }

        // Check for ANY existing subscription to enforce ONE subscription per user
        const client = await pool.connect();
        const existingResult = await client.query(
            `SELECT id, status, plan_code, razorpay_subscription_id FROM user_subscriptions 
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 1`,
            [userId]
        );
        const existingSubscription = existingResult.rows[0];

        // If user has existing subscription, replace it instead of creating duplicate
        if (existingSubscription) {
            console.log(`Replacing existing subscription for user ${userId}: ${existingSubscription.status} ${existingSubscription.plan_code}`);
            
            // If trying to purchase same plan that's already active, extend the duration
            // Note: 'created' status is NOT considered active - it means payment is pending
            if (existingSubscription.plan_code === planCode && ['active', 'authenticated'].includes(existingSubscription.status)) {
                console.log(`Extending existing subscription for user ${userId}: ${existingSubscription.plan_code}`);
                
                // Extend existing subscription instead of replacing
                try {
                    client.release();
                    const extensionResult = await extendExistingSubscription(userId, existingSubscription, planCode, billingCycle, amount, planConfig, razorpayPlanId);
                    res.json(extensionResult);
                    return;
                } catch (extensionError) {
                    console.error('Subscription extension failed:', extensionError);
                    throw new Error('Failed to extend existing subscription. Please try again.');
                }
            }
            
            // Replace existing subscription with new one
            try {
                client.release();
                const replacementResult = await replaceExistingSubscription(userId, existingSubscription, planCode, billingCycle, amount, planConfig, razorpayPlanId);
                res.json(replacementResult);
                return;
            } catch (replacementError) {
                console.error('Subscription replacement failed:', replacementError);
                throw new Error('Failed to replace existing subscription. Please try again.');
            }
        }

        if (amount === 0) {
            // Handle free plan - no payment required
            const currentDate = new Date();
            const nextYear = new Date(currentDate);
            nextYear.setFullYear(currentDate.getFullYear() + 1);

            try {
                await client.query('BEGIN');

                const subscriptionResult = await client.query(
                    `INSERT INTO user_subscriptions (
                        user_id, plan_code, status, billing_cycle,
                        current_period_start, current_period_end, next_billing_date,
                        total_amount, auto_renewal
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING id`,
                    [
                        userId,
                        planCode,
                        'active',
                        billingCycle,
                        currentDate.toISOString(),
                        nextYear.toISOString(),
                        nextYear.toISOString(),
                        0,
                        false // No auto-renewal for free plan
                    ]
                );

                // Record transaction for free plan activation
                const transactionId = await recordSubscriptionTransaction({
                    userId: userId,
                    subscriptionId: subscriptionResult.rows[0].id,
                    transactionType: 'subscription',
                    amount: 0,
                    status: 'captured',
                    description: `Free plan (${planConfig.name}) activation`,
                    method: 'free_plan',
                    methodDetails: {
                        plan_code: planCode,
                        plan_name: planConfig.name,
                        billing_cycle: billingCycle,
                        activation_type: 'free_plan'
                    }
                });

                await client.query('COMMIT');

                res.json({
                    success: true,
                    message: 'Free plan activated successfully',
                    data: {
                        subscriptionId: subscriptionResult.rows[0].id,
                        planName: planConfig.name,
                        amount: 0,
                        status: 'active',
                        requiresPayment: false,
                        transactionId: transactionId,
                    },
                });
                return;
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        }

        // Create Razorpay subscription for paid plans
        try {
            // Get user details for customer creation
            const userResult = await client.query(
                `SELECT (first_name || ' ' || last_name) as name, email, NULL as phone FROM users WHERE id = $1`,
                [userId]
            );

            if (userResult.rows.length === 0) {
                client.release();
                res.status(404).json({
                    success: false,
                    message: 'User not found. Please log in again.',
                    code: 'USER_NOT_FOUND',
                });
                return;
            }

            const userDetails = userResult.rows[0];

            // Get or create Razorpay customer
            /** @type {RazorpayCustomerResponse} */
            let razorpayCustomer;
            try {
                const customerResult = await createRazorpayCustomer({
                    name: userDetails.name,
                    email: userDetails.email,
                    contact: userDetails.phone || undefined,
                    notes: {
                        user_id: userId.toString(),
                        created_for: 'subscription',
                    },
                });
                razorpayCustomer = /** @type {RazorpayCustomerResponse} */ (customerResult);
                razorpayCustomer.isNew = true;
            } catch (customerError) {
                console.error('Failed to create Razorpay customer:', customerError);
                client.release();
                res.status(500).json({
                    success: false,
                    message: 'Failed to set up customer account with payment gateway. Please try again.',
                    code: 'CUSTOMER_CREATION_FAILED',
                });
                return;
            }

            // Update user record with Razorpay customer ID if it's a new customer
            if (razorpayCustomer.isNew) {
                await client.query(
                    `UPDATE users SET razorpay_customer_id = $1 WHERE id = $2`,
                    [razorpayCustomer.id, userId]
                );
            }

            // Create Razorpay subscription using the plan ID from configuration
            try {
                const subscriptionResult2 = await createRazorpaySubscription({
                    plan_id: /** @type {string} */ (razorpayPlanId), // Use plan ID from razorpay-plans.js configuration
                    customer_id: razorpayCustomer.id, // Link to customer
                    total_count: billingCycle === 'yearly' ? 1 : 12, // 1 cycle for yearly, 12 for monthly
                    quantity: 1,
                    customer_notify: 1,
                    notes: {
                        user_id: userId.toString(),
                        plan_code: planCode,
                        billing_cycle: billingCycle,
                        plan_name: planConfig.name,
                        customer_id: razorpayCustomer.id,
                    },
                });
                /** @type {RazorpaySubscriptionResponse} */
                const subscription = /** @type {RazorpaySubscriptionResponse} */ (subscriptionResult2);

                // Store subscription details in database with transaction recording
                const currentDate = new Date();
                const periodEnd = new Date(currentDate);
                if (billingCycle === 'yearly') {
                    periodEnd.setFullYear(currentDate.getFullYear() + 1);
                } else {
                    periodEnd.setMonth(currentDate.getMonth() + 1);
                }

                // No trial period - subscriptions are immediately active
                const trialStart = null;
                const trialEnd = null;

                try {
                    await client.query('BEGIN');

                    const subscriptionResult = await client.query(
                        `INSERT INTO user_subscriptions (
                            user_id, plan_code, status, billing_cycle,
                            current_period_start, current_period_end, next_billing_date,
                            trial_start, trial_end, total_amount, auto_renewal,
                            razorpay_subscription_id, razorpay_customer_id
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                        RETURNING id`,
                        [
                            userId,
                            planCode,
                            'created',
                            billingCycle,
                            currentDate.toISOString(),
                            periodEnd.toISOString(),
                            periodEnd.toISOString(),
                            trialStart,
                            trialEnd,
                            amount,
                            true,
                            subscription.id,
                            razorpayCustomer.id
                        ]
                    );

                    // Record subscription creation transaction (will be updated to 'captured' by webhooks)
                    const transactionId = await recordSubscriptionTransaction({
                        userId: userId,
                        subscriptionId: subscriptionResult.rows[0].id,
                        transactionType: 'subscription',
                        amount: amount,
                        status: 'created',
                        description: `Paid plan (${planConfig.name}) subscription creation`,
                        method: 'razorpay_subscription',
                        methodDetails: {
                            plan_code: planCode,
                            plan_name: planConfig.name,
                            billing_cycle: billingCycle,
                            activation_type: 'new_subscription',
                            razorpay_subscription_id: subscription.id,
                            razorpay_customer_id: razorpayCustomer.id
                        },
                        gatewayResponse: {
                            razorpay_subscription_id: subscription.id,
                            razorpay_plan_id: razorpayPlanId,
                            customer_id: razorpayCustomer.id,
                            subscription_url: subscription.short_url
                        }
                    });

                    await client.query('COMMIT');

                    res.json({
                        success: true,
                        message:
                            'Subscription created successfully. You will be charged automatically according to your billing cycle.',
                        data: {
                            razorpayKeyId: RAZORPAY_KEY_ID,
                            subscriptionId: subscriptionResult.rows[0].id,
                            razorpaySubscriptionId: subscription.id,
                            razorpayCustomerId: razorpayCustomer.id,
                            planName: planConfig.name,
                            billingCycle,
                            amount: amount,
                            trialDays: 0,
                            hasTrialPeriod: false,
                            nextBillingDate: periodEnd.toISOString(),
                            requiresPayment: true,
                            isSubscription: true,
                            subscriptionUrl: subscription.short_url,
                            status: 'created',
                            transactionId: transactionId,
                        },
                    });
                    return;
                } catch (dbError) {
                    await client.query('ROLLBACK');
                    throw dbError;
                } finally {
                    client.release();
                }
            } catch (subscriptionError) {
                const error = /** @type {unknown} */ (subscriptionError);
                const errorDetails = {
                    statusCode: /** @type {any} */ (error)?.statusCode,
                    status: /** @type {any} */ (error)?.status,
                    errorMessage: error instanceof Error ? error.message : String(error),
                    errorDescription: /** @type {any} */ (error)?.error?.description,
                    planCode: planCode,
                    razorpayPlanId: razorpayPlanId,
                };
                console.error('Razorpay subscription creation failed:', errorDetails);

                client.release();
                // If subscription creation fails, this indicates a configuration issue
                const errorMessage = /** @type {any} */ (error)?.error?.description || 
                    (error instanceof Error ? error.message : String(error));
                res.status(500).json({
                    success: false,
                    message: 'Failed to create subscription. Please contact support.',
                    code: 'SUBSCRIPTION_CREATION_FAILED',
                    details: errorMessage,
                });
                return;
            }
        } catch (error) {
            client.release();
            // Handle any other errors in subscription creation
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Subscription creation process failed:', errorMessage);

            // Check for authentication errors
            if (/** @type {any} */ (error).statusCode === 401) {
                console.error('Razorpay authentication failed - check API credentials');
                throw new Error('Payment gateway configuration error. Please contact support.');
            }

            // Check for specific Razorpay errors
            const errorDescription = /** @type {any} */ (error).error?.description || errorMessage || 'Unknown error';
            console.error('Razorpay error details:', errorDescription);

            throw new Error('Payment processing setup failed. Please try again.');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Create subscription failed:', errorMessage);

        res.status(500).json({
            success: false,
            message: errorMessage.includes('Payment processing')
                ? errorMessage
                : 'Failed to create subscription. Please try again later.',
            code: 'SUBSCRIPTION_CREATION_FAILED',
        });
    } finally {
        console.debug('Create subscription process completed');
    }
}

module.exports = createSubscription;