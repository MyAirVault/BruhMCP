import { pool } from '../config.js';

/**
 * Get API keys for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of API keys
 */
export async function getAPIKeysByUserId(userId) {
	const query = `
    SELECT ak.id, ak.mcp_type_id, ak.is_active, ak.created_at, ak.updated_at, ak.expires_at,
           mt.id as mcp_type_id, mt.name as mcp_type_name, mt.display_name as mcp_type_display_name
    FROM api_keys ak
    JOIN mcp_types mt ON ak.mcp_type_id = mt.id
    WHERE ak.user_id = $1
    ORDER BY ak.created_at DESC
  `;

	const result = await pool.query(query, [userId]);
	return result.rows;
}

/**
 * Store API key for a user
 * @param {string} userId - User ID
 * @param {string} mcpTypeId - MCP type ID
 * @param {Object} credentials - Credentials object
 * @returns {Promise<Object>} Created API key
 */
export async function storeAPIKey(userId, mcpTypeId, credentials) {
	console.log('storeAPIKey - credentials type:', typeof credentials);
	console.log('storeAPIKey - credentials value:', credentials);
	
	// Ensure credentials is an object before stringifying
	let credentialsToStore;
	if (typeof credentials === 'string') {
		try {
			credentialsToStore = JSON.parse(credentials);
		} catch (error) {
			throw new Error(`Invalid credentials format: ${error.message}`);
		}
	} else if (typeof credentials === 'object' && credentials !== null) {
		credentialsToStore = credentials;
	} else {
		throw new Error('Credentials must be an object or valid JSON string');
	}

	const query = `
    INSERT INTO api_keys (user_id, mcp_type_id, credentials)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, mcp_type_id, credentials, is_active, created_at, updated_at, expires_at
  `;

	const result = await pool.query(query, [userId, mcpTypeId, JSON.stringify(credentialsToStore)]);
	const apiKey = result.rows[0];
	
	console.log('storeAPIKey - DB returned credentials type:', typeof apiKey.credentials);
	console.log('storeAPIKey - DB returned credentials value:', apiKey.credentials);
	console.log('storeAPIKey - DB returned credentials raw:', JSON.stringify(apiKey.credentials));
	
	// Parse credentials back to object for immediate use
	if (typeof apiKey.credentials === 'string') {
		apiKey.credentials = JSON.parse(apiKey.credentials);
	}
	// If it's already an object (PostgreSQL might return it parsed), keep it as is
	
	return apiKey;
}

/**
 * Get API key by ID for a user
 * @param {string} apiKeyId - API key ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} API key or null if not found
 */
export async function getAPIKeyById(apiKeyId, userId) {
	const query = `
    SELECT ak.id, ak.mcp_type_id, ak.credentials, ak.is_active, ak.created_at, ak.updated_at, ak.expires_at,
           mt.id as mcp_type_id, mt.name as mcp_type_name, mt.display_name as mcp_type_display_name
    FROM api_keys ak
    JOIN mcp_types mt ON ak.mcp_type_id = mt.id
    WHERE ak.id = $1 AND ak.user_id = $2
  `;

	const result = await pool.query(query, [apiKeyId, userId]);
	const apiKey = result.rows[0];
	
	if (apiKey && apiKey.credentials) {
		apiKey.credentials = JSON.parse(apiKey.credentials);
	}
	
	return apiKey || null;
}

/**
 * Delete API key by ID for a user
 * @param {string} apiKeyId - API key ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteAPIKey(apiKeyId, userId) {
	const query = `
    DELETE FROM api_keys
    WHERE id = $1 AND user_id = $2
  `;

	const result = await pool.query(query, [apiKeyId, userId]);
	return result.rowCount > 0;
}

/**
 * Get API key by user ID and MCP type ID
 * @param {string} userId - User ID
 * @param {string} mcpTypeId - MCP type ID
 * @returns {Promise<Object|null>} API key or null if not found
 */
export async function getAPIKeyByUserAndType(userId, mcpTypeId) {
	const query = `
    SELECT ak.id, ak.mcp_type_id, ak.credentials, ak.is_active, ak.created_at, ak.updated_at, ak.expires_at
    FROM api_keys ak
    WHERE ak.user_id = $1 AND ak.mcp_type_id = $2 AND ak.is_active = true
    ORDER BY ak.created_at DESC
    LIMIT 1
  `;

	const result = await pool.query(query, [userId, mcpTypeId]);
	const apiKey = result.rows[0];
	
	if (apiKey && apiKey.credentials) {
		apiKey.credentials = JSON.parse(apiKey.credentials);
	}
	
	return apiKey || null;
}

/**
 * Update API key credentials
 * @param {string} apiKeyId - API key ID
 * @param {Object} credentials - New credentials object
 * @returns {Promise<Object>} Updated API key
 */
export async function updateAPIKeyCredentials(apiKeyId, credentials) {
	const query = `
    UPDATE api_keys 
    SET credentials = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, user_id, mcp_type_id, credentials, is_active, created_at, updated_at, expires_at
  `;

	const result = await pool.query(query, [JSON.stringify(credentials), apiKeyId]);
	const apiKey = result.rows[0];
	
	// Parse credentials back to object for immediate use
	if (apiKey && apiKey.credentials) {
		apiKey.credentials = JSON.parse(apiKey.credentials);
	}
	
	return apiKey;
}
