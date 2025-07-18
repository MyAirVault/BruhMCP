/**
 * Database service for Airtable MCP instance management
 * Handles instance credential lookup and validation
 */

import { pool } from '../../../db/config.js';

/**
 * Get instance credentials and validate access
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<Object|null>} Instance data with credentials or null if not found
 */
export async function getInstanceCredentials(instanceId) {
	const query = `
    SELECT 
      ms.instance_id,
      ms.user_id,
      ms.status,
      ms.expires_at,
      ms.last_used_at,
      ms.usage_count,
      ms.custom_name,
      m.mcp_service_name,
      m.display_name,
      m.type as auth_type,
      m.is_active as service_active,
      c.api_key
    FROM mcp_service_table ms
    JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
    LEFT JOIN mcp_credentials c ON ms.instance_id = c.instance_id
    WHERE ms.instance_id = $1
      AND m.mcp_service_name = 'airtable'
      AND m.type = 'api_key'
      AND c.api_key IS NOT NULL
  `;

	try {
		const result = await pool.query(query, [instanceId]);
		return result.rows[0] || null;
	} catch (error) {
		console.error('Database error getting instance credentials:', error);
		throw new Error('Failed to retrieve instance credentials');
	}
}

/**
 * Validate if instance is accessible
 * @param {{ service_active?: boolean, status?: string, expires_at?: string, auth_type?: string, api_key?: string }|null} instance - Instance data from database
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

	// Airtable only supports API key authentication (PAT tokens)
	if (!instance.api_key) {
		return {
			isValid: false,
			error: 'No API key configured for this instance',
			statusCode: 500,
		};
	}

	return {
		isValid: true,
		statusCode: 200,
	};
}

/**
 * Update instance usage tracking
 * @param {string} instanceId - Instance ID
 */
export async function updateUsageTracking(instanceId) {
	const query = `
    UPDATE mcp_service_table 
    SET 
      last_used_at = CURRENT_TIMESTAMP,
      usage_count = COALESCE(usage_count, 0) + 1
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
 * Get API key for Airtable service instance
 * @param {{ api_key?: string }} instance - Instance data from database
 */
export function getApiKeyForInstance(instance) {
	// Airtable only supports API key authentication (PAT tokens)
	return instance.api_key;
}

/**
 * Initialize database connection
 * This is a no-op since we're using the main system's pool
 * @returns {Promise<void>}
 */
export async function initialize() {
	// Using main system's database pool - no initialization needed
	console.log('Airtable database service ready (using main system pool)');
}