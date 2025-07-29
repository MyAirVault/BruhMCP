/**
 * Database queries for user operations
 * @fileoverview Contains all database query functions for user management
 */

const { pool } = require('../config.js');

/**
 * @typedef {Object} DatabaseUser
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string|null} name - User name
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} UserStats
 * @property {number} total_instances - Total MCP instances
 * @property {number} active_instances - Active MCP instances
 * @property {number} expired_instances - Expired MCP instances  
 * @property {number} inactive_instances - Inactive MCP instances
 * @property {string|null} first_instance_created - First instance creation timestamp
 * @property {string|null} last_activity - Last activity timestamp
 */

/**
 * Find user by email address
 * @param {string} email - User email
 * @returns {Promise<DatabaseUser|null>} User record or null
 */
async function findUserByEmail(email) {
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
 * @returns {Promise<DatabaseUser|null>} User record or null
 */
async function findUserById(userId) {
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
 * @param {string|null} [userData.name] - User name
 * @returns {Promise<DatabaseUser>} Created user record
 */
async function createUser(userData) {
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
 * @param {string|null} [name] - User name
 * @returns {Promise<DatabaseUser>} User record (existing or newly created)
 */
async function findOrCreateUser(email, name = null) {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');

		const userQuery = `
			INSERT INTO users (email, name)
			VALUES ($1, $2)
			ON CONFLICT (email) 
			DO UPDATE SET 
				name = COALESCE(EXCLUDED.name, users.name),
				updated_at = NOW()
			RETURNING id, email, name, created_at, updated_at
		`;
		
		const userResult = await client.query(userQuery, [email, name]);
		const user = userResult.rows[0];

		// Create a default free plan for new users
		const planQuery = `
			INSERT INTO user_plans (user_id, plan_type, max_instances, expires_at, features)
			VALUES ($1, 'free', 1, NULL, '{"plan_name": "Free Plan", "description": "1 active MCP instance maximum"}')
			ON CONFLICT (user_id) DO NOTHING
		`;
		
		await client.query(planQuery, [user.id]);

		await client.query('COMMIT');
		return user;
	} catch (error) {
		await client.query('ROLLBACK');
		console.error('Error in findOrCreateUser:', error);
		throw error;
	} finally {
		client.release();
	}
}

/**
 * Update user information
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @param {string|null} [updateData.name] - User name
 * @param {string} [updateData.email] - User email
 * @returns {Promise<DatabaseUser|null>} Updated user record or null
 */
async function updateUser(userId, updateData) {
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
 * @returns {Promise<UserStats>} User statistics
 */
async function getUserStats(userId) {
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

module.exports = {
	findUserByEmail,
	findUserById,
	createUser,
	findOrCreateUser,
	updateUser,
	getUserStats
};