/**
 * Handle signup email verification with automatic login
 * Verifies OTP code, creates Razorpay customer, marks user as verified, and logs them in
 *
 * @param {import('express').Request} req - Express request object with verification data
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>} Sends JSON response with user data and auth tokens
 */
export function handleSignupVerification(req: import("express").Request, res: import("express").Response): Promise<void>;
//# sourceMappingURL=signup-verification.d.ts.map