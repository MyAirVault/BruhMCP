import { pool } from '../config.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get next instance number for user and MCP type
 * @param {string} userId - User ID
 * @param {string} mcpTypeId - MCP type ID
 * @returns {Promise<number>} Next instance number
 */
export async function getNextInstanceNumber(userId, mcpTypeId) {
	const query = `
    SELECT COALESCE(MAX(instance_number), 0) + 1 as next_number
    FROM mcp_instances
    WHERE user_id = $1 AND mcp_type_id = $2
  `;

	const result = await pool.query(query, [userId, mcpTypeId]);
	return result.rows[0].next_number;
}

/**
 * Generate unique access token
 * @returns {Promise<string>} Unique access token
 */
export async function generateUniqueAccessToken() {
	let token;
	let isUnique = false;

	while (!isUnique) {
		token = `mcp_acc_${uuidv4().replace(/-/g, '')}`;

		const query = `SELECT id FROM mcp_instances WHERE access_token = $1`;
		const result = await pool.query(query, [token]);

		if (result.rows.length === 0) {
			isUnique = true;
		}
	}

	return token;
}

/**
 * Count user's MCP instances
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Instance counts
 */
export async function countUserMCPInstances(userId) {
	const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
      COUNT(CASE WHEN is_active = true THEN 1 END) as enabled
    FROM mcp_instances
    WHERE user_id = $1
  `;

	const result = await pool.query(query, [userId]);
	return result.rows[0];
}
