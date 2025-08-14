/**
 * Token management database queries for PostgreSQL
 * Handles OTP, refresh tokens, password reset tokens, and other auth tokens
 * 
 * Converts SQLite synchronous operations to PostgreSQL async operations:
 * - Replace db.prepare().get() with pool.query()
 * - Convert ? placeholders to $1, $2, etc.
 * - Handle UUIDs instead of INTEGER IDs
 * - Use proper PostgreSQL timestamp handling
 */

const { pool } = require('../config');


/**
 * Store OTP token for user
 * @param {string} userId - User's UUID
 * @param {string} otp - OTP code
 * @param {number} [expiryMinutes=5] - Token expiry in minutes
 * @returns {Promise<Object>} Token record with ID
 */
async function storeOTPToken(userId, otp, expiryMinutes = 5) {
    try {
        if (!userId || !otp) {
            throw new Error('User ID and OTP are required');
        }
        
        if (typeof otp !== 'string' || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
            throw new Error('OTP must be exactly 6 digits');
        }
        
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Calculate expiry timestamp
            const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
            
            // Use UPSERT to either insert new OTP or update existing one
            const upsertQuery = `
                INSERT INTO auth_tokens (user_id, token, token_type, expires_at, is_used)
                VALUES ($1, $2, 'otp', $3, false)
                ON CONFLICT (user_id, token_type)
                DO UPDATE SET 
                    token = EXCLUDED.token,
                    expires_at = EXCLUDED.expires_at,
                    is_used = false,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING id, token, token_type, expires_at, created_at
            `;
            
            const result = await client.query(upsertQuery, [userId, otp, expiresAt]);
            
            if (!result.rows.length) {
                throw new Error('Failed to store OTP token');
            }
            
            await client.query('COMMIT');
            
            const tokenRecord = result.rows[0];
            
            console.log(`OTP stored successfully for userId: ${userId}, expires at: ${expiresAt.toISOString()}`);
            
            return {
                id: tokenRecord.id,
                token: tokenRecord.token,
                type: tokenRecord.token_type,
                expiresAt: tokenRecord.expires_at,
                createdAt: tokenRecord.created_at
            };
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Store OTP token failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Store OTP token process completed');
    }
}


/**
 * Store refresh token for user
 * @param {string} userId - User's UUID
 * @param {string} refreshToken - JWT refresh token
 * @param {number} [expiryDays=30] - Token expiry in days
 * @returns {Promise<Object>} Token record with ID
 */
async function storeRefreshToken(userId, refreshToken, expiryDays = 30) {
    try {
        if (!userId || !refreshToken) {
            throw new Error('User ID and refresh token are required');
        }
        
        const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
        
        const query = `
            INSERT INTO auth_tokens (user_id, token, token_type, expires_at, is_used)
            VALUES ($1, $2, 'refresh', $3, false)
            ON CONFLICT (user_id, token_type)
            DO UPDATE SET 
                token = EXCLUDED.token,
                expires_at = EXCLUDED.expires_at,
                is_used = false,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id, token, token_type, expires_at, created_at
        `;
        
        const result = await pool.query(query, [userId, refreshToken, expiresAt]);
        
        if (!result.rows.length) {
            throw new Error('Failed to store refresh token');
        }
        
        const tokenRecord = result.rows[0];
        
        console.log(`Refresh token stored successfully for userId: ${userId}`);
        
        return {
            id: tokenRecord.id,
            token: tokenRecord.token,
            type: tokenRecord.token_type,
            expiresAt: tokenRecord.expires_at,
            createdAt: tokenRecord.created_at
        };
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Store refresh token failed:', errorMessage);
        
        // Handle unique constraint violations
        /** @type {any} */
        const dbError = error;
        if (dbError.code === '23505' && dbError.constraint === 'auth_tokens_token_key') {
            throw new Error('Token already exists');
        }
        
        throw error;
    } finally {
        console.debug('Store refresh token process completed');
    }
}


/**
 * Store password reset token for user
 * @param {string} userId - User's UUID
 * @param {string} resetToken - JWT password reset token
 * @param {number} [expiryHours=1] - Token expiry in hours
 * @returns {Promise<Object>} Token record with ID
 */
async function storePasswordResetToken(userId, resetToken, expiryHours = 1) {
    try {
        if (!userId || !resetToken) {
            throw new Error('User ID and reset token are required');
        }
        
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
            
            // Use UPSERT to either insert new password reset token or update existing one
            const upsertQuery = `
                INSERT INTO auth_tokens (user_id, token, token_type, expires_at, is_used)
                VALUES ($1, $2, 'password_reset', $3, false)
                ON CONFLICT (user_id, token_type)
                DO UPDATE SET 
                    token = EXCLUDED.token,
                    expires_at = EXCLUDED.expires_at,
                    is_used = false,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING id, token, token_type, expires_at, created_at
            `;
            
            const result = await client.query(upsertQuery, [userId, resetToken, expiresAt]);
            
            if (!result.rows.length) {
                throw new Error('Failed to store password reset token');
            }
            
            await client.query('COMMIT');
            
            const tokenRecord = result.rows[0];
            
            console.log(`Password reset token stored successfully for userId: ${userId}`);
            
            return {
                id: tokenRecord.id,
                token: tokenRecord.token,
                type: tokenRecord.token_type,
                expiresAt: tokenRecord.expires_at,
                createdAt: tokenRecord.created_at
            };
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Store password reset token failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Store password reset token process completed');
    }
}


