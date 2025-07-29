/**
 * Instance status management operations for MCP instances
 * @fileoverview Contains functions for managing instance status, renewal, and activation
 */

const { pool } = require('../../config.js');
const { updateMCPInstance } = require('./crud.js');

/**
 * @typedef {import('./types.js').MCPInstanceRecord} MCPInstanceRecord
 */

/**
 * Toggle MCP instance status
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {boolean} isActive - New active status
 * @returns {Promise<MCPInstanceRecord|null>} Updated instance record or null
 */
async function toggleMCPInstance(instanceId, userId, isActive) {
	const status = isActive ? 'active' : 'inactive';
	return updateMCPInstance(instanceId, userId, { status });
}

/**
 * Renew MCP instance
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @param {Date} newExpirationDate - New expiration date
 * @returns {Promise<MCPInstanceRecord|null>} Updated instance record or null
 */
async function renewMCPInstance(instanceId, userId, newExpirationDate) {
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
 * @returns {Promise<MCPInstanceRecord|null>} Updated instance record or null
 */
async function updateInstanceStatus(instanceId, userId, status) {
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
 * @returns {Promise<MCPInstanceRecord|null>} Updated instance record or null
 */
async function renewInstanceExpiration(instanceId, userId, newExpirationDate) {
	const query = `
		UPDATE mcp_service_table 
		SET expires_at = $1, status = 'active', updated_at = NOW() 
		WHERE instance_id = $2 AND user_id = $3 
		RETURNING instance_id, status, expires_at, updated_at
	`;

	const result = await pool.query(query, [newExpirationDate, instanceId, userId]);
	return result.rows[0] || null;
}

module.exports = {
	toggleMCPInstance,
	renewMCPInstance,
	updateInstanceStatus,
	renewInstanceExpiration
};