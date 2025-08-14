export = upgradeSubscription;
/**
 * Upgrade subscription plan with prorated billing
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
declare function upgradeSubscription(req: import("express").Request, res: import("express").Response): Promise<void>;
declare namespace upgradeSubscription {
    export { TransactionData };
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
//# sourceMappingURL=upgradeSubscription.d.ts.map