/**
 * Find valid OTP token for user
 * @param {string} userId - User's UUID
 * @param {string} otp - OTP code to find
 * @returns {Promise<{id: string, userId: string, token: string, type: string, expiresAt: string, isUsed: boolean, createdAt: string}|null>} Token record or null if not found
 */
async function findValidOTPToken(userId, otp) {
    try {
        if (!userId || !otp) {
            throw new Error('User ID and OTP are required');
        }
        
        const query = `
            SELECT id, user_id, token, token_type, expires_at, is_used, created_at
            FROM auth_tokens 
            WHERE user_id = $1 
                AND token = $2 
                AND token_type = 'otp' 
                AND is_used = false 
                AND expires_at > CURRENT_TIMESTAMP
            ORDER BY created_at DESC
            LIMIT 1
        `;
        
        const result = await pool.query(query, [userId, otp]);
        
        if (!result.rows.length) {
            return null;
        }
        
        const tokenRecord = result.rows[0];
        
        return {
            id: tokenRecord.id,
            userId: tokenRecord.user_id,
            token: tokenRecord.token,
            type: tokenRecord.token_type,
            expiresAt: tokenRecord.expires_at,
            isUsed: tokenRecord.is_used,
            createdAt: tokenRecord.created_at
        };
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Find valid OTP token failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Find valid OTP token process completed');
    }
}


/**
 * Find valid refresh token
 * @param {string} refreshToken - JWT refresh token
 * @returns {Promise<Object|null>} Token record or null if not found
 */
async function findValidRefreshToken(refreshToken) {
    try {
        if (!refreshToken) {
            throw new Error('Refresh token is required');
        }
        
        const query = `
            SELECT id, user_id, token, token_type, expires_at, is_used, created_at
            FROM auth_tokens 
            WHERE token = $1 
                AND token_type = 'refresh' 
                AND is_used = false 
                AND expires_at > CURRENT_TIMESTAMP
        `;
        
        const result = await pool.query(query, [refreshToken]);
        
        if (!result.rows.length) {
            return null;
        }
        
        const tokenRecord = result.rows[0];
        
        return {
            id: tokenRecord.id,
            userId: tokenRecord.user_id,
            token: tokenRecord.token,
            type: tokenRecord.token_type,
            expiresAt: tokenRecord.expires_at,
            isUsed: tokenRecord.is_used,
            createdAt: tokenRecord.created_at
        };
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Find valid refresh token failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Find valid refresh token process completed');
    }
}


/**
 * Find valid password reset token
 * @param {string} resetToken - JWT password reset token
 * @returns {Promise<Object|null>} Token record or null if not found
 */
async function findValidPasswordResetToken(resetToken) {
    try {
        if (!resetToken) {
            throw new Error('Reset token is required');
        }
        
        const query = `
            SELECT id, user_id, token, token_type, expires_at, is_used, created_at
            FROM auth_tokens 
            WHERE token = $1 
                AND token_type = 'password_reset' 
                AND is_used = false 
                AND expires_at > CURRENT_TIMESTAMP
        `;
        
        const result = await pool.query(query, [resetToken]);
        
        if (!result.rows.length) {
            return null;
        }
        
        const tokenRecord = result.rows[0];
        
        return {
            id: tokenRecord.id,
            userId: tokenRecord.user_id,
            token: tokenRecord.token,
            type: tokenRecord.token_type,
            expiresAt: tokenRecord.expires_at,
            isUsed: tokenRecord.is_used,
            createdAt: tokenRecord.created_at
        };
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Find valid password reset token failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Find valid password reset token process completed');
    }
}


/**
 * Mark token as used
 * @param {string} tokenId - Token's UUID
 * @returns {Promise<boolean>} Success status
 */
async function markTokenAsUsed(tokenId) {
    try {
        if (!tokenId) {
            throw new Error('Token ID is required');
        }
        
        const query = `
            UPDATE auth_tokens 
            SET is_used = true, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND is_used = false
            RETURNING id
        `;
        
        const result = await pool.query(query, [tokenId]);
        
        if (!result.rows.length) {
            console.warn(`Token not found or already used: ${tokenId}`);
            return false;
        }
        
        console.log(`Token marked as used successfully: ${tokenId}`);
        
        return true;
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Mark token as used failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Mark token as used process completed');
    }
}


/**
 * Mark token as used by token value and type
 * @param {string} token - Token value
 * @param {string} tokenType - Token type (otp, refresh, password_reset)
 * @returns {Promise<boolean>} Success status
 */
