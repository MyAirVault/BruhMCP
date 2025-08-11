/**
 * Generate 6-digit OTP code
 * @returns {string} 6-digit OTP code
 */
export function generateOTPCode(): string;
/**
 * Store OTP in database for user
 * @param {string} userId - User UUID
 * @param {string} email - User email
 * @param {string} otp - Generated OTP code
 * @returns {Promise<void>}
 */
export function storeOTP(userId: string, email: string, otp: string): Promise<void>;
/**
 * Verify OTP code for user
 * @param {string} email - User email
 * @param {string} otp - OTP code to verify
 * @returns {Promise<{success: boolean, message: string, user?: {id: string, firstName: string, lastName: string, email: string, isVerified: boolean}}>} Verification result with success status and user data
 */
export function verifyOTP(email: string, otp: string): Promise<{
    success: boolean;
    message: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        isVerified: boolean;
    };
}>;
/**
 * Check OTP rate limit for user
 * @param {string} userId - User ID (UUID)
 * @returns {Promise<{canRequest: boolean, remainingRequests: number, message: string}>} Rate limit check result
 */
export function checkOTPRateLimit(userId: string): Promise<{
    canRequest: boolean;
    remainingRequests: number;
    message: string;
}>;
/**
 * Clean up expired OTPs from database
 * @returns {Promise<void>}
 */
export function cleanupExpiredOTPs(): Promise<void>;
/**
 * Send OTP via email (simulated with console.log for now)
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} purpose - OTP purpose (signup_verification, login_otp, password_reset, email_change_verification, verification)
 * @returns {Promise<void>}
 */
export function sendOTPEmail(email: string, otp: string, purpose?: string): Promise<void>;
//# sourceMappingURL=otp.d.ts.map