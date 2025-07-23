/**
 * Background maintenance operations for MCP instances
 * @fileoverview Contains functions for background cleanup and maintenance tasks
 */

import { pool } from '../../config.js';

/**
 * @typedef {import('./types.js').InstanceStatusRecord} InstanceStatusRecord
 */

/**
 * Get instances by status (for background maintenance)
 * @param {string} status - Status to filter by
 * @returns {Promise<InstanceStatusRecord[]>} Array of instances with the specified status
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
 * @returns {Promise<InstanceStatusRecord[]>} Array of expired instances
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
 * Get failed OAuth instances (for background cleanup)
 * @returns {Promise<InstanceStatusRecord[]>} Array of instances with failed OAuth status
 */
export async function getFailedOAuthInstances() {
	const query = `
		SELECT 
			ms.instance_id,
			ms.user_id,
			ms.status,
			ms.oauth_status,
			ms.updated_at,
			m.mcp_service_name
		FROM mcp_service_table ms
		JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
		WHERE ms.oauth_status = 'failed'
		ORDER BY ms.updated_at ASC
	`;

	const result = await pool.query(query);
	return result.rows;
}

/**
 * Get pending OAuth instances older than specified minutes (for background cleanup)
 * @param {number} [minutesOld=5] - Minutes threshold (default: 5)
 * @returns {Promise<InstanceStatusRecord[]>} Array of instances with pending OAuth status older than threshold
 */
export async function getPendingOAuthInstances(minutesOld = 5) {
	const query = `
		SELECT 
			ms.instance_id,
			ms.user_id,
			ms.status,
			ms.oauth_status,
			ms.updated_at,
			ms.created_at,
			m.mcp_service_name
		FROM mcp_service_table ms
		JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
		WHERE ms.oauth_status = 'pending' 
			AND ms.updated_at < NOW() - INTERVAL '${minutesOld} minutes'
		ORDER BY ms.updated_at ASC
	`;

	const result = await pool.query(query);
	return result.rows;
}

/**
 * Bulk update expired instances to expired status
 * @param {string[]} instanceIds - Array of instance IDs to mark as expired
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
	return result.rowCount ?? 0;
}