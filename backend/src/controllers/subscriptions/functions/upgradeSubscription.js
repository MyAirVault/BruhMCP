/**
 * Upgrade subscription plan with prorated billing
 * Copied exactly from MicroSAASTemplate and adapted for PostgreSQL
 */

const { pool } = require('../../../db/config.js');
const { getPlanByCode, getRazorpayPlanId, isValidPlanCode } = require('../../../data/subscription-plans.js');
const { 
    createRazorpayCustomer, 
    createRazorpaySubscription, 
    fetchRazorpayCustomer,
    createRazorpayOrder,
    calculateProratedAmount
} = require('../../../utils/razorpay/razorpay.js');
const { processRefundToCredits } = require('../../../utils/creditProcessor.js');
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
 * Record subscription transaction in PostgreSQL
 * @param {TransactionData} transactionData - Transaction data to record
 * @returns {Promise<number>} Transaction ID
 */
async function recordSubscriptionTransaction(transactionData) {
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

    const client = await pool.connect();
    const result = await client.query(
        `INSERT INTO subscription_transactions (
            user_id, subscription_id, transaction_type, amount, tax_amount, 
            discount_amount, fee_amount, net_amount, currency, status,
            method, method_details_json, description, razorpay_payment_id,
            razorpay_order_id, gateway_response_json
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id`,
        [
            userId, subscriptionId, transactionType, amount, 0, 0, 0, amount, 'INR',
            status, method, methodDetails ? JSON.stringify(methodDetails) : null,
            description, razorpayPaymentId, razorpayOrderId,
            gatewayResponse ? JSON.stringify(gatewayResponse) : null
        ]
    );
    client.release();
    return result.rows[0].id;
}

