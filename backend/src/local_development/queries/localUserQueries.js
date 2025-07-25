// @ts-check

/**
 * Local Development User Database Queries
 * @fileoverview Database queries specific to local development password management
 */

import { db } from '../../db/connection.js';

/**
 * Update user password hash
 * @param {number} userId 
 * @param {string} passwordHash 
 * @returns {Promise<Object>}
 */
export async function updateUserPassword(userId, passwordHash) {
    const query = `
        UPDATE users 
        SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, email, created_at, updated_at
    `;
    
    try {
        const result = await db.query(query, [passwordHash, userId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating user password:', error);
        throw error;
    }
}

/**
 * Get all users with password status for local development
 * @returns {Promise<Array>}
 */
export async function getAllUsersWithPasswordStatus() {
    const query = `
        SELECT 
            id, 
            email, 
            created_at,
            updated_at,
            CASE WHEN password_hash IS NOT NULL THEN true ELSE false END as has_password
        FROM users 
        ORDER BY created_at DESC
    `;
    
    try {
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error getting users with password status:', error);
        throw error;
    }
}

/**
 * Get user with password hash (for password verification)
 * @param {string} email 
 * @returns {Promise<Object|null>}
 */
export async function getUserWithPasswordHash(email) {
    const query = `
        SELECT id, email, password_hash, created_at, updated_at
        FROM users 
        WHERE email = $1
    `;
    
    try {
        const result = await db.query(query, [email]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error getting user with password hash:', error);
        throw error;
    }
}

/**
 * Check if user has password set
 * @param {string} email 
 * @returns {Promise<boolean>}
 */
export async function userHasPassword(email) {
    const query = `
        SELECT id
        FROM users 
        WHERE email = $1 AND password_hash IS NOT NULL
    `;
    
    try {
        const result = await db.query(query, [email]);
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error checking if user has password:', error);
        throw error;
    }
}