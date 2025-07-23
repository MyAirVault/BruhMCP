/**
 * Statistics operations for MCP instances
 * @fileoverview Contains functions for user and service statistics
 */

import { pool } from '../../config.js';
import './types.js';

/**
 * Get user instance count by status (only counts completed OAuth instances)
 * @param {string} userId - User ID
 * @param {string|null} [status=null] - Optional status filter (if not provided, counts active instances only)
 * @returns {Promise<number>} Number of instances with completed OAuth
 */
export async function getUserInstanceCount(userId, status = null) {
	let query = `
		SELECT COUNT(*) as count 
		FROM mcp_service_table ms
		JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
		WHERE ms.user_id = $1 AND ms.oauth_status = 'completed'
	`;
	const params = [userId];

	if (status) {
		query += ' AND ms.status = $2';
		params.push(status);
	} else {
		// Default: only count active instances with completed OAuth for plan limit checking
		query += ' AND ms.status = $2';
		params.push('active');
	}

	const result = await pool.query(query, params);
	return parseInt(result.rows[0].count);
}

/**
 * Update MCP service statistics (increment counters)
 * @param {string} serviceId - Service ID
 * @param {MCPServiceStatsUpdate} updates - Statistics updates
 * @returns {Promise<MCPInstanceRecord|null>} Updated service record
 */
export async function updateMCPServiceStats(serviceId, updates) {
	const setClauses = [];
	const params = [];
	let paramIndex = 1;

	if (updates.activeInstancesIncrement !== undefined) {
		setClauses.push(`active_instances_count = active_instances_count + $${paramIndex}`);
		params.push(updates.activeInstancesIncrement);
		paramIndex++;
	}

	if (setClauses.length === 0) {
		throw new Error('No statistics updates provided');
	}

	setClauses.push(`updated_at = NOW()`);
	params.push(serviceId);

	const query = `
		UPDATE mcp_table 
		SET ${setClauses.join(', ')}
		WHERE mcp_service_id = $${paramIndex}
		RETURNING *
	`;

	const result = await pool.query(query, params);
	return result.rows[0] || null;
}