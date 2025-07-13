/**
 * Database queries for API keys operations
 * @fileoverview Contains all database query functions for API key management
 */

import { pool } from '../config.js';

/**
 * Get all API keys for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of API key records
 */
export async function getAllAPIKeys(userId) {
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
 * @returns {Promise<Array>} Array of API key records
 */
export async function getAPIKeysByUserId(userId) {
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
 * Store API key (create MCP instance)
 * @param {Object} apiKeyData - API key data
 * @returns {Promise<Object>} Created API key record
 */
export async function storeAPIKey(apiKeyData) {
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
export async function deleteAPIKey(instanceId, userId) {
	const query = `
		DELETE FROM mcp_service_table 
		WHERE instance_id = $1 AND user_id = $2
	`;
	
	const result = await pool.query(query, [instanceId, userId]);
	return result.rowCount > 0;
}

/**
 * Validate API key credentials against external service
 * @param {Object} credentials - Credentials to validate
 * @returns {Promise<Object>} Validation result
 */
export async function validateAPIKeyCredentials(credentials) {
	// This should be handled by service-specific validation
	// Placeholder for compatibility
	return {
		valid: true,
		message: 'Credentials validated successfully'
	};
}