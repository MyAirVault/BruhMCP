/**
 * JWT utilities for token generation and verification
 * Handles access tokens, refresh tokens, and password reset tokens
 */

const jwt = require('jsonwebtoken');
const { storeRefreshToken, storePasswordResetToken, findValidRefreshToken, findValidPasswordResetToken, markTokenAsUsedByValue } = require('../db/queries/tokenQueries');


// Import environment variables
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../config/env');


// TypeScript-compatible interfaces for JSDoc

/**
 * @typedef {object} UserPayload
 * @property {string} userId - User ID (UUID)
 * @property {string} email - User email
 */

/**
 * @typedef {object} AccessTokenPayload
 * @property {string} userId - User ID (UUID)
 * @property {string} email - User email
 * @property {'access'} type - Token type
 * @property {number} iat - Issued at timestamp
 * @property {number} exp - Expiration timestamp
 * @property {string} iss - Issuer
 * @property {string} aud - Audience
 */

/**
 * @typedef {object} RefreshTokenPayload
 * @property {string} userId - User ID (UUID)
 * @property {string} email - User email
 * @property {'refresh'} type - Token type
 */

/**
 * @typedef {object} ResetTokenPayload
 * @property {string} userId - User ID (UUID)
 * @property {string} email - User email
 * @property {'password_reset'} type - Token type
 */

/**
 * @typedef {object} UserRecord
 * @property {string} id - User ID (UUID)
 * @property {string} email - User email
 * @property {string} first_name - User first name
 * @property {string} last_name - User last name
 * @property {string} password_hash - Hashed password
 * @property {boolean} is_verified - Verification status
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Update timestamp
 */

/**
 * @typedef {object} TokenRecord
 * @property {string} id - Token ID (UUID)
 * @property {string} user_id - User ID (UUID)
 * @property {string} token - Token value
 * @property {string} token_type - Token type
 * @property {string} expires_at - Expiration timestamp
 * @property {boolean} is_used - Usage status
 * @property {string} created_at - Creation timestamp
 */

// JWT configuration
const ACCESS_TOKEN_EXPIRY = '2h';  // Extended from 15m for better UX
const REFRESH_TOKEN_EXPIRY = '30d'; // Extended from 7d for better UX
const RESET_TOKEN_EXPIRY = '1h';


/**
 * Generate access token for authenticated user
 * @param {UserPayload} payload - User payload data
 * @returns {string} JWT access token
 */
function generateAccessToken(payload) {
    try {
        if (!payload || !payload.userId || !payload.email) {
            throw new Error('Invalid payload for access token generation');
        }
        
        const token = jwt.sign(
            {
                userId: payload.userId,
                email: payload.email,
                type: 'access'
            },
            JWT_SECRET,
            { 
                expiresIn: ACCESS_TOKEN_EXPIRY,
                issuer: 'microsaas-auth',
                audience: 'microsaas-client'
            }
        );
        
        return token;
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Access token generation failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Access token generation process completed');
    }
}


/**
 * Generate refresh token for token renewal
 * @param {Object} payload - User payload data
 * @param {string} payload.userId - User ID (UUID)
 * @param {string} payload.email - User email
 * @returns {Promise<string>} JWT refresh token
 */
async function generateRefreshToken(payload) {
    try {
        if (!payload || !payload.userId || !payload.email) {
            throw new Error('Invalid payload for refresh token generation');
        }
        
        const token = jwt.sign(
            {
                userId: payload.userId,
                email: payload.email,
                type: 'refresh'
            },
            JWT_REFRESH_SECRET,
            { 
                expiresIn: REFRESH_TOKEN_EXPIRY,
                issuer: 'microsaas-auth',
                audience: 'microsaas-client'
            }
        );
        
        // Store refresh token in database
        await storeRefreshToken(payload.userId, token, 30); // 30 days expiry
        
        return token;
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Refresh token generation failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Refresh token generation process completed');
    }
}


/**
 * Generate password reset token
 * @param {Object} payload - User payload data
 * @param {string} payload.userId - User ID (UUID)
 * @param {string} payload.email - User email
 * @returns {Promise<string>} JWT password reset token
 */