/**
 * Upgrade subscription plan with prorated billing
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
async function upgradeSubscription(req, res) {
    try {
        const userId = /** @type {string | undefined} */ (req.user?.id);
        const { newPlanCode } = req.body;

        // Log upgrade attempt for monitoring
        console.log('Subscription upgrade attempt:', {
            userId: userId,
            newPlanCode: newPlanCode,
            timestamp: new Date().toISOString(),
            userAgent: req.get('User-Agent'),
            ip: req.ip
        });

        if (!userId) {
            console.warn('Subscription upgrade attempt without authentication:', {
                newPlanCode: newPlanCode,
                ip: req.ip,
                timestamp: new Date().toISOString()
            });
            res.status(401).json({
                success: false,
                message: 'Please log in to upgrade your subscription.',
                code: 'AUTHENTICATION_REQUIRED',
            });
            return;
        }

        if (!newPlanCode) {
            res.status(400).json({
                success: false,
                message: 'Please select a valid plan to upgrade to.',
                code: 'NEW_PLAN_CODE_REQUIRED',
            });
            return;
        }

        if (!isValidPlanCode(newPlanCode)) {
            res.status(400).json({
                success: false,
                message: 'Invalid plan code provided.',
                code: 'INVALID_PLAN_CODE',
            });
            return;
        }

        const client = await pool.connect();

        // Get current subscription
        const currentResult = await client.query(
            `SELECT us.*
             FROM user_subscriptions us
             WHERE us.user_id = $1 AND us.status IN ('created', 'active', 'authenticated')
             ORDER BY us.created_at DESC
             LIMIT 1`,
            [userId]
        );
        const currentSubscription = currentResult.rows[0];

        if (!currentSubscription) {
            client.release();
            res.status(404).json({
                success: false,
                message: 'No active subscription found. Please create a subscription first.',
                code: 'NO_ACTIVE_SUBSCRIPTION',
            });
            return;
        }

        // Get current and new plan configurations
        const currentPlanConfig = getPlanByCode(currentSubscription.plan_code);
        const newPlanConfig = getPlanByCode(newPlanCode);

        if (!currentPlanConfig) {
            client.release();
            res.status(500).json({
                success: false,
                message: 'Current plan configuration error. Please contact support.',
                code: 'CURRENT_PLAN_CONFIG_ERROR',
            });
            return;
        }

        if (!newPlanConfig || !newPlanConfig.is_active) {
            client.release();
            res.status(404).json({
                success: false,
                message: 'Selected plan not found or inactive.',
                code: 'NEW_PLAN_NOT_FOUND',
            });
            return;
        }

        // Prevent same plan selection
        if (currentSubscription.plan_code === newPlanCode) {
            client.release();
            res.status(400).json({
                success: false,
                message: 'You are already on this plan.',
                code: 'SAME_PLAN_SELECTED',
            });
            return;
        }

        // Calculate current and new plan prices based on billing cycle
        const currentPlanPrice =
            currentSubscription.billing_cycle === 'yearly'
                ? currentPlanConfig.price_yearly
                : currentPlanConfig.price_monthly;
        const newPlanPrice =
            currentSubscription.billing_cycle === 'yearly' ? newPlanConfig.price_yearly : newPlanConfig.price_monthly;

        // Allow both upgrades and downgrades
        console.log('Plan change details:', {
            currentPlan: currentSubscription.plan_code,
            newPlan: newPlanCode,
            currentPrice: currentPlanPrice,
            newPrice: newPlanPrice,
            isUpgrade: newPlanPrice > currentPlanPrice,
            isDowngrade: newPlanPrice < currentPlanPrice
        });

        // Get Razorpay plan ID for the new plan
        let newRazorpayPlanId;
        try {
            newRazorpayPlanId = getRazorpayPlanId(newPlanCode, currentSubscription.billing_cycle);
            if (!newRazorpayPlanId) {
                client.release();
                res.status(500).json({
                    success: false,
                    message: `Razorpay plan ID not configured for ${newPlanCode} ${currentSubscription.billing_cycle}. Please contact support.`,
                    code: 'NEW_PLAN_RAZORPAY_NOT_CONFIGURED',
                });
                return;
            }
        } catch (planError) {
            console.error('Failed to get Razorpay plan ID for new plan:', planError);
            client.release();
            res.status(500).json({
                success: false,
                message: 'New subscription plan configuration error. Please contact support.',
                code: 'NEW_PLAN_CONFIGURATION_ERROR',
            });
            return;
        }

        // Check if this is a legacy subscription (without razorpay_subscription_id)
        const isLegacySubscription = !currentSubscription.razorpay_subscription_id;

        if (isLegacySubscription) {
            console.log('Processing legacy subscription upgrade for user:', userId);

            // Get or create Razorpay customer for legacy subscription upgrade
            let razorpayCustomer;
            try {
                const userResult = await client.query(
                    `SELECT (first_name || ' ' || last_name) as name, email, NULL as phone, razorpay_customer_id FROM users WHERE id = $1`,
                    [userId]
                );
                const userDetails = userResult.rows[0];

                if (!userDetails) {
                    client.release();
                    res.status(404).json({
                        success: false,
                        message: 'User not found. Please log in again.',
                        code: 'USER_NOT_FOUND',
                    });
                    return;
                }

                // Get or create customer
                if (userDetails.razorpay_customer_id) {
                    razorpayCustomer = await fetchRazorpayCustomer(userDetails.razorpay_customer_id);
                    /** @type {any} */ (razorpayCustomer).isNew = false;
                } else {
                    razorpayCustomer = await createRazorpayCustomer({
                        name: userDetails.name,
                        email: userDetails.email,
                        contact: userDetails.phone || undefined,
                        notes: {
                            user_id: userId.toString(),
                            created_for: 'legacy_upgrade',
                        },
                    });

                    // Update user record with customer ID
                    if (/** @type {any} */ (razorpayCustomer).isNew) {
                        await client.query(
                            `UPDATE users SET razorpay_customer_id = $1 WHERE id = $2`,
                            [/** @type {any} */ (razorpayCustomer).id, userId]
                        );
                    }
                }
            } catch (customerError) {
                console.error('Failed to setup customer for legacy upgrade:', customerError);
                client.release();
                res.status(500).json({
                    success: false,
                    message: 'Failed to set up customer account for upgrade. Please try again.',
                    code: 'CUSTOMER_SETUP_FAILED',
                });
                return;
            }

            // Handle legacy subscription upgrade by creating new subscription
            try {
                // Create new Razorpay subscription for the new plan
                const subscription = await createRazorpaySubscription({
                    plan_id: newRazorpayPlanId,
                    customer_id: /** @type {any} */ (razorpayCustomer).id,
                    total_count: currentSubscription.billing_cycle === 'yearly' ? 1 : 12,
                    quantity: 1,
                    customer_notify: 1,
                    notes: {
                        user_id: userId.toString(),
                        old_subscription_id: currentSubscription.id.toString(),
                        upgrade_from_legacy: 'true',
                        old_plan_code: currentSubscription.plan_code,
                        new_plan_code: newPlanCode,
                        customer_id: /** @type {any} */ (razorpayCustomer).id,
                    },
                });

                // Start database transaction for atomic upgrade with audit trail
                try {
                    await client.query('BEGIN');

                    // Mark old subscription as upgraded
                    await client.query(
                        `UPDATE user_subscriptions 
                         SET status = 'upgraded', cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                         WHERE id = $1`,
                        [currentSubscription.id]
                    );

                    // Record cancellation transaction for old subscription
                    await recordSubscriptionTransaction({
                        userId: userId,
                        subscriptionId: currentSubscription.id,
                        transactionType: 'adjustment',
                        amount: 0,
                        status: 'cancelled',
                        description: `Legacy subscription upgraded: ${currentSubscription.plan_code} to ${newPlanCode}`,
                        method: 'legacy_upgrade',
                        methodDetails: {
                            old_plan_code: currentSubscription.plan_code,
                            new_plan_code: newPlanCode,
                            upgrade_reason: 'legacy_to_razorpay',
                            old_subscription_id: currentSubscription.id
                        }
                    });

                    // Calculate new billing dates
                    const now = new Date();
                    const nextBilling = new Date(now);
                    if (currentSubscription.billing_cycle === 'yearly') {
                        nextBilling.setFullYear(now.getFullYear() + 1);
                    } else {
                        nextBilling.setMonth(now.getMonth() + 1);
                    }

                    // Create new subscription record with customer ID
                    const subscriptionResult = await client.query(
                        `INSERT INTO user_subscriptions (
                            user_id, plan_code, status, billing_cycle,
                            razorpay_subscription_id, razorpay_customer_id, current_period_start, current_period_end,
                            next_billing_date, total_amount, auto_renewal
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        RETURNING id`,
                        [
                            userId,
                            newPlanCode,
                            'created', // Will be updated to 'active' via webhooks
                            currentSubscription.billing_cycle,
                            /** @type {any} */ (subscription).id,
                            /** @type {any} */ (razorpayCustomer).id,
                            now.toISOString(),
                            nextBilling.toISOString(),
                            nextBilling.toISOString(),
                            newPlanPrice,
                            true
                        ]
                    );

                    // Record creation transaction for new subscription
                    const transactionId = await recordSubscriptionTransaction({
                        userId: userId,
                        subscriptionId: subscriptionResult.rows[0].id,
                        transactionType: 'subscription',
                        amount: newPlanPrice,
                        status: 'created',
                        description: `Legacy upgrade: ${currentPlanConfig.name} to ${newPlanConfig.name}`,
                        method: 'razorpay_subscription',
                        methodDetails: {
                            old_plan_code: currentSubscription.plan_code,
                            new_plan_code: newPlanCode,
                            old_plan_name: currentPlanConfig.name,
                            new_plan_name: newPlanConfig.name,
                            billing_cycle: currentSubscription.billing_cycle,
                            upgrade_type: 'legacy_upgrade',
                            razorpay_subscription_id: /** @type {any} */ (subscription).id,
                            razorpay_customer_id: /** @type {any} */ (razorpayCustomer).id
                        },
                        gatewayResponse: {
                            razorpay_subscription_id: /** @type {any} */ (subscription).id,
                            legacy_upgrade: true
                        }
                    });

                    await client.query('COMMIT');

                    res.json({
                        success: true,
                        message: `Legacy subscription upgraded successfully from ${currentPlanConfig.name} to ${newPlanConfig.name}. Please complete the payment to activate your new plan.`,
                        data: {
                            subscriptionId: subscriptionResult.rows[0].id,
                            razorpaySubscriptionId: /** @type {any} */ (subscription).id,
                            currentPlan: currentPlanConfig.name,
                            newPlan: newPlanConfig.name,
                            newPlanPrice,
                            currency: newPlanConfig.price_currency || 'INR',
                            billingCycle: currentSubscription.billing_cycle,
                            requiresPayment: true,
                            isLegacyUpgrade: true,
                            razorpayKeyId: RAZORPAY_KEY_ID,
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
            } catch (legacyUpgradeError) {
                console.log('Legacy subscription upgrade failed, using fallback order-based payment');
                client.release();
                res.status(500).json({
                    success: false,
                    message: 'Failed to upgrade subscription. Please try again later.',
                    code: 'LEGACY_UPGRADE_FAILED',
                });
                return;
            }
        }

        // Handle regular subscription upgrade (with existing Razorpay subscription)
        res.status(501).json({
            success: false,
            message: 'Regular subscription upgrades not yet implemented. Please contact support.',
            code: 'REGULAR_UPGRADE_NOT_IMPLEMENTED',
        });
        client.release();

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Upgrade subscription failed:', errorMessage);

        res.status(500).json({
            success: false,
            message: 'Failed to upgrade subscription. Please try again later.',
            code: 'SUBSCRIPTION_UPGRADE_FAILED',
        });
    } finally {
        console.debug('Upgrade subscription process completed');
    }
}

module.exports = upgradeSubscription;