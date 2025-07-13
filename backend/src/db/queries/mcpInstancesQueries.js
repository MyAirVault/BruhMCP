/**
 * Database queries for MCP instances operations
 * @fileoverview Contains all database query functions for MCP instance management
 */

import { pool } from '../config.js';

/**
 * Get all MCP instances for a user
 * @param {string} userId - User ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Array of MCP instance records
 */
export async function getAllMCPInstances(userId, filters = {}) {
	let query = `
		SELECT 
			ms.instance_id,
			ms.user_id,
			ms.custom_name,
			ms.status,
			ms.expires_at,
			ms.last_used_at,
			ms.usage_count,
			ms.renewed_count,
			ms.created_at,
			ms.updated_at,
			m.mcp_service_name,
			m.display_name,
			m.type,
			m.port
		FROM mcp_service_table ms
		JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
		WHERE ms.user_id = $1
	`;
	
	const params = [userId];
	let paramIndex = 2;
	
	if (filters.status) {
		query += ` AND ms.status = $${paramIndex}`;
		params.push(filters.status);
		paramIndex++;
	}
	
	if (filters.mcp_type) {
		query += ` AND m.mcp_service_name = $${paramIndex}`;
		params.push(filters.mcp_type);
		paramIndex++;
	}
	
	query += ` ORDER BY ms.created_at DESC`;
	
	if (filters.limit) {
		query += ` LIMIT $${paramIndex}`;
		params.push(filters.limit);
		paramIndex++;
	}
	
	const result = await pool.query(query, params);
	return result.rows;
}

/**
 * Get single MCP instance by ID
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object|null>} MCP instance record or null
 */
export async function getMCPInstanceById(instanceId, userId) {
	const query = `
		SELECT 
			ms.instance_id,
			ms.user_id,
			ms.custom_name,
			ms.status,
			ms.expires_at,
			ms.last_used_at,
			ms.usage_count,
			ms.renewed_count,
			ms.created_at,
			ms.updated_at,
			m.mcp_service_name,
			m.display_name,
			m.type,
			m.port
		FROM mcp_service_table ms
		JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
		WHERE ms.instance_id = $1 AND ms.user_id = $2
	`;
	
	const result = await pool.query(query, [instanceId, userId]);
	return result.rows[0] || null;
}

/**
 * Update MCP instance
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated instance record or null
 */
export async function updateMCPInstance(instanceId, userId, updateData) {
	const setClauses = [];
	const params = [];
	let paramIndex = 1;
	
	if (updateData.custom_name !== undefined) {
		setClauses.push(`custom_name = $${paramIndex}`);
		params.push(updateData.custom_name);
		paramIndex++;
	}
	
	if (updateData.status !== undefined) {
		setClauses.push(`status = $${paramIndex}`);
		params.push(updateData.status);
		paramIndex++;
	}
	
	if (updateData.expires_at !== undefined) {
		setClauses.push(`expires_at = $${paramIndex}`);
		params.push(updateData.expires_at);
		paramIndex++;
	}
	
	if (updateData.api_key !== undefined) {
		setClauses.push(`api_key = $${paramIndex}`);
		params.push(updateData.api_key);
		paramIndex++;
	}
	
	if (updateData.client_id !== undefined) {
		setClauses.push(`client_id = $${paramIndex}`);
		params.push(updateData.client_id);
		paramIndex++;
	}
	
	if (updateData.client_secret !== undefined) {
		setClauses.push(`client_secret = $${paramIndex}`);
		params.push(updateData.client_secret);
		paramIndex++;
	}
	
	if (setClauses.length === 0) {
		throw new Error('No update data provided');
	}
	
	setClauses.push(`updated_at = NOW()`);
	params.push(instanceId, userId);
	
	const query = `
		UPDATE mcp_service_table 
		SET ${setClauses.join(', ')}
		WHERE instance_id = $${paramIndex} AND user_id = $${paramIndex + 1}
		RETURNING *
	`;
	
	const result = await pool.query(query, params);
	return result.rows[0] || null;
}

/**
 * Delete MCP instance
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<boolean>} Success status
 */
