/**
 * Store OTP token for user
 * @param {string} userId - User's UUID
 * @param {string} otp - OTP code
 * @param {number} [expiryMinutes=5] - Token expiry in minutes
 * @returns {Promise<Object>} Token record with ID
 */
export function storeOTPToken(userId: string, otp: string, expiryMinutes?: number): Promise<Object>;
/**
 * Store refresh token for user
 * @param {string} userId - User's UUID
 * @param {string} refreshToken - JWT refresh token
 * @param {number} [expiryDays=30] - Token expiry in days
 * @returns {Promise<Object>} Token record with ID
 */
export function storeRefreshToken(userId: string, refreshToken: string, expiryDays?: number): Promise<Object>;
/**
 * Store password reset token for user
 * @param {string} userId - User's UUID
 * @param {string} resetToken - JWT password reset token
 * @param {number} [expiryHours=1] - Token expiry in hours
 * @returns {Promise<Object>} Token record with ID
 */
export function storePasswordResetToken(userId: string, resetToken: string, expiryHours?: number): Promise<Object>;
/**
 * Find valid OTP token for user
 * @param {string} userId - User's UUID
 * @param {string} otp - OTP code to find
 * @returns {Promise<{id: string, userId: string, token: string, type: string, expiresAt: string, isUsed: boolean, createdAt: string}|null>} Token record or null if not found
 */
export function findValidOTPToken(userId: string, otp: string): Promise<{
    id: string;
    userId: string;
    token: string;
    type: string;
    expiresAt: string;
    isUsed: boolean;
    createdAt: string;
} | null>;
/**
 * Find valid refresh token
 * @param {string} refreshToken - JWT refresh token
 * @returns {Promise<Object|null>} Token record or null if not found
 */
export function findValidRefreshToken(refreshToken: string): Promise<Object | null>;
/**
 * Find valid password reset token
 * @param {string} resetToken - JWT password reset token
 * @returns {Promise<Object|null>} Token record or null if not found
 */
export function findValidPasswordResetToken(resetToken: string): Promise<Object | null>;
/**
 * Mark token as used
 * @param {string} tokenId - Token's UUID
 * @returns {Promise<boolean>} Success status
 */
export function markTokenAsUsed(tokenId: string): Promise<boolean>;
/**
 * Mark token as used by token value and type
 * @param {string} token - Token value
 * @param {string} tokenType - Token type (email_otp, refresh, password_reset)
 * @returns {Promise<boolean>} Success status
 */
export function markTokenAsUsedByValue(token: string, tokenType: string): Promise<boolean>;
/**
 * Get OTP attempt count for user within time window
 * @param {string} userId - User's UUID
 * @param {number} [windowMinutes=60] - Time window in minutes
 * @returns {Promise<number>} Number of OTP attempts
 */
export function getOTPAttemptCount(userId: string, windowMinutes?: number): Promise<number>;
/**
 * Get recent OTP request count for rate limiting
 * @param {string} userId - User's UUID
 * @param {number} [windowMinutes=5] - Time window in minutes
 * @returns {Promise<number>} Number of recent OTP requests
 */
export function getRecentOTPRequests(userId: string, windowMinutes?: number): Promise<number>;
/**
 * Clean up expired tokens
 * @param {string|null} [tokenType] - Specific token type to clean up, or all types if not specified
 * @returns {Promise<number>} Number of tokens cleaned up
 */
export function cleanupExpiredTokens(tokenType?: string | null): Promise<number>;
/**
 * Invalidate all tokens for a user (logout from all devices)
 * @param {string} userId - User's UUID
 * @param {string|null} [tokenType] - Specific token type to invalidate, or all types if not specified
 * @returns {Promise<number>} Number of tokens invalidated
 */
export function invalidateUserTokens(userId: string, tokenType?: string | null): Promise<number>;
//# sourceMappingURL=tokenQueries.d.ts.map