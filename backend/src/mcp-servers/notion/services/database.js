/**
 * Database service for Notion MCP instance management
 * Handles instance credential lookup and validation
 * Updated to support OAuth authentication
 */

import { pool } from '../../../db/config.js';

/**
 * Lookup instance credentials for OAuth authentication
 * @param {string} instanceId - UUID of the service instance
 * @param {string} serviceName - Name of the MCP service (e.g., 'notion')
 * @returns {Promise<Object|null>} Instance data with credentials or null if not found
 */
export async function lookupInstanceCredentials(instanceId, serviceName = 'notion') {
	const query = `
    SELECT 
      ms.instance_id,
      ms.user_id,
      ms.oauth_status,
      ms.status,
      ms.expires_at,
      ms.last_used_at,
      ms.usage_count,
      ms.custom_name,
      m.mcp_service_name,
      m.display_name,
      m.type as auth_type,
      m.is_active as service_active,
      c.client_id,
      c.client_secret,
      c.access_token,
      c.refresh_token,
      c.token_expires_at,
      c.token_scope as scope,
      c.oauth_completed_at
    FROM mcp_service_table ms
    JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
    LEFT JOIN mcp_credentials c ON ms.instance_id = c.instance_id
    WHERE ms.instance_id = $1
      AND m.mcp_service_name = $2
  `;

	try {
		const result = await pool.query(query, [instanceId, serviceName]);
		
		if (result.rows.length === 0) {
			console.log(`Instance lookup failed - no results for instanceId: ${instanceId}, serviceName: ${serviceName}`);
			
			// Try to see if the instance exists at all
			const checkQuery = `
				SELECT ms.instance_id, m.mcp_service_name, ms.oauth_status, ms.status
				FROM mcp_service_table ms
				JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
				WHERE ms.instance_id = $1
			`;
			const checkResult = await pool.query(checkQuery, [instanceId]);
			
			if (checkResult.rows.length > 0) {
				const instance = checkResult.rows[0];
				console.log(`Instance ${instanceId} exists but for service: ${instance.mcp_service_name}, status: ${instance.status}, oauth_status: ${instance.oauth_status}`);
			} else {
				console.log(`Instance ${instanceId} does not exist in database at all`);
			}
		}
		
		return result.rows[0] || null;
	} catch (error) {
		console.error('Database error getting instance credentials:', error);
		throw new Error('Failed to retrieve instance credentials');
	}
}

/**
 * Validate if instance is accessible
 * @param {{ service_active?: boolean, status?: string, oauth_status?: string, expires_at?: string, auth_type?: string, api_key?: string, client_id?: string, client_secret?: string, access_token?: string, refresh_token?: string, token_expires_at?: string }|null} instance - Instance data from database
 * @returns {{ isValid: boolean, error?: string, statusCode?: number }} Validation result with isValid boolean and error message
 */
export function validateInstanceAccess(instance) {
	if (!instance) {
		return {
			isValid: false,
			error: 'Instance not found',
			statusCode: 404,
		};
	}

	// Check if service is globally active
	if (!instance.service_active) {
		return {
			isValid: false,
			error: 'Service is currently disabled',
			statusCode: 503,
		};
	}

	// Check OAuth status
	if (instance.oauth_status === 'pending') {
		return {
			isValid: false,
			error: 'Instance OAuth authorization is still pending',
			statusCode: 403,
		};
	}

	if (instance.oauth_status === 'failed') {
		return {
			isValid: false,
			error: 'Instance OAuth authorization failed',
			statusCode: 403,
		};
	}

	// Check instance status
	if (instance.status === 'inactive') {
		return {
			isValid: false,
			error: 'Instance is paused',
			statusCode: 403,
		};
	}

	if (instance.status === 'expired') {
		return {
			isValid: false,
			error: 'Instance has expired',
			statusCode: 403,
		};
	}

	// Check expiration time
	if (instance.expires_at && new Date(instance.expires_at) < new Date()) {
		return {
			isValid: false,
			error: 'Instance has expired',
			statusCode: 403,
		};
	}

	// Check if credentials are available based on auth type
	if (instance.auth_type === 'oauth' && !instance.client_id) {
		return {
			isValid: false,
			error: 'No OAuth client credentials configured for this instance',
			statusCode: 500,
		};
	}

	// Legacy API key support (deprecated)
	if (instance.auth_type === 'api_key' && !instance.api_key) {
		return {
			isValid: false,
			error: 'No API key configured for this instance',
			statusCode: 500,
		};
	}

	if (instance.auth_type === 'oauth') {
		if (!instance.client_id || !instance.client_secret) {
			return {
				isValid: false,
				error: 'OAuth credentials not configured for this instance',
				statusCode: 500,
			};
		}

		// Check if OAuth tokens are available for OAuth services
		if (!instance.access_token) {
			return {
				isValid: false,
				error: 'OAuth access token not available for this instance',
				statusCode: 500,
			};
		}

		// Check if access token is expired
		if (instance.token_expires_at && new Date(instance.token_expires_at) < new Date()) {
			return {
				isValid: false,
				error: 'OAuth access token has expired',
				statusCode: 403,
			};
		}
	}

	return {
		isValid: true,
		statusCode: 200,
	};
}

/**
 * Update instance usage tracking
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<void>}
 */
export async function updateInstanceUsage(instanceId) {
	const query = `
    UPDATE mcp_service_table 
    SET 
      usage_count = usage_count + 1,
      last_used_at = NOW(),
      updated_at = NOW()
    WHERE instance_id = $1
  `;

	try {
		await pool.query(query, [instanceId]);
	} catch (error) {
		console.error('Database error updating usage tracking:', error);
		// Don't throw error - usage tracking shouldn't break the request
	}
}

/**
 * Legacy function - kept for backward compatibility
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<void>}
 */
export async function updateUsageTracking(instanceId) {
	return updateInstanceUsage(instanceId);
}

/**
 * Get API key for Notion service instance (legacy)
 * @param {{ auth_type?: string, api_key?: string, access_token?: string }} instance - Instance data from database
 */
export function getApiKeyForInstance(instance) {
	if (instance.auth_type === 'api_key') {
		return instance.api_key;
	}

	// For OAuth services, return access token
	if (instance.auth_type === 'oauth') {
		return instance.access_token;
	}

	throw new Error('Invalid authentication type');
}

/**
 * Get instance credentials (legacy function name)
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<Object|null>} Instance data with credentials or null if not found
 */
export async function getInstanceCredentials(instanceId) {
	return lookupInstanceCredentials(instanceId, 'notion');
}
