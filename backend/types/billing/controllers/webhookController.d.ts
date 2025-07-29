/**
 * Main Razorpay webhook handler
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export function handleRazorpayWebhook(req: import('express').Request, res: import('express').Response): Promise<void>;
/**
 * Get webhook event processing status (for debugging)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export function getWebhookEvents(req: import('express').Request, res: import('express').Response): Promise<void>;
//# sourceMappingURL=webhookController.d.ts.map