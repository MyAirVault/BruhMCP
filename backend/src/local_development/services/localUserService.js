// @ts-check

/**
 * Local Development User Service
 * @fileoverview Service for managing user authentication in local development mode
 */

const bcrypt = require('bcrypt');
const { findOrCreateUser } = require('../../db/queries/authQueries.js');
const { 
    getUserWithPasswordHash, 
    updateUserPassword, 
    getAllUsersWithPasswordStatus 
} = require('../queries/localUserQueries.js');

class LocalUserService {
    /**
     * Login or register user with email/password
     * @param {string} email 
     * @param {string} password 
     */
    async loginOrRegister(email, password) {
        try {
            // Check if user exists with password hash
            let user = await getUserWithPasswordHash(email);
            
            if (user) {
                // User exists - verify password
                if (!(/** @type {any} */ (user)).password_hash) {
                    return { 
                        success: false, 
                        error: 'PASSWORD_NOT_SET',
                        message: 'Password not set for this user. Use CLI to set password: npm run auth:set-password'
                    };
                }

                const isValid = await bcrypt.compare(password, (/** @type {any} */ (user)).password_hash);
                if (!isValid) {
                    return { 
                        success: false, 
                        error: 'INVALID_PASSWORD',
                        message: 'Invalid password'
                    };
                }

                return {
                    success: true,
                    user: {
                        id: (/** @type {any} */ (user)).id,
                        email: (/** @type {any} */ (user)).email
                    },
                    isNewUser: false
                };
            } else {
                // User doesn't exist - create new user with password
                const saltRounds = 10;
                const passwordHash = await bcrypt.hash(password, saltRounds);
                
                // Create user in database (reuse existing function)
                user = await findOrCreateUser(email);
                
                // Set password hash
                await updateUserPassword((/** @type {any} */ (user)).id, passwordHash);
                
                return {
                    success: true,
                    user: {
                        id: (/** @type {any} */ (user)).id,
                        email: (/** @type {any} */ (user)).email
                    },
                    isNewUser: true
                };
            }
        } catch (error) {
            console.error('Error in loginOrRegister:', error);
            return {
                success: false,
                error: 'DATABASE_ERROR',
                message: 'Database operation failed'
            };
        }
    }

    /**
     * Set password for existing user (via CLI)
     * @param {string} email 
     * @param {string} password 
     */
    async setPasswordForEmail(email, password) {
        try {
            let user = await getUserWithPasswordHash(email);
            
            if (!user) {
                // Create user if doesn't exist
                user = await findOrCreateUser(email);
                console.log(`Created new user: ${email}`);
            }

            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            await updateUserPassword((/** @type {any} */ (user)).id, passwordHash);
            
            const isNewUser = !(/** @type {any} */ (user)).password_hash;
            console.log(`✅ Password ${isNewUser ? 'set' : 'updated'} for user: ${email}`);
            
            return { success: true, isNewUser };
        } catch (error) {
            console.error('Error setting password:', error);
            return { success: false, error: (/** @type {Error} */ (error)).message };
        }
    }

    /**
     * List all users with password status
     */
    async listUsers() {
        try {
            const users = await getAllUsersWithPasswordStatus();
            return { success: true, users };
        } catch (error) {
            console.error('Error listing users:', error);
            return { success: false, error: (/** @type {Error} */ (error)).message };
        }
    }

    /**
     * Verify user credentials (password check only)
     * @param {string} email 
     * @param {string} password 
     */
    async verifyCredentials(email, password) {
        try {
            const user = await getUserWithPasswordHash(email);
            
            if (!user) {
                return { 
                    success: false, 
                    error: 'USER_NOT_FOUND',
                    message: 'User not found'
                };
            }

            if (!(/** @type {any} */ (user)).password_hash) {
                return { 
                    success: false, 
                    error: 'PASSWORD_NOT_SET',
                    message: 'Password not set for this user'
                };
            }

            const isValid = await bcrypt.compare(password, (/** @type {any} */ (user)).password_hash);
            
            if (!isValid) {
                return { 
                    success: false, 
                    error: 'INVALID_PASSWORD',
                    message: 'Invalid password'
                };
            }

            return {
                success: true,
                user: {
                    id: (/** @type {any} */ (user)).id,
                    email: (/** @type {any} */ (user)).email
                }
            };
        } catch (error) {
            console.error('Error verifying credentials:', error);
            return {
                success: false,
                error: 'DATABASE_ERROR',
                message: 'Database operation failed'
            };
        }
    }
}

const localUserService = new LocalUserService();

module.exports = { localUserService };