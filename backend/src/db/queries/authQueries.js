/**
 * Authentication database queries for PostgreSQL
 * Handles all user-related CRUD operations with proper error handling
 * 
 * Converts SQLite synchronous operations to PostgreSQL async operations:
 * - Replace db.prepare().get() with pool.query()
 * - Convert ? placeholders to $1, $2, etc.
 * - Handle UUIDs instead of INTEGER IDs
 * - Use proper PostgreSQL column names and types
 */

const { pool } = require('../config');


/**
 * Create a new user account
 * @param {Object} userData - User registration data
 * @param {string} userData.firstName - User's first name
 * @param {string} userData.lastName - User's last name  
 * @param {string} userData.email - User's email address
 * @param {string} userData.passwordHash - Hashed password
 * @param {boolean} [userData.isVerified=false] - Email verification status
 * @returns {Promise<{id: string, firstName: string, lastName: string, email: string, isVerified: boolean, createdAt: Date, updatedAt: Date}>} Created user data with ID
 */
async function createUser(userData) {
    try {
        const { firstName, lastName, email, passwordHash, isVerified = false } = userData;
        
        if (!firstName || !email || !passwordHash) {
            throw new Error('Missing required fields: firstName, email, and passwordHash are required');
        }
        
        const query = `
            INSERT INTO users (first_name, last_name, email, password, email_verified)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, first_name, last_name, email, email_verified, created_at, updated_at
        `;
        
        const values = [
            firstName.trim(),
            lastName ? lastName.trim() : '',
            email.toLowerCase().trim(),
            passwordHash,
            isVerified
        ];
        
        const result = await pool.query(query, values);
        
        if (!result.rows.length) {
            throw new Error('Failed to create user account');
        }
        
        const user = result.rows[0];
        
        console.log(`User created successfully: ${email.toLowerCase().trim()}, userId: ${user.id}`);
        
        return {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            isVerified: user.email_verified,
            createdAt: user.created_at,
            updatedAt: user.updated_at
        };
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Create user failed:', errorMessage);
        
        // Handle specific PostgreSQL errors
        /** @type {any} */
        const dbError = error;
        if (dbError.code === '23505' && dbError.constraint === 'users_email_key') {
            throw new Error('User with this email already exists');
        }
        
        throw error;
    } finally {
        console.debug('Create user process completed');
    }
}


/**
 * Find user by email address
 * @param {string} email - User's email address
 * @returns {Promise<{id: string, firstName: string, lastName: string, email: string, password_hash: string, isVerified: boolean, razorpayCustomerId: string|null, createdAt: Date, updatedAt: Date, lastLoginAt: Date|null, isActive: boolean}|null>} User data or null if not found
 */
async function findUserByEmail(email) {
    try {
        if (!email) {
            throw new Error('Email is required');
        }
        
        const query = `
            SELECT id, first_name, last_name, email, password, email_verified, 
                   razorpay_customer_id, created_at, updated_at, last_login_at, is_active
            FROM users 
            WHERE LOWER(TRIM(email)) = LOWER(TRIM($1)) AND is_active = true
        `;
        
        const result = await pool.query(query, [email]);
        
        if (!result.rows.length) {
            return null;
        }
        
        const user = result.rows[0];
        
        return {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            password_hash: user.password, // Keep same name for compatibility
            isVerified: user.email_verified,
            razorpayCustomerId: user.razorpay_customer_id,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            lastLoginAt: user.last_login_at,
            isActive: user.is_active
        };
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Find user by email failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Find user by email process completed');
    }
}


/**
 * Find user by ID
 * @param {string} userId - User's UUID
 * @returns {Promise<{id: string, firstName: string, lastName: string, email: string, password_hash: string, isVerified: boolean, razorpayCustomerId: string|null, createdAt: Date, updatedAt: Date, lastLoginAt: Date|null, isActive: boolean}|null>} User data or null if not found
 */
async function findUserById(userId) {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        const query = `
            SELECT id, first_name, last_name, email, password, email_verified, 
                   razorpay_customer_id, created_at, updated_at, last_login_at, is_active
            FROM users 
            WHERE id = $1 AND is_active = true
        `;
        
        const result = await pool.query(query, [userId]);
        
        if (!result.rows.length) {
            return null;
        }
        
        const user = result.rows[0];
        
        return {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            password_hash: user.password, // Keep same name for compatibility
            isVerified: user.email_verified,
            razorpayCustomerId: user.razorpay_customer_id,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            lastLoginAt: user.last_login_at,
            isActive: user.is_active
        };
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Find user by ID failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Find user by ID process completed');
    }
}


/**
 * Update user data
 * @param {string} userId - User's UUID
 * @param {Object} updateData - Data to update
 * @returns {Promise<{id: string, firstName: string, lastName: string, email: string, isVerified: boolean, razorpayCustomerId: string|null, createdAt: Date, updatedAt: Date, lastLoginAt: Date|null, isActive: boolean}>} Updated user data
 */
