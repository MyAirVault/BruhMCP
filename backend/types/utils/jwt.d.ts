export type UserPayload = {
    /**
     * - User ID (UUID)
     */
    userId: string;
    /**
     * - User email
     */
    email: string;
};
export type AccessTokenPayload = {
    /**
     * - User ID (UUID)
     */
    userId: string;
    /**
     * - User email
     */
    email: string;
    /**
     * - Token type
     */
    type: "access";
    /**
     * - Issued at timestamp
     */
    iat: number;
    /**
     * - Expiration timestamp
     */
    exp: number;
    /**
     * - Issuer
     */
    iss: string;
    /**
     * - Audience
     */
    aud: string;
};
export type RefreshTokenPayload = {
    /**
     * - User ID (UUID)
     */
    userId: string;
    /**
     * - User email
     */
    email: string;
    /**
     * - Token type
     */
    type: "refresh";
};
export type ResetTokenPayload = {
    /**
     * - User ID (UUID)
     */
    userId: string;
    /**
     * - User email
     */
    email: string;
    /**
     * - Token type
     */
    type: "password_reset";
};
export type UserRecord = {
    /**
     * - User ID (UUID)
     */
    id: string;
    /**
     * - User email
     */
    email: string;
    /**
     * - User first name
     */
    first_name: string;
    /**
     * - User last name
     */
    last_name: string;
    /**
     * - Hashed password
     */
    password_hash: string;
    /**
     * - Verification status
     */
    is_verified: boolean;
    /**
     * - Creation timestamp
     */
    created_at: string;
    /**
     * - Update timestamp
     */
    updated_at: string;
};
export type TokenRecord = {
    /**
     * - Token ID (UUID)
     */
    id: string;
    /**
     * - User ID (UUID)
     */
    user_id: string;
    /**
     * - Token value
     */
    token: string;
    /**
     * - Token type
     */
    token_type: string;
    /**
     * - Expiration timestamp
     */
    expires_at: string;
    /**
     * - Usage status
     */
    is_used: boolean;
    /**
     * - Creation timestamp
     */
    created_at: string;
};
/**
 * Generate access token for authenticated user
 * @param {UserPayload} payload - User payload data
 * @returns {string} JWT access token
 */
export function generateAccessToken(payload: UserPayload): string;
/**
 * Generate refresh token for token renewal
 * @param {Object} payload - User payload data
 * @param {string} payload.userId - User ID (UUID)
 * @param {string} payload.email - User email
 * @returns {Promise<string>} JWT refresh token
 */
export function generateRefreshToken(payload: {
    userId: string;
    email: string;
}): Promise<string>;
/**
 * Generate password reset token
 * @param {Object} payload - User payload data
 * @param {string} payload.userId - User ID (UUID)
 * @param {string} payload.email - User email
 * @returns {Promise<string>} JWT password reset token
 */
export function generatePasswordResetToken(payload: {
    userId: string;
    email: string;
}): Promise<string>;
/**
 * Verify access token
 * @param {string} token - JWT access token
 * @returns {AccessTokenPayload} Decoded token payload
 */
export function verifyAccessToken(token: string): AccessTokenPayload;
/**
 * Verify refresh token
 * @param {string} token - JWT refresh token
 * @returns {Promise<RefreshTokenPayload>} Decoded token payload
 */
export function verifyRefreshToken(token: string): Promise<RefreshTokenPayload>;
/**
 * Verify password reset token
 * @param {string} token - JWT password reset token
 * @returns {Promise<ResetTokenPayload>} Decoded token payload
 */
export function verifyPasswordResetToken(token: string): Promise<ResetTokenPayload>;
/**
 * Invalidate refresh token (logout)
 * @param {string} token - JWT refresh token
 * @returns {Promise<void>}
 */
export function invalidateRefreshToken(token: string): Promise<void>;
/**
 * Invalidate password reset token (after use)
 * @param {string} token - JWT password reset token
 * @returns {Promise<void>}
 */
export function invalidatePasswordResetToken(token: string): Promise<void>;
//# sourceMappingURL=jwt.d.ts.map