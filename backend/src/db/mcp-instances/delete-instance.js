import { pool } from '../config.js';

/**
 * Delete MCP instance
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteMCPInstance(instanceId, userId) {
	const query = `
    DELETE FROM mcp_instances 
    WHERE id = $1 AND user_id = $2
  `;

	const result = await pool.query(query, [instanceId, userId]);
	return result.rowCount > 0;
}