async function updateUser(userId, updateData) {
    try {
        if (!userId || !updateData || Object.keys(updateData).length === 0) {
            throw new Error('User ID and update data are required');
        }
        
        const allowedFields = [
            'first_name', 'last_name', 'email', 'password', 'email_verified',
            'razorpay_customer_id', 'last_login_at'
        ];
        
        /** @type {string[]} */
        const updateFields = [];
        /** @type {any[]} */
        const values = [];
        let paramCount = 1;
        
        // Build dynamic update query
        /** @type {Record<string, any>} */
        const updateObj = updateData;
        Object.keys(updateObj).forEach(key => {
            let dbField = key;
            
            // Map camelCase to snake_case
            if (key === 'firstName') dbField = 'first_name';
            else if (key === 'lastName') dbField = 'last_name';
            else if (key === 'passwordHash') dbField = 'password';
            else if (key === 'isVerified') dbField = 'email_verified';
            else if (key === 'razorpayCustomerId') dbField = 'razorpay_customer_id';
            else if (key === 'lastLoginAt') dbField = 'last_login_at';
            
            if (allowedFields.includes(dbField)) {
                updateFields.push(`${dbField} = $${paramCount + 1}`);
                values.push(updateObj[key]);
                paramCount++;
            }
        });
        
        if (updateFields.length === 0) {
            throw new Error('No valid fields to update');
        }
        
        const query = `
            UPDATE users 
            SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND is_active = true
            RETURNING id, first_name, last_name, email, email_verified, 
                      razorpay_customer_id, created_at, updated_at, last_login_at, is_active
        `;
        
        const result = await pool.query(query, [userId, ...values]);
        
        if (!result.rows.length) {
            throw new Error('User not found or update failed');
        }
        
        const user = result.rows[0];
        
        console.log(`User updated successfully: ${user.email}, userId: ${user.id}`);
        
        return {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            isVerified: user.email_verified,
            razorpayCustomerId: user.razorpay_customer_id,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            lastLoginAt: user.last_login_at,
            isActive: user.is_active
        };
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Update user failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Update user process completed');
    }
}


/**
 * Update user password
 * @param {string} userId - User's UUID
 * @param {string} newPasswordHash - New hashed password
 * @returns {Promise<boolean>} Success status
 */
async function updateUserPassword(userId, newPasswordHash) {
    try {
        if (!userId || !newPasswordHash) {
            throw new Error('User ID and new password hash are required');
        }
        
        const query = `
            UPDATE users 
            SET password = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND is_active = true
            RETURNING id
        `;
        
        const result = await pool.query(query, [userId, newPasswordHash]);
        
        if (!result.rows.length) {
            throw new Error('User not found or password update failed');
        }
        
        console.log(`Password updated successfully for userId: ${userId}`);
        
        return true;
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Update user password failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Update user password process completed');
    }
}


/**
 * Mark user email as verified
 * @param {string} userId - User's UUID
 * @returns {Promise<boolean>} Success status
 */
async function markEmailAsVerified(userId) {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        const query = `
            UPDATE users 
            SET email_verified = true, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND is_active = true
            RETURNING id, email
        `;
        
        const result = await pool.query(query, [userId]);
        
        if (!result.rows.length) {
            throw new Error('User not found or verification failed');
        }
        
        console.log(`Email verified successfully for user: ${result.rows[0].email}, userId: ${userId}`);
        
        return true;
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Mark email as verified failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Mark email as verified process completed');
    }
}


/**
 * Update user's last login timestamp
 * @param {string} userId - User's UUID
 * @returns {Promise<boolean>} Success status
 */
async function updateLastLogin(userId) {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        const query = `
            UPDATE users 
            SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND is_active = true
            RETURNING id
        `;
        
        const result = await pool.query(query, [userId]);
        
        if (!result.rows.length) {
            console.warn(`Failed to update last login for userId: ${userId} - user not found`);
            return false;
        }
        
        console.log(`Last login updated successfully for userId: ${userId}`);
        
        return true;
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Update last login failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Update last login process completed');
    }
}


/**
 * Check if user exists with email (including unverified users)
 * @param {string} email - User's email address
 * @returns {Promise<{id: string, isVerified: boolean, isActive: boolean}|null>} Minimal user data or null
 */
async function checkUserExists(email) {
    try {
        if (!email) {
            throw new Error('Email is required');
        }
        
        const query = `
            SELECT id, email_verified, is_active
            FROM users 
            WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
        `;
        
        const result = await pool.query(query, [email]);
        
        if (!result.rows.length) {
            return null;
        }
        
        const user = result.rows[0];
        
        return {
            id: user.id,
            isVerified: user.email_verified,
            isActive: user.is_active
        };
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Check user exists failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Check user exists process completed');
    }
}


/**
 * Soft delete user (mark as inactive)
 * @param {string} userId - User's UUID
 * @returns {Promise<boolean>} Success status
 */
async function deactivateUser(userId) {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        const query = `
            UPDATE users 
            SET is_active = false, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id, email
        `;
        
        const result = await pool.query(query, [userId]);
        
        if (!result.rows.length) {
            throw new Error('User not found');
        }
        
        console.log(`User deactivated successfully: ${result.rows[0].email}, userId: ${userId}`);
        
        return true;
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Deactivate user failed:', errorMessage);
        throw error;
    } finally {
        console.debug('Deactivate user process completed');
    }
}


/**
 * Find existing user or create new one (upsert pattern)
 * Used primarily for local development authentication
 * @param {string} email - User email
 * @param {string} [firstName] - User first name
 * @param {string} [lastName] - User last name
 * @returns {Promise<Object>} User record (existing or newly created)
 */
async function findOrCreateUser(email, firstName = 'User', lastName = '') {
    try {
        // First try to find existing user
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return existingUser;
        }

        // User doesn't exist, create new one with minimal data
        return await createUser({
            email,
            firstName,
            lastName,
            passwordHash: '', // Will be set later by local auth system
            isVerified: true  // Local development users are auto-verified
        });
    } catch (error) {
        console.error('Error in findOrCreateUser:', error);
        throw error;
    } finally {
        console.debug('Find or create user process completed');
    }
}


// Export all authentication query functions
module.exports = {
    // Core CRUD operations
    createUser,
    findUserByEmail,
    findUserById,
    updateUser,
    
    // Specific update operations
    updateUserPassword,
    markEmailAsVerified,
    updateLastLogin,
    
    // Utility functions
    checkUserExists,
    deactivateUser,
    findOrCreateUser
};