async function generatePasswordResetToken(payload) {
    try {
        if (!payload || !payload.userId || !payload.email) {
            throw new Error('Invalid payload for password reset token generation');
        }
        
        const token = jwt.sign(
            {
                userId: payload.userId,
                email: payload.email,
                type: 'password_reset'
            },
            JWT_SECRET,
            { 
                expiresIn: RESET_TOKEN_EXPIRY,
                issuer: 'microsaas-auth',
                audience: 'microsaas-client'
            }
        );
        
        // Store password reset token in database
        await storePasswordResetToken(payload.userId, token, 1); // 1 hour expiry
        
        return token;
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Password reset token generation failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Password reset token generation process completed');
    }
}


/**
 * Verify access token
 * @param {string} token - JWT access token
 * @returns {AccessTokenPayload} Decoded token payload
 */
function verifyAccessToken(token) {
    try {
        if (!token) {
            throw new Error('No token provided');
        }
        
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'microsaas-auth',
            audience: 'microsaas-client'
        });
        
        // Ensure decoded is an object, not a string
        if (typeof decoded === 'string') {
            throw new Error('Invalid token format');
        }
        
        if (decoded.type !== 'access') {
            throw new Error('Invalid token type');
        }
        
        return /** @type {AccessTokenPayload} */ (decoded);
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Access token verification failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Access token verification process completed');
    }
}


/**
 * Verify refresh token
 * @param {string} token - JWT refresh token
 * @returns {Promise<RefreshTokenPayload>} Decoded token payload
 */
async function verifyRefreshToken(token) {
    try {
        if (!token) {
            throw new Error('No refresh token provided');
        }
        
        // Verify JWT signature and expiry
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
            issuer: 'microsaas-auth',
            audience: 'microsaas-client'
        });
        
        // Ensure decoded is an object, not a string
        if (typeof decoded === 'string') {
            throw new Error('Invalid token format');
        }
        
        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }
        
        // Check if token exists in database and is not used
        const tokenRecord = await findValidRefreshToken(token);
        
        if (!tokenRecord) {
            throw new Error('Invalid or expired refresh token');
        }
        
        return /** @type {RefreshTokenPayload} */ (decoded);
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Refresh token verification failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Refresh token verification process completed');
    }
}


/**
 * Verify password reset token
 * @param {string} token - JWT password reset token
 * @returns {Promise<ResetTokenPayload>} Decoded token payload
 */
async function verifyPasswordResetToken(token) {
    try {
        if (!token) {
            throw new Error('No password reset token provided');
        }
        
        // Verify JWT signature and expiry
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'microsaas-auth',
            audience: 'microsaas-client'
        });
        
        // Ensure decoded is an object, not a string
        if (typeof decoded === 'string') {
            throw new Error('Invalid token format');
        }
        
        if (decoded.type !== 'password_reset') {
            throw new Error('Invalid token type');
        }
        
        // Check if token exists in database and is not used
        const tokenRecord = await findValidPasswordResetToken(token);
        
        if (!tokenRecord) {
            throw new Error('Invalid or expired password reset token');
        }
        
        return /** @type {ResetTokenPayload} */ (decoded);
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Password reset token verification failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Password reset token verification process completed');
    }
}


/**
 * Invalidate refresh token (logout)
 * @param {string} token - JWT refresh token
 * @returns {Promise<void>}
 */
async function invalidateRefreshToken(token) {
    try {
        if (!token) {
            throw new Error('No refresh token provided');
        }
        
        await markTokenAsUsedByValue(token, 'refresh');
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Refresh token invalidation failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Refresh token invalidation process completed');
    }
}


/**
 * Invalidate password reset token (after use)
 * @param {string} token - JWT password reset token
 * @returns {Promise<void>}
 */
async function invalidatePasswordResetToken(token) {
    try {
        if (!token) {
            throw new Error('No password reset token provided');
        }
        
        await markTokenAsUsedByValue(token, 'password_reset');
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Password reset token invalidation failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Password reset token invalidation process completed');
    }
}


// Export functions
module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generatePasswordResetToken,
    verifyAccessToken,
    verifyRefreshToken,
    verifyPasswordResetToken,
    invalidateRefreshToken,
    invalidatePasswordResetToken
};