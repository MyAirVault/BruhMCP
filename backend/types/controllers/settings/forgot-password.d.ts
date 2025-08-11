/**
 * Handle forgot password request
 * Generates OTP and sends it to user's email for password reset
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>} Sends JSON response with success status
 */
export function handleForgotPassword(req: import("express").Request, res: import("express").Response): Promise<void>;
/**
 * Handle password reset completion
 * Validates OTP and updates user's password
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>} Sends JSON response with reset status
 */
export function handleResetPassword(req: import("express").Request, res: import("express").Response): Promise<void>;
/**
 * Create password reset token from email and OTP
 * This is a helper function for frontend to create proper token format
 *
 * @param {string} email - User email address
 * @param {string} otp - OTP code
 * @returns {string} Base64 encoded token
 */
export function createResetToken(email: string, otp: string): string;
//# sourceMappingURL=forgot-password.d.ts.map