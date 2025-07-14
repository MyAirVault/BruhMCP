/**
 * Database queries for user operations
 * @fileoverview Contains all database query functions for user management
 */

import { pool } from '../config.js';

/**
 * Find user by email address
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User record or null
 */
export async function findUserByEmail(email) {
	const query = `
		SELECT 
			id,
			email,
			name,
			created_at,
			updated_at
		FROM users 
		WHERE email = $1
	`;
	
	const result = await pool.query(query, [email]);
	return result.rows[0] || null;
}

/**
 * Find user by ID
 * @param {string} userId - User ID (UUID)
 * @returns {Promise<Object|null>} User record or null
 */
export async function findUserById(userId) {
	const query = `
		SELECT 
			id,
			email,
			name,
			created_at,
			updated_at
		FROM users 
		WHERE id = $1
	`;
	
	const result = await pool.query(query, [userId]);
	return result.rows[0] || null;
}

/**
 * Create new user
 * @param {Object} userData - User data
 * @param {string} userData.email - User email
 * @param {string} [userData.name] - User name
 * @returns {Promise<Object>} Created user record
 */
export async function createUser(userData) {
	const { email, name } = userData;
	
	const query = `
		INSERT INTO users (email, name)
		VALUES ($1, $2)
		RETURNING id, email, name, created_at, updated_at
	`;
	
	const result = await pool.query(query, [email, name || null]);
	return result.rows[0];
}

/**
 * Find existing user or create new one (upsert pattern)
 * @param {string} email - User email
 * @param {string} [name] - User name
 * @returns {Promise<Object>} User record (existing or newly created)
 */
export async function findOrCreateUser(email, name = null) {
	const query = `
		INSERT INTO users (email, name)
		VALUES ($1, $2)
		ON CONFLICT (email) 
		DO UPDATE SET 
			name = COALESCE(EXCLUDED.name, users.name),
			updated_at = NOW()
		RETURNING id, email, name, created_at, updated_at
	`;
	
	const result = await pool.query(query, [email, name]);
	return result.rows[0];
}

/**
 * Update user information
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @param {string} [updateData.name] - User name
 * @param {string} [updateData.email] - User email
 * @returns {Promise<Object|null>} Updated user record or null
 */
export async function updateUser(userId, updateData) {
	const setClauses = [];
	const params = [];
	let paramIndex = 1;
	
	if (updateData.name !== undefined) {
		setClauses.push(`name = $${paramIndex}`);
		params.push(updateData.name);
		paramIndex++;
	}
	
	if (updateData.email !== undefined) {
		setClauses.push(`email = $${paramIndex}`);
		params.push(updateData.email);
		paramIndex++;
	}
	
	if (setClauses.length === 0) {
		throw new Error('No update data provided');
	}
	
	setClauses.push(`updated_at = NOW()`);
	params.push(userId);
	
	const query = `
		UPDATE users 
		SET ${setClauses.join(', ')}
		WHERE id = $${paramIndex}
		RETURNING id, email, name, created_at, updated_at
	`;
	
	const result = await pool.query(query, params);
	return result.rows[0] || null;
}

/**
 * Get user statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User statistics
 */
export async function getUserStats(userId) {
	const query = `
		SELECT 
			COUNT(ms.instance_id) as total_instances,
			COUNT(CASE WHEN ms.status = 'active' THEN 1 END) as active_instances,
			COUNT(CASE WHEN ms.status = 'expired' THEN 1 END) as expired_instances,
			COUNT(CASE WHEN ms.status = 'inactive' THEN 1 END) as inactive_instances,
			MIN(ms.created_at) as first_instance_created,
			MAX(ms.last_used_at) as last_activity
		FROM users u
		LEFT JOIN mcp_service_table ms ON u.id = ms.user_id
		WHERE u.id = $1
		GROUP BY u.id
	`;
	
	const result = await pool.query(query, [userId]);
	return result.rows[0] || {
		total_instances: 0,
		active_instances: 0,
		expired_instances: 0,
		inactive_instances: 0,
		first_instance_created: null,
		last_activity: null
	};
}