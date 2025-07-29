/**
 * Basic CRUD operations for MCP instances
 * @fileoverview Contains basic create, read, update, delete operations for MCP instances
 */

const { pool } = require('../../config.js');

/**
 * @typedef {import('./types.js').MCPInstanceFilters} MCPInstanceFilters
 * @typedef {import('./types.js').MCPInstanceRecord} MCPInstanceRecord
 * @typedef {import('./types.js').MCPInstanceUpdateData} MCPInstanceUpdateData
 */

/**
 * Get all MCP instances for a user
 * @param {string} userId - User ID to filter instances
 * @param {MCPInstanceFilters} [filters={}] - Optional filters for status, type, and pagination
 * @returns {Promise<MCPInstanceRecord[]>} Array of MCP instance records
 * @throws {Error} When database query fails
 */
async function getAllMCPInstances(userId, filters = {}) {
	let query = `
		SELECT 
			ms.instance_id,
			ms.user_id,
			ms.custom_name,
			ms.status,
			ms.oauth_status,
			ms.expires_at,
			ms.last_used_at,
			ms.usage_count,
			ms.renewed_count,
			ms.created_at,
			ms.updated_at,
			m.mcp_service_name,
			m.display_name,
			m.type,
			m.port,
			m.icon_url_path,
			c.oauth_completed_at,
			c.token_expires_at
		FROM mcp_service_table ms
		JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
		LEFT JOIN mcp_credentials c ON ms.instance_id = c.instance_id
		WHERE ms.user_id = $1 AND ms.oauth_status = 'completed'
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
		params.push(filters.limit.toString());
		paramIndex++;
	}

	/** @type {import('pg').QueryResult<MCPInstanceRecord>} */
	const result = await pool.query(query, params);
	return result.rows;
}

/**
 * Get single MCP instance by ID
 * @param {string} instanceId - Instance ID to retrieve
 * @param {string} userId - User ID for authorization check
 * @returns {Promise<MCPInstanceRecord|null>} MCP instance record or null if not found
 * @throws {Error} When database query fails
 */
async function getMCPInstanceById(instanceId, userId) {
	const query = `
		SELECT 
			ms.instance_id,
			ms.user_id,
			ms.custom_name,
			ms.status,
			ms.oauth_status,
			ms.expires_at,
			ms.last_used_at,
			ms.usage_count,
			ms.renewed_count,
			ms.created_at,
			ms.updated_at,
			m.mcp_service_name,
			m.display_name,
			m.type,
			m.port,
			m.icon_url_path,
			c.api_key,
			c.client_id,
			c.client_secret,
			c.access_token,
			c.refresh_token,
			c.token_expires_at,
			c.oauth_completed_at
		FROM mcp_service_table ms
		JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
		LEFT JOIN mcp_credentials c ON ms.instance_id = c.instance_id
		WHERE ms.instance_id = $1 AND ms.user_id = $2
	`;

	/** @type {import('pg').QueryResult<MCPInstanceRecord>} */
	const result = await pool.query(query, [instanceId, userId]);
	return result.rows[0] || null;
}

/**
 * Update MCP instance
 * @param {string} instanceId - Instance ID to update
 * @param {string} userId - User ID for authorization check
 * @param {MCPInstanceUpdateData} updateData - Object containing fields to update
 * @returns {Promise<MCPInstanceRecord|null>} Updated instance record or null if not found
 * @throws {Error} When no update data provided or database query fails
 */
async function updateMCPInstance(instanceId, userId, updateData) {
	/** @type {string[]} */
	const setClauses = [];
	/** @type {(string|Date|null)[]} */
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

	// Add WHERE clause parameters
	params.push(instanceId);
	const instanceIdParam = paramIndex;
	paramIndex++;

	params.push(userId);
	const userIdParam = paramIndex;

	const query = `
		UPDATE mcp_service_table 
		SET ${setClauses.join(', ')}
		WHERE instance_id = $${instanceIdParam} AND user_id = $${userIdParam}
		RETURNING *
	`;

	/** @type {import('pg').QueryResult<MCPInstanceRecord>} */
	const result = await pool.query(query, params);
	return result.rows[0] || null;
}

/**
 * Delete MCP instance
 * @param {string} instanceId - Instance ID to delete
 * @param {string} userId - User ID for authorization check
 * @returns {Promise<boolean>} True if instance was deleted, false if not found
 * @throws {Error} When database query fails
 */
async function deleteMCPInstance(instanceId, userId) {
	const query = `
		DELETE FROM mcp_service_table 
		WHERE instance_id = $1 AND user_id = $2
	`;

	/** @type {import('pg').QueryResult} */
	const result = await pool.query(query, [instanceId, userId]);
	return (result.rowCount ?? 0) > 0;
}

module.exports = {
	getAllMCPInstances,
	getMCPInstanceById,
	updateMCPInstance,
	deleteMCPInstance
};