export async function deleteMCPInstance(instanceId, userId) {
	const query = `
		DELETE FROM mcp_service_table 
		WHERE instance_id = $1 AND user_id = $2
	`;
	
	const result = await pool.query(query, [instanceId, userId]);
	return result.rowCount > 0;
}

/**
 * Toggle MCP instance status
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {boolean} isActive - New active status
 * @returns {Promise<Object|null>} Updated instance record or null
 */
export async function toggleMCPInstance(instanceId, userId, isActive) {
	const status = isActive ? 'active' : 'inactive';
	return updateMCPInstance(instanceId, userId, { status });
}

/**
 * Renew MCP instance
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {Date} newExpirationDate - New expiration date
 * @returns {Promise<Object|null>} Updated instance record or null
 */
export async function renewMCPInstance(instanceId, userId, newExpirationDate) {
	const query = `
		UPDATE mcp_service_table 
		SET 
			status = 'active',
			expires_at = $1,
			renewed_count = renewed_count + 1,
			last_renewed_at = NOW(),
			updated_at = NOW()
		WHERE instance_id = $2 AND user_id = $3
		RETURNING *
	`;
	
	const result = await pool.query(query, [newExpirationDate, instanceId, userId]);
	return result.rows[0] || null;
}

/**
 * Update instance status only
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {string} status - New status (active, inactive, expired)
 * @returns {Promise<Object|null>} Updated instance record or null
 */
export async function updateInstanceStatus(instanceId, userId, status) {
	const query = `
		UPDATE mcp_service_table 
		SET status = $1, updated_at = NOW() 
		WHERE instance_id = $2 AND user_id = $3 
		RETURNING instance_id, status, updated_at
	`;
	
	const result = await pool.query(query, [status, instanceId, userId]);
	return result.rows[0] || null;
}

/**
 * Update instance expiration and activate
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {string} newExpirationDate - New expiration date
 * @returns {Promise<Object|null>} Updated instance record or null
 */
export async function renewInstanceExpiration(instanceId, userId, newExpirationDate) {
	const query = `
		UPDATE mcp_service_table 
		SET expires_at = $1, status = 'active', updated_at = NOW() 
		WHERE instance_id = $2 AND user_id = $3 
		RETURNING instance_id, status, expires_at, updated_at
	`;
	
	const result = await pool.query(query, [newExpirationDate, instanceId, userId]);
	return result.rows[0] || null;
}

/**
 * Get instances by status (for background maintenance)
 * @param {string} status - Status to filter by
 * @returns {Promise<Array>} Array of instances with the specified status
 */
export async function getInstancesByStatus(status) {
	const query = `
		SELECT 
			ms.instance_id,
			ms.user_id,
			ms.status,
			ms.expires_at,
			ms.updated_at,
			m.mcp_service_name
		FROM mcp_service_table ms
		JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
		WHERE ms.status = $1
		ORDER BY ms.updated_at DESC
	`;
	
	const result = await pool.query(query, [status]);
	return result.rows;
}

/**
 * Get expired instances (for background cleanup)
 * @returns {Promise<Array>} Array of expired instances
 */
export async function getExpiredInstances() {
	const query = `
		SELECT 
			ms.instance_id,
			ms.user_id,
			ms.status,
			ms.expires_at,
			ms.updated_at,
			m.mcp_service_name
		FROM mcp_service_table ms
		JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
		WHERE ms.expires_at < NOW() AND ms.status != 'expired'
		ORDER BY ms.expires_at ASC
	`;
	
	const result = await pool.query(query);
	return result.rows;
}

/**
 * Bulk update expired instances to expired status
 * @param {Array<string>} instanceIds - Array of instance IDs to mark as expired
 * @returns {Promise<number>} Number of instances updated
 */
export async function bulkMarkInstancesExpired(instanceIds) {
	if (instanceIds.length === 0) return 0;
	
	const placeholders = instanceIds.map((_, index) => `$${index + 1}`).join(',');
	const query = `
		UPDATE mcp_service_table 
		SET status = 'expired', updated_at = NOW() 
		WHERE instance_id IN (${placeholders})
	`;
	
	const result = await pool.query(query, instanceIds);
	return result.rowCount;
}