export = cancelSubscription;
/**
 * Cancel subscription (moves to cancelled status)
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
declare function cancelSubscription(req: import("express").Request, res: import("express").Response): Promise<void>;
declare namespace cancelSubscription {
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
//# sourceMappingURL=cancelSubscription.d.ts.map