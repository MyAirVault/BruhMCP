// @ts-check

/**
 * Local Development User Service
 * @fileoverview Service for managing user authentication in local development mode
 */

import bcrypt from 'bcrypt';
import { findOrCreateUser } from '../../db/queries/userQueries.js';
import { 
    getUserWithPasswordHash, 
    updateUserPassword, 
    getAllUsersWithPasswordStatus 
} from '../queries/localUserQueries.js';

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
                if (!user.password_hash) {
                    return { 
                        success: false, 
                        error: 'PASSWORD_NOT_SET',
                        message: 'Password not set for this user. Use CLI to set password: npm run auth:set-password'
                    };
                }

                const isValid = await bcrypt.compare(password, user.password_hash);
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
                        id: user.id,
                        email: user.email
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
                await updateUserPassword(user.id, passwordHash);
                
                return {
                    success: true,
                    user: {
                        id: user.id,
                        email: user.email
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
            await updateUserPassword(user.id, passwordHash);
            
            const isNewUser = !user.password_hash;
            console.log(`✅ Password ${isNewUser ? 'set' : 'updated'} for user: ${email}`);
            
            return { success: true, isNewUser };
        } catch (error) {
            console.error('Error setting password:', error);
            return { success: false, error: error.message };
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
            return { success: false, error: error.message };
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

            if (!user.password_hash) {
                return { 
                    success: false, 
                    error: 'PASSWORD_NOT_SET',
                    message: 'Password not set for this user'
                };
            }

            const isValid = await bcrypt.compare(password, user.password_hash);
            
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
                    id: user.id,
                    email: user.email
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

export const localUserService = new LocalUserService();