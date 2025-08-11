/**
 * Handle user signup with email verification
 * Creates a new user account and initiates email verification process
 *
 * @param {import('express').Request} req - Express request object with signup data
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>} Sends JSON response with user creation status
 */
export function handleSignup(req: import("express").Request, res: import("express").Response): Promise<void>;
/**
 * Handle resend OTP for unverified signup users
 * Resends verification code to users who haven't completed email verification
 *
 * @param {import('express').Request} req - Express request object with email
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>} Sends JSON response with resend status
 */
export function handleResendSignupOTP(req: import("express").Request, res: import("express").Response): Promise<void>;
//# sourceMappingURL=signup.d.ts.map