import { pool } from '../config.js';

/**
 * Get MCP instances for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of instances
 */
export async function getMCPInstancesByUserId(userId, options = {}) {
	const { status, isActive, mcpType, expirationOption, limit = 20, offset = 0 } = options;

	let query = `
    SELECT mi.*, 
           mt.name as mcp_type_name, 
           mt.display_name as mcp_type_display_name,
           mt.icon_url as mcp_type_icon_url
    FROM mcp_instances mi
    JOIN mcp_types mt ON mi.mcp_type_id = mt.id
    WHERE mi.user_id = $1
  `;

	const params = [userId];
	let paramIndex = 2;

	if (status) {
		query += ` AND mi.status = $${paramIndex}`;
		params.push(status);
		paramIndex++;
	}

	if (isActive !== undefined) {
		query += ` AND mi.is_active = $${paramIndex}`;
		params.push(isActive);
		paramIndex++;
	}

	if (mcpType) {
		query += ` AND mt.name = $${paramIndex}`;
		params.push(mcpType);
		paramIndex++;
	}

	if (expirationOption) {
		query += ` AND mi.expiration_option = $${paramIndex}`;
		params.push(expirationOption);
		paramIndex++;
	}

	query += ` ORDER BY mi.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
	params.push(limit, offset);

	const result = await pool.query(query, params);
	return result.rows;
}

/**
 * Get MCP instance by ID
 * @param {string} instanceId - Instance ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object|null>} Instance or null if not found
 */
export async function getMCPInstanceById(instanceId, userId) {
	const query = `
    SELECT mi.*, 
           mt.name as mcp_type_name, 
           mt.display_name as mcp_type_display_name,
           mt.icon_url as mcp_type_icon_url
    FROM mcp_instances mi
    JOIN mcp_types mt ON mi.mcp_type_id = mt.id
    WHERE mi.id = $1 AND mi.user_id = $2
  `;

	const result = await pool.query(query, [instanceId, userId]);
	return result.rows[0] || null;
}

/**
 * Get all MCP instances (used by expiration monitor)
 * @returns {Promise<Array>} Array of all instances
 */
export async function getAllMCPInstances() {
	const query = `
    SELECT mi.*, 
           mt.name as mcp_type_name, 
           mt.display_name as mcp_type_display_name,
           mt.icon_url as mcp_type_icon_url
    FROM mcp_instances mi
    JOIN mcp_types mt ON mi.mcp_type_id = mt.id
    WHERE mi.status = 'active'
    ORDER BY mi.created_at DESC
  `;

	const result = await pool.query(query);
	return result.rows;
}

/**
 * Get expired MCP instances
 * @returns {Promise<Array>} Array of expired instances
 */
export async function getExpiredMCPInstances() {
	const query = `
    SELECT * FROM mcp_instances
    WHERE expires_at < CURRENT_TIMESTAMP
    AND status = 'active'
    AND expires_at IS NOT NULL
  `;

	const result = await pool.query(query);
	return result.rows;
}
