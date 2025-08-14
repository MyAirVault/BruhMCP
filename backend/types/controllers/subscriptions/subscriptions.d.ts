export type DatabaseUser = {
    /**
     * - User ID
     */
    id: number;
    /**
     * - User full name
     */
    name: string;
    /**
     * - User email
     */
    email: string;
    /**
     * - User phone number
     */
    phone?: string | undefined;
    /**
     * - Razorpay customer ID
     */
    razorpay_customer_id?: string | undefined;
};
export type PlanConfiguration = {
    /**
     * - Plan code (free, pro, plus)
     */
    plan_code: string;
    /**
     * - Plan name
     */
    name: string;
    /**
     * - Plan description
     */
    description: string;
    /**
     * - Monthly price in paise
     */
    price_monthly: number;
    /**
     * - Yearly price in paise
     */
    price_yearly: number;
    /**
     * - Currency code
     */
    price_currency: string;
    /**
     * - Trial period in days
     */
    trial_days: number;
    /**
     * - Array of features
     */
    features: string[];
    /**
     * - Object containing limits
     */
    limits: Object;
    /**
     * - Whether plan is active
     */
    is_active: boolean;
};
export type DatabaseSubscription = {
    /**
     * - Subscription ID
     */
    id: number;
    /**
     * - User ID
     */
    user_id: number;
    /**
     * - Plan code (free, pro, plus)
     */
    plan_code: string;
    /**
     * - Subscription status
     */
    status: string;
    /**
     * - Billing cycle (monthly/yearly)
     */
    billing_cycle: string;
    /**
     * - Current period start date
     */
    current_period_start: string;
    /**
     * - Current period end date
     */
    current_period_end: string;
    /**
     * - Trial start date
     */
    trial_start?: string | undefined;
    /**
     * - Trial end date
     */
    trial_end?: string | undefined;
    /**
     * - Total amount in paise
     */
    total_amount: number;
    /**
     * - Razorpay subscription ID
     */
    razorpay_subscription_id?: string | undefined;
    /**
     * - Razorpay customer ID
     */
    razorpay_customer_id?: string | undefined;
    /**
     * - Whether subscription cancels at period end
     */
    cancel_at_period_end?: number | undefined;
    /**
     * - Cancellation timestamp
     */
    cancelled_at?: string | undefined;
    /**
     * - Reason for cancellation
     */
    cancellation_reason?: string | undefined;
    /**
     * - Failed payment count
     */
    failed_payment_count?: number | undefined;
    /**
     * - Last payment attempt timestamp
     */
    last_payment_attempt?: string | undefined;
    /**
     * - Next billing date
     */
    next_billing_date?: string | undefined;
    /**
     * - Auto renewal flag
     */
    auto_renewal?: number | undefined;
    /**
     * - Creation timestamp
     */
    created_at?: string | undefined;
    /**
     * - Update timestamp
     */
    updated_at?: string | undefined;
};
export type DatabaseTransaction = {
    /**
     * - Transaction ID
     */
    id: number;
    /**
     * - User ID
     */
    user_id: number;
    /**
     * - Subscription ID
     */
    subscription_id: number;
    /**
     * - Transaction type
     */
    transaction_type: string;
    /**
     * - Amount in paise
     */
    amount: number;
    /**
     * - Net amount in paise
     */
    net_amount: number;
    /**
     * - Transaction status
     */
    status: string;
    /**
     * - Payment method details JSON
     */
    method_details_json?: string | undefined;
    /**
     * - Gateway response JSON
     */
    gateway_response_json?: string | undefined;
    /**
     * - Plan code (from JOIN)
     */
    plan_code?: string | undefined;
    /**
     * - Subscription status (from JOIN)
     */
    subscription_status?: string | undefined;
};
export type DatabaseCountResult = {
    /**
     * - Total count
     */
    total: number;
};
import getAllPlans = require("./functions/getAllPlans.js");
import getUserSubscription = require("./functions/getUserSubscription.js");
import createSubscription = require("./functions/createSubscription.js");
import upgradeSubscription = require("./functions/upgradeSubscription.js");
import cancelSubscription = require("./functions/cancelSubscription.js");
import getSubscriptionHistory = require("./functions/getSubscriptionHistory.js");
import verifyPayment = require("./functions/verifyPayment.js");
import getPaymentStatus = require("./functions/getPaymentStatus.js");
import pauseSubscription = require("./functions/pauseSubscription.js");
import resumeSubscription = require("./functions/resumeSubscription.js");
import downloadInvoice = require("./functions/downloadInvoice.js");
export { getAllPlans, getUserSubscription, createSubscription, upgradeSubscription, cancelSubscription, getSubscriptionHistory, verifyPayment, getPaymentStatus, pauseSubscription, resumeSubscription, downloadInvoice };
//# sourceMappingURL=subscriptions.d.ts.map