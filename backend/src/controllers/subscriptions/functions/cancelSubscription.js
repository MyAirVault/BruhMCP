/**
 * Cancel subscription (moves to cancelled status)
 * Copied exactly from MicroSAASTemplate and adapted for PostgreSQL
 */

const { pool } = require('../../../db/config.js');
const { getPlanByCode } = require('../../../data/subscription-plans.js');
const { cancelRazorpaySubscription } = require('../../../utils/razorpay/razorpay.js');

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
 * Cancel subscription (moves to cancelled status)
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
async function cancelSubscription(req, res) {
    try {
        const userId = /** @type {string | undefined} */ (req.user?.id);
        const { immediate = false, reason, feedback } = req.body;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Please log in to cancel your subscription.',
                code: 'AUTHENTICATION_REQUIRED',
            });
            return;
        }

        const client = await pool.connect();

        // Get current subscription (including cancelled ones that are still active until period end)
        const currentResult = await client.query(
            `SELECT us.*
             FROM user_subscriptions us
             WHERE us.user_id = $1 AND (
                 us.status IN ('created', 'active', 'authenticated') OR 
                 (us.status = 'cancelled' AND us.cancel_at_period_end = true AND us.current_period_end > CURRENT_TIMESTAMP)
             )
             ORDER BY us.created_at DESC
             LIMIT 1`,
            [userId]
        );
        const subscription = currentResult.rows[0];

        if (!subscription) {
            client.release();
            res.status(404).json({
                success: false,
                message: 'No active subscription found to cancel.',
                code: 'NO_ACTIVE_SUBSCRIPTION',
            });
            return;
        }

        // Get plan configuration for the subscription
        const planConfig = getPlanByCode(subscription.plan_code);
        if (!planConfig) {
            client.release();
            res.status(500).json({
                success: false,
                message: 'Plan configuration error. Please contact support.',
                code: 'PLAN_CONFIG_ERROR',
            });
            return;
        }

        // Check if already fully cancelled (not just scheduled to cancel at period end)
        if (subscription.status === 'cancelled' && subscription.cancel_at_period_end === false) {
            client.release();
            res.status(400).json({
                success: false,
                message: 'This subscription is already cancelled.',
                code: 'SUBSCRIPTION_ALREADY_CANCELLED',
            });
            return;
        }

        const currentDate = new Date();
        const periodEnd = new Date(subscription.current_period_end);

        // Handle Razorpay subscription cancellation if it exists
        console.log('SUBSCRIPTION: ', subscription);
        if (subscription.razorpay_subscription_id) {
            try {
                const cancelResult = await cancelRazorpaySubscription(subscription.razorpay_subscription_id, {
                    cancel_at_cycle_end: !immediate, // Cancel immediately if immediate=true
                    // Note: Razorpay cancel API does not support notes parameter
                    // Cancellation details are tracked in our local database instead
                });

                // Check if this was a "created" status subscription that was handled locally
                if (/** @type {any} */ (cancelResult).notes?.cancelled_locally) {
                    console.log(
                        `Razorpay subscription ${subscription.razorpay_subscription_id} was in "created" status - handled locally without API call`
                    );
                } else {
                    console.log(
                        `Razorpay subscription ${subscription.razorpay_subscription_id} cancelled successfully`
                    );
                }
            } catch (razorpayError) {
                const error = /** @type {any} */ (razorpayError);
                // Check for the specific "no billing cycle" error
                const isNoBillingCycleError =
                    error.statusCode === 400 &&
                    error.error?.description?.includes('no billing cycle is going on');

                if (isNoBillingCycleError) {
                    console.warn(
                        'Razorpay subscription cannot be cancelled - no billing cycle started. This is expected for "created" status subscriptions.'
                    );
                    console.log(
                        `Proceeding with local cancellation for subscription ${subscription.razorpay_subscription_id}`
                    );
                } else {
                    console.error('Failed to cancel Razorpay subscription:', {
                        subscriptionId: subscription.razorpay_subscription_id,
                        error: error.message || error.error?.description || 'Unknown error',
                        statusCode: error.statusCode,
                        errorCode: error.error?.code,
                        errorDescription: error.error?.description,
                        fullErrorDetails: JSON.stringify(error, null, 2),
                    });

                    // Don't fail the entire operation if Razorpay cancellation fails
                    // The subscription will be marked as cancelled in our database
                    console.warn('Proceeding with local cancellation despite Razorpay error');
                }
            }
        } else {
            console.log('Legacy subscription without Razorpay ID - proceeding with local cancellation only');
        }

        // Update subscription status in database with transaction recording
        const cancelAtPeriodEnd = immediate ? false : true;
        
        // Atomic transaction for cancellation with audit trail
        try {
            await client.query('BEGIN');

            await client.query(
                `UPDATE user_subscriptions 
                 SET status = 'cancelled',
                     cancel_at_period_end = $1,
                     cancelled_at = $2,
                     cancellation_reason = $3,
                     cancellation_feedback = $4,
                     auto_renewal = false,
                     next_billing_date = NULL,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $5`,
                [
                    cancelAtPeriodEnd,
                    currentDate.toISOString(),
                    reason || 'User requested cancellation',
                    feedback || null,
                    subscription.id
                ]
            );

            // Record cancellation transaction for audit trail
            const transactionId = await recordSubscriptionTransaction({
                userId: userId,
                subscriptionId: subscription.id,
                transactionType: 'adjustment',
                amount: 0,
                status: 'cancelled',
                description: `Subscription cancellation: ${planConfig.name} plan (${immediate ? 'immediate' : 'end of period'})`,
                method: subscription.razorpay_subscription_id ? 'razorpay_cancellation' : 'local_cancellation',
                methodDetails: {
                    plan_code: subscription.plan_code,
                    plan_name: planConfig.name,
                    cancellation_type: immediate ? 'immediate' : 'end_of_period',
                    cancel_at_period_end: cancelAtPeriodEnd,
                    cancellation_reason: reason || 'User requested cancellation',
                    cancellation_feedback: feedback || null,
                    razorpay_subscription_id: subscription.razorpay_subscription_id || null,
                    has_razorpay_subscription: !!subscription.razorpay_subscription_id
                }
            });

            await client.query('COMMIT');

            // Determine when the subscription actually ends
            const accessEndsAt = immediate ? currentDate : periodEnd;
            const remainingDays = immediate
                ? 0
                : Math.ceil((periodEnd.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

            // Prepare success message based on cancellation type
            let successMessage;
            if (immediate) {
                successMessage = subscription.razorpay_subscription_id
                    ? 'Subscription cancelled immediately with Razorpay. You now have access to the Free plan.'
                    : 'Subscription cancelled immediately. You now have access to the Free plan.';
            } else {
                successMessage = subscription.razorpay_subscription_id
                    ? `Subscription cancelled with Razorpay and will end at cycle completion. You'll continue to have ${
                          planConfig.name
                      } access until ${periodEnd.toLocaleDateString()}, after which you'll be moved to the Free plan.`
                    : `Subscription cancelled successfully. You'll continue to have ${
                          planConfig.name
                      } access until ${periodEnd.toLocaleDateString()}, after which you'll be moved to the Free plan.`;
            }

            // After immediate cancellation, user gets free plan access
            if (immediate) {
                // Get free plan configuration
                const freePlan = getPlanByCode('free');
                if (!freePlan) {
                    client.release();
                    res.status(500).json({
                        success: false,
                        message: 'Free plan configuration error. Please contact support.',
                        code: 'FREE_PLAN_CONFIG_ERROR',
                    });
                    return;
                }

                // Return free plan structure (same format as getUserSubscription for no subscription)
                res.json({
                    success: true,
                    message: 'Subscription cancelled immediately. You now have access to the Free plan.',
                    data: {
                        subscription: null,
                        currentPlan: {
                            plan_code: 'free',
                            name: freePlan.name,
                            description: freePlan.description,
                            features: freePlan.features,
                            limits: freePlan.limits,
                            price_monthly: freePlan.price_monthly,
                            trial_days: freePlan.trial_days,
                        },
                        accountCredits: 0,
                        isActive: true,
                        isTrialActive: null,
                        isCancelledButActive: false,
                        accessEndsAt: null,
                        willRenew: false
                    },
                });
            } else {
                // For scheduled cancellation, get updated subscription data
                const updatedResult = await client.query(
                    `SELECT us.*, $1::text as plan_name, $2::text as plan_description, 
                            $3::text as features, $4::text as limits, $5::integer as price_monthly,
                            $6::integer as price_yearly, $7::text as price_currency, 
                            $8::integer as trial_days, $9::boolean as is_featured
                     FROM user_subscriptions us
                     WHERE us.user_id = $10 AND us.id = $11`,
                    [
                        planConfig.name, planConfig.description, JSON.stringify(planConfig.features),
                        JSON.stringify(planConfig.limits), planConfig.price_monthly, planConfig.price_yearly,
                        planConfig.price_currency, planConfig.trial_days, planConfig.is_featured,
                        userId, subscription.id
                    ]
                );
                
                const updatedSub = updatedResult.rows[0];
                
                if (updatedSub) {
                    res.json({
                        success: true,
                        message: successMessage,
                        data: {
                            subscription: {
                                ...updatedSub,
                                features: JSON.parse(updatedSub.features || '[]'),
                                limits: JSON.parse(updatedSub.limits || '{}')
                            },
                            accountCredits: 0,
                            isActive: true,
                            isTrialActive: null,
                            isCancelledButActive: true,
                            accessEndsAt: accessEndsAt.toISOString(),
                            willRenew: false
                        },
                    });
                } else {
                    res.status(500).json({
                        success: false,
                        message: 'Failed to retrieve updated subscription data.',
                        code: 'SUBSCRIPTION_UPDATE_ERROR',
                    });
                }
            }
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Cancel subscription failed:', errorMessage);

        res.status(500).json({
            success: false,
            message: 'Failed to cancel subscription. Please try again later.',
            code: 'SUBSCRIPTION_CANCELLATION_FAILED',
        });
    } finally {
        console.debug('Cancel subscription process completed');
    }
}

module.exports = cancelSubscription;