async function markTokenAsUsedByValue(token, tokenType) {
    try {
        if (!token || !tokenType) {
            throw new Error('Token value and type are required');
        }
        
        const validTypes = ['otp', 'refresh', 'password_reset', 'email_change_pending'];
        
        if (!validTypes.includes(tokenType)) {
            throw new Error(`Invalid token type: ${tokenType}`);
        }
        
        const query = `
            UPDATE auth_tokens 
            SET is_used = true, updated_at = CURRENT_TIMESTAMP
            WHERE token = $1 AND token_type = $2 AND is_used = false
            RETURNING id
        `;
        
        const result = await pool.query(query, [token, tokenType]);
        
        if (!result.rows.length) {
            console.warn(`Token not found or already used: ${tokenType} token`);
            return false;
        }
        
        console.log(`Token marked as used successfully: ${tokenType} token`);
        
        return true;
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Mark token as used by value failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Mark token as used by value process completed');
    }
}


/**
 * Get OTP attempt count for user within time window
 * @param {string} userId - User's UUID
 * @param {number} [windowMinutes=60] - Time window in minutes
 * @returns {Promise<number>} Number of OTP attempts
 */
async function getOTPAttemptCount(userId, windowMinutes = 60) {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        const query = `
            SELECT COUNT(*) as count
            FROM auth_tokens 
            WHERE user_id = $1 
                AND token_type = 'otp' 
                AND created_at > CURRENT_TIMESTAMP - INTERVAL '${windowMinutes} minutes'
        `;
        
        const result = await pool.query(query, [userId]);
        
        return parseInt(result.rows[0].count) || 0;
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Get OTP attempt count failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Get OTP attempt count process completed');
    }
}


/**
 * Get recent OTP request count for rate limiting
 * @param {string} userId - User's UUID
 * @param {number} [windowMinutes=5] - Time window in minutes
 * @returns {Promise<number>} Number of recent OTP requests
 */
async function getRecentOTPRequests(userId, windowMinutes = 5) {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        const query = `
            SELECT COUNT(*) as count
            FROM auth_tokens
            WHERE user_id = $1 
                AND token_type = 'otp'
                AND created_at > CURRENT_TIMESTAMP - INTERVAL '${windowMinutes} minutes'
        `;
        
        const result = await pool.query(query, [userId]);
        
        return parseInt(result.rows[0].count) || 0;
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Get recent OTP requests failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Get recent OTP requests process completed');
    }
}


/**
 * Clean up expired tokens
 * @param {string|null} [tokenType] - Specific token type to clean up, or all types if not specified
 * @returns {Promise<number>} Number of tokens cleaned up
 */
async function cleanupExpiredTokens(tokenType = null) {
    try {
        let query = `
            DELETE FROM auth_tokens 
            WHERE expires_at < CURRENT_TIMESTAMP
        `;
        
        const values = [];
        
        if (tokenType) {
            const validTypes = ['otp', 'refresh', 'password_reset', 'email_change_pending'];
            
            if (!validTypes.includes(tokenType)) {
                throw new Error(`Invalid token type: ${tokenType}`);
            }
            
            query += ' AND token_type = $1';
            values.push(tokenType);
        }
        
        const result = await pool.query(query, values);
        
        const deletedCount = result.rowCount || 0;
        
        if (deletedCount > 0) {
            console.log(`Cleaned up ${deletedCount} expired ${tokenType || 'auth'} tokens`);
        }
        
        return deletedCount;
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Cleanup expired tokens failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Cleanup expired tokens process completed');
    }
}


/**
 * Invalidate all tokens for a user (logout from all devices)
 * @param {string} userId - User's UUID
 * @param {string|null} [tokenType] - Specific token type to invalidate, or all types if not specified
 * @returns {Promise<number>} Number of tokens invalidated
 */
async function invalidateUserTokens(userId, tokenType = null) {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        let query = `
            UPDATE auth_tokens 
            SET is_used = true, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $1 AND is_used = false
        `;
        
        const values = [userId];
        
        if (tokenType) {
            const validTypes = ['otp', 'refresh', 'password_reset', 'email_change_pending'];
            
            if (!validTypes.includes(tokenType)) {
                throw new Error(`Invalid token type: ${tokenType}`);
            }
            
            query += ' AND token_type = $2';
            values.push(tokenType);
        }
        
        const result = await pool.query(query, values);
        
        const invalidatedCount = result.rowCount || 0;
        
        if (invalidatedCount > 0) {
            console.log(`Invalidated ${invalidatedCount} ${tokenType || 'auth'} tokens for userId: ${userId}`);
        }
        
        return invalidatedCount;
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Invalidate user tokens failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Invalidate user tokens process completed');
    }
}


// Export all token query functions
module.exports = {
    // Token storage operations
    storeOTPToken,
    storeRefreshToken,
    storePasswordResetToken,
    
    // Token retrieval operations
    findValidOTPToken,
    findValidRefreshToken,
    findValidPasswordResetToken,
    
    // Token state management
    markTokenAsUsed,
    markTokenAsUsedByValue,
    
    // Rate limiting and analytics
    getOTPAttemptCount,
    getRecentOTPRequests,
    
    // Maintenance operations
    cleanupExpiredTokens,
    invalidateUserTokens
};