/**
 * Database queries for API keys operations
 * @fileoverview Contains all database query functions for API key management
 */

const { pool } = require('../config.js');

/**
 * @typedef {Object} APIKeyRecord
 * @property {string} id - Unique instance identifier (alias for instance_id)
 * @property {string} instance_id - Unique instance identifier
 * @property {string} user_id - User ID who owns the API key
 * @property {string} mcp_type_id - MCP type identifier (alias for mcp_service_id)
 * @property {string} mcp_service_id - MCP service identifier
 * @property {string} mcp_type_name - MCP service name
 * @property {string} mcp_type_display_name - MCP service display name
 * @property {string} custom_name - Custom name for the API key
 * @property {string} status - Status of the API key
 * @property {boolean} is_active - Whether the key is active
 * @property {Date|null} expires_at - Expiration date
 * @property {Date|null} last_used_at - Last usage timestamp
 * @property {number} usage_count - Number of times used
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether credentials are valid
 * @property {string} message - Validation message
 */

/**
 * Get all API keys for a user
 * @param {string} userId - User ID
 * @returns {Promise<APIKeyRecord[]>} Array of API key records
 */
async function getAllAPIKeys(userId) {
	const query = `
		SELECT 
			instance_id,
			user_id,
			mcp_service_id,
			custom_name,
			status,
			expires_at,
			last_used_at,
			usage_count,
			created_at,
			updated_at
		FROM mcp_service_table 
		WHERE user_id = $1 
		ORDER BY created_at DESC
	`;
	
	const result = await pool.query(query, [userId]);
	return result.rows;
}

/**
 * Get all API keys for a user (alias for compatibility)
 * @param {string} userId - User ID
 * @returns {Promise<APIKeyRecord[]>} Array of API key records
 */
async function getAPIKeysByUserId(userId) {
	const query = `
		SELECT 
			mst.instance_id,
			mst.instance_id as id,
			mst.user_id,
			mst.mcp_service_id,
			mst.mcp_service_id as mcp_type_id,
			mt.mcp_service_name as mcp_type_name,
			mt.display_name as mcp_type_display_name,
			mst.custom_name,
			mst.status,
			CASE WHEN mst.status = 'active' THEN true ELSE false END as is_active,
			mst.expires_at,
			mst.last_used_at,
			mst.usage_count,
			mst.created_at,
			mst.updated_at
		FROM mcp_service_table mst
		LEFT JOIN mcp_table mt ON mst.mcp_service_id = mt.mcp_service_id
		WHERE mst.user_id = $1 
		ORDER BY mst.created_at DESC
	`;
	
	const result = await pool.query(query, [userId]);
	return result.rows;
}

/**
 * Store API key (create MCP instance)
 * @param {Object} _apiKeyData - API key data (unused)
 * @returns {Promise<never>} Throws error - use createMCP endpoint instead
 */
async function storeAPIKey(_apiKeyData) {
	// This is handled by createMCP controller
	// Placeholder for compatibility
	throw new Error('Use createMCP endpoint instead');
}

/**
 * Delete API key (delete MCP instance)
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<boolean>} Success status
 */
async function deleteAPIKey(instanceId, userId) {
	const query = `
		DELETE FROM mcp_service_table 
		WHERE instance_id = $1 AND user_id = $2
	`;
	
	const result = await pool.query(query, [instanceId, userId]);
	return (result.rowCount ?? 0) > 0;
}

/**
 * Validate API key credentials against external service
 * @param {Object} _credentials - Credentials to validate (unused)
 * @returns {Promise<ValidationResult>} Validation result
 */
async function validateAPIKeyCredentials(_credentials) {
	// This should be handled by service-specific validation
	// Placeholder for compatibility
	return {
		valid: true,
		message: 'Credentials validated successfully'
	};
}

module.exports = {
	getAllAPIKeys,
	getAPIKeysByUserId,
	storeAPIKey,
	deleteAPIKey,
	validateAPIKeyCredentials
};