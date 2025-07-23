/**
 * Discord Database Service
 * Handles database operations for Discord MCP service instances
 * Based on Gmail MCP service architecture
 */

import { pool } from '../../../db/config.js';
import { createTokenAuditLog } from '../../../db/queries/mcpInstances/index.js';

// Export audit logging function for use in other modules
export { createTokenAuditLog };

/**
 * Looks up instance credentials from database
 * @param {string} instanceId - The instance ID
 * @param {string} serviceName - The service name ('discord')
 * @returns {Promise<Object|null>} Instance credentials or null if not found
 */
export async function lookupInstanceCredentials(instanceId, serviceName) {
	try {
		const query = `
			SELECT 
				ms.instance_id,
				ms.user_id,
				ms.oauth_status,
				ms.status,
				ms.expires_at,
				ms.usage_count,
				ms.custom_name,
				ms.last_used_at,
				m.mcp_service_name,
				m.display_name,
				m.type as auth_type,
				m.is_active as service_active,
				m.port,
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
				AND m.mcp_service_name = $2
				AND ms.oauth_status = 'completed'
		`;

		const result = await pool.query(query, [instanceId, serviceName]);

		if (result.rows.length === 0) {
			console.log(`ℹ️  No instance found for ID: ${instanceId} (service: ${serviceName})`);
			return null;
		}

		const instance = result.rows[0];
		console.log(`✅ Found instance credentials for: ${instanceId} (user: ${instance.user_id})`);

		return instance;
	} catch (error) {
		console.error('Database lookup error:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to lookup instance credentials: ${errorMessage}`);
	}
}

/**
 * Updates instance usage statistics
 * @param {string} instanceId - The instance ID
 * @returns {Promise<void>}
 */
export async function updateInstanceUsage(instanceId) {
	try {
		const query = `
			UPDATE mcp_service_table 
			SET 
				usage_count = usage_count + 1,
				last_used_at = NOW(),
				updated_at = NOW()
			WHERE instance_id = $1
			RETURNING instance_id, usage_count
		`;

		const result = await pool.query(query, [instanceId]);

		if (result.rows.length === 0) {
			console.warn(`⚠️  Could not update usage for instance: ${instanceId} (not found)`);
			return false;
		}

		const { usage_count } = result.rows[0];
		console.log(`📊 Updated usage count for instance ${instanceId}: ${usage_count}`);

		return true;
	} catch (error) {
		console.error('Database usage update error:', error);
		// Don't throw error - usage tracking is not critical
		return false;
	}
}

/**
 * Updates OAuth credentials in database
 * @param {string} instanceId - The instance ID
 * @param {Object} credentials - New credential data
 * @returns {Promise<void>}
 */
export async function updateInstanceCredentials(instanceId, credentials) {
	try {
		const query = `
			UPDATE mcp_credentials
			SET 
				access_token = $2,
				refresh_token = COALESCE($3, refresh_token),
				token_expires_at = $4,
				updated_at = NOW()
			WHERE instance_id = $1
		`;

		await pool.query(query, [
			instanceId,
			credentials.access_token,
			credentials.refresh_token,
			credentials.token_expires_at,
		]);

		console.log(`🔄 Updated OAuth credentials for instance: ${instanceId}`);
	} catch (error) {
		console.error('Failed to update instance credentials:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to update credentials: ${errorMessage}`);
	}
}

/**
 * Validates if an instance exists and is active
 * @param {string} instanceId - The instance ID
 * @param {string} serviceName - The service name ('discord')
 * @returns {Promise<boolean>} True if instance is valid and active
 */
export async function validateInstanceExists(instanceId, serviceName) {
	try {
		const query = `
			SELECT 1
			FROM mcp_service_table ms
			JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
			WHERE ms.instance_id = $1
				AND m.mcp_service_name = $2
				AND ms.status = 'active'
		`;

		const result = await pool.query(query, [instanceId, serviceName]);
		return result.rows.length > 0;
	} catch (error) {
		console.error('Instance validation error:', error);
		return false;
	}
}

/**
 * Gets instance statistics for monitoring
 * @param {string} instanceId - The instance ID
 * @returns {Promise<Object|null>} Instance statistics or null
 */
export async function getInstanceStatistics(instanceId) {
	try {
		const query = `
			SELECT 
				ms.instance_id,
				ms.user_id,
				ms.oauth_status,
				ms.status,
				ms.usage_count,
				ms.last_used_at,
				ms.created_at,
				m.mcp_service_name
			FROM mcp_service_table ms
			JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
			WHERE ms.instance_id = $1
		`;

		const result = await pool.query(query, [instanceId]);

		if (result.rows.length === 0) {
			return null;
		}

		return result.rows[0];
	} catch (error) {
		console.error('Failed to get instance statistics:', error);
		return null;
	}
}

/**
 * Logs API operation for audit trail
 * @param {string} instanceId - The instance ID
 * @param {string} operation - The operation performed
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<void>}
 */
export async function logApiOperation(instanceId, operation, metadata = {}) {
	try {
		// Check if audit table exists, if not, skip logging
		const checkQuery = `
			SELECT 1 FROM information_schema.tables 
			WHERE table_name = 'mcp_audit_log'
		`;

		const tableExists = await pool.query(checkQuery);

		if (tableExists.rows.length === 0) {
			console.log(`ℹ️  Audit table not found, skipping log for operation: ${operation}`);
			return;
		}

		const query = `
			INSERT INTO mcp_audit_log (
				instance_id,
				service_name,
				operation,
				metadata,
				created_at
			) VALUES ($1, $2, $3, $4, NOW())
		`;

		await pool.query(query, [instanceId, 'discord', operation, JSON.stringify(metadata)]);

		console.log(`📋 Logged operation: ${operation} for instance: ${instanceId}`);
	} catch (error) {
		console.error('Failed to log API operation:', error);
		// Don't throw - audit logging is not critical
	}
}

/**
 * Checks if token needs refresh (within 5 minutes of expiry)
 * @param {Object} instance - Instance data with token_expires_at
 * @returns {boolean} True if token needs refresh
 */
export function tokenNeedsRefresh(instance) {
	if (!instance.token_expires_at) {
		return false;
	}

	const expiresAt = new Date(instance.token_expires_at);
	const now = new Date();
	const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

	return expiresAt <= fiveMinutesFromNow;
}

/**
 * Marks an instance as requiring re-authentication
 * @param {string} instanceId - The instance ID
 * @param {string} reason - Reason for requiring re-auth
 * @returns {Promise<void>}
 */
export async function markInstanceForReauth(instanceId, reason) {
	try {
		const query = `
			UPDATE mcp_service_table
			SET 
				oauth_status = 'requires_auth',
				status = 'inactive',
				updated_at = NOW()
			WHERE instance_id = $1
		`;

		await pool.query(query, [instanceId]);

		console.log(`🔄 Marked instance for re-auth: ${instanceId} (reason: ${reason})`);

		// Log the re-auth requirement
		await logApiOperation(instanceId, 'REAUTH_REQUIRED', { reason });
	} catch (error) {
		console.error('Failed to mark instance for re-auth:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to mark instance for re-auth: ${errorMessage}`);
	}
}

/**
 * Gets service health statistics
 * @returns {Promise<Object>} Service health data
 */
export async function getServiceHealthStats() {
	try {
		const query = `
			SELECT 
				COUNT(*) as total_instances,
				COUNT(CASE WHEN ms.status = 'active' THEN 1 END) as active_instances,
				COUNT(CASE WHEN ms.oauth_status = 'completed' THEN 1 END) as authenticated_instances,
				COUNT(CASE WHEN ms.oauth_status = 'requires_auth' THEN 1 END) as reauth_required
			FROM mcp_service_table ms
			JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
			WHERE m.mcp_service_name = 'discord'
		`;

		const result = await pool.query(query);
		return (
			result.rows[0] || {
				total_instances: 0,
				active_instances: 0,
				authenticated_instances: 0,
				reauth_required: 0,
			}
		);
	} catch (error) {
		console.error('Failed to get service health stats:', error);
		return {
			total_instances: 0,
			active_instances: 0,
			authenticated_instances: 0,
			reauth_required: 0,
			error: error.message,
		};
	}
}
