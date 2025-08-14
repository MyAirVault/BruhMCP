export = createSubscription;
/**
 * Create new subscription with Razorpay payment processing
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
declare function createSubscription(req: import("express").Request, res: import("express").Response): Promise<void>;
declare namespace createSubscription {
    export { TransactionData, DatabaseSubscription, RazorpayCustomerResponse, RazorpaySubscriptionResponse, PlanConfig };
}
type TransactionData = {
    userId: string;
    subscriptionId: number;
    transactionType: string;
    amount: number;
    status: string;
    description: string;
    razorpayPaymentId?: string | null | undefined;
    razorpayOrderId?: string | null | undefined;
    method?: string | null | undefined;
    methodDetails?: Object | null | undefined;
    gatewayResponse?: Object | null | undefined;
};
type DatabaseSubscription = {
    id: number;
    status: string;
    plan_code: string;
    razorpay_subscription_id: string | null;
};
type RazorpayCustomerResponse = {
    id: string;
    isNew?: boolean | undefined;
};
type RazorpaySubscriptionResponse = {
    id: string;
    short_url?: string | undefined;
    status: string;
};
type PlanConfig = {
    name: string;
    description: string;
    features: string[];
    limits: Object;
    price_monthly: number;
    price_yearly: number;
    price_currency: string;
    trial_days: number;
    is_featured: boolean;
};
//# sourceMappingURL=createSubscription.d.ts.map