/**
 * General API rate limiter
 */
export const generalRateLimit: Function;
/**
 * Rate limiter for authentication endpoints - generous enough for normal use
 */
export const authRateLimit: Function;
/**
 * Rate limiter for OTP requests - prevents spam but allows legitimate use
 */
export const otpRateLimit: Function;
/**
 * Rate limiter for password reset requests
 */
export const passwordResetRateLimit: Function;
/**
 * Strict rate limiter for payment operations
 */
export const paymentRateLimit: Function;
/**
 * Rate limiter for subscription modifications - allows legitimate retry attempts
 */
export const subscriptionRateLimit: Function;
/**
 * Very permissive rate limiter for subscription data viewing - allows normal browsing
 */
export const subscriptionViewRateLimit: Function;
/**
 * Rate limiter for webhook endpoints - allows high frequency for legitimate webhook traffic
 */
export const webhookRateLimit: Function;
/**
 * Configure helmet for security headers
 */
export const helmetConfig: import("express").RequestHandler;
/**
 * Configure CORS for cross-origin requests
 */
export const corsConfig: (req: cors.CorsRequest, res: {
    statusCode?: number | undefined;
    setHeader(key: string, value: string): any;
    end(): any;
}, next: (err?: any) => any) => void;
/**
 * Validation rules for user registration
 */
export const validateSignup: import("express-validator").ValidationChain[];
/**
 * Validation rules for user login
 */
export const validateLogin: import("express-validator").ValidationChain[];
/**
 * Validation rules for email-only requests (OTP, forgot password)
 */
export const validateEmail: import("express-validator").ValidationChain[];
/**
 * Validation rules for OTP verification
 */
export const validateOTP: import("express-validator").ValidationChain[];
/**
 * Validation rules for password reset
 */
export const validatePasswordReset: import("express-validator").ValidationChain[];
/**
 * Validation rules for refresh token
 */
export const validateRefreshToken: import("express-validator").ValidationChain[];
/**
 * Validation rules for payment amount verification
 */
export const validatePaymentAmount: import("express-validator").ValidationChain[];
/**
 * Validation rules for Razorpay payment data
 */
export const validateRazorpayData: import("express-validator").ValidationChain[];
/**
 * Middleware to handle validation errors
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
export function handleValidationErrors(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): void;
/**
 * Middleware to sanitize request body
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
export function sanitizeInput(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): void;
/**
 * Middleware to log security events
 * @param {string} eventType - Type of security event
 * @returns {Function} Express middleware function
 */
export function logSecurityEvent(eventType: string): Function;
/**
 * Middleware to validate payment integrity and prevent tampering
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
export function validatePaymentIntegrity(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): void;
/**
 * Middleware to validate Razorpay webhook signatures
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
export function validateWebhookSignature(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): void;
import cors = require("cors");
//# sourceMappingURL=security.d.ts.map