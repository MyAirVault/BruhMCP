/**
 * Webhook Validation Middleware
 * @fileoverview Middleware for validating webhook signatures and payloads
 */
/**
 * @typedef {import('express').Request & {rawBody?: string}} RequestWithRawBody
 */
/**
 * Middleware to capture raw body for webhook signature verification
 * This must be applied before express.json() middleware for webhook routes
 * @param {RequestWithRawBody} req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
export function captureRawBody(req: RequestWithRawBody, _res: import("express").Response, next: import("express").NextFunction): void;
/**
 * @typedef {Map<string, number[]>} WebhookRateLimitStore
 */
/**
 * @typedef {typeof globalThis & {webhookRateLimitStore?: WebhookRateLimitStore}} GlobalWithWebhookStore
 */
/**
 * Rate limiting for webhook endpoints
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void | import('express').Response}
 */
export function webhookRateLimit(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): void | import("express").Response;
/**
 * @typedef {Object} BillingConfigValidation
 * @property {boolean} valid - Whether the configuration is valid
 * @property {string[]} [missingVars] - Array of missing environment variable names
 * @property {string} message - Validation message
 */
/**
 * Validate required environment variables for billing
 * @returns {BillingConfigValidation} Validation result
 */
export function validateBillingConfig(): BillingConfigValidation;
/**
 * Middleware to check billing configuration on startup
 * @param {import('express').Request} _req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void | import('express').Response}
 */
export function checkBillingConfig(_req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): void | import("express").Response;
export type RequestWithRawBody = import("express").Request & {
    rawBody?: string;
};
export type WebhookRateLimitStore = Map<string, number[]>;
export type GlobalWithWebhookStore = typeof globalThis & {
    webhookRateLimitStore?: WebhookRateLimitStore;
};
export type BillingConfigValidation = {
    /**
     * - Whether the configuration is valid
     */
    valid: boolean;
    /**
     * - Array of missing environment variable names
     */
    missingVars?: string[] | undefined;
    /**
     * - Validation message
     */
    message: string;
};
//# sourceMappingURL=webhookValidation.d.ts.map