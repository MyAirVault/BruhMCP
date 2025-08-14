export = getPaymentStatus;
/**
 * Get payment status for subscription polling
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
declare function getPaymentStatus(req: import("express").Request, res: import("express").Response): Promise<void>;
declare namespace getPaymentStatus {
    export { DatabaseSubscription, DatabaseTransaction, PaymentStatus };
}
type DatabaseSubscription = {
    plan_code: string;
    total_amount: number;
    status: string;
    failed_payment_count?: number | undefined;
    last_payment_attempt?: string | undefined;
};
type DatabaseTransaction = {
    status: string;
    failure_reason?: string | undefined;
    razorpay_payment_id?: string | undefined;
    created_at: string;
};
type PaymentStatus = {
    status: string;
    failed_payment_count: number;
};
//# sourceMappingURL=getPaymentStatus.d.ts.map