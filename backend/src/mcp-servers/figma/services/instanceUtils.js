/**
 * Utility functions for Figma instance validation and management
 * Contains service-agnostic logic moved from database.js
 */

import { pool } from '../../../db/config.js';

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the instance is valid
 * @property {string} [error] - Error message if invalid
 * @property {number} [statusCode] - HTTP status code if invalid
 */

/**
 * Validate if instance is accessible
 * @param {{ service_active?: boolean, status?: string, oauth_status?: string, expires_at?: string, auth_type?: string, api_key?: string, client_id?: string, client_secret?: string, access_token?: string, refresh_token?: string, token_expires_at?: string }|null} instance - Instance data from database
 * @returns {ValidationResult} Validation result with isValid boolean and error message
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

	// OAuth checks removed - Figma uses PAT/API key authentication

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
	if (instance.auth_type === 'api_key' && !instance.api_key) {
		return {
			isValid: false,
			error: 'No API key configured for this instance',
			statusCode: 500,
		};
	}

	// OAuth authentication removed - Figma uses PAT/API key only

	return {
		isValid: true,
		statusCode: 200,
	};
}

/**
 * Get API key for Figma service instance
 * @param {{ auth_type?: string, api_key?: string }} instance - Instance data from database
 * @returns {string|undefined} API key or undefined if not available
 */
export function getApiKeyForInstance(instance) {
	if (instance.auth_type === 'api_key') {
		return instance.api_key;
	}

	// Figma only supports API key authentication
	return undefined;
}

/**
 * Get Figma instance credentials without user authorization (SECURITY CONCERN)
 * TODO: This should be replaced with proper user authorization
 * @param {string} instanceId - UUID of the service instance
 * @returns {Promise<Object|null>} Instance data with credentials or null if not found
 */
export async function getFigmaInstanceCredentials(instanceId) {
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
		WHERE ms.instance_id = $1
			AND m.mcp_service_name = 'figma'
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
 * Update Figma instance usage tracking
 * @param {string} instanceId - UUID of the service instance
 * @param {string} userId - User ID for authorization
 * @returns {Promise<void>}
 */
export async function updateFigmaUsageTracking(instanceId, userId) {
	const query = `
		UPDATE mcp_service_table 
		SET 
			usage_count = usage_count + 1,
			last_used_at = NOW(),
			updated_at = NOW()
		WHERE instance_id = $1 AND user_id = $2
	`;

	try {
		await pool.query(query, [instanceId, userId]);
	} catch (error) {
		console.error('Error updating usage tracking:', error);
		// Don't throw error - usage tracking shouldn't break the request
	}
}