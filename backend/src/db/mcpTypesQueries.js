import { pool } from './config.js';

/**
 * Get all MCP types
 * @param {Object} options - Query options
 * @param {boolean} options.activeOnly - Filter by active status
 * @returns {Promise<Array>} Array of MCP types
 */
export async function getAllMCPTypes({ activeOnly = false } = {}) {
	let query = `
    SELECT id, name, display_name, description, icon_url, 
           config_template, required_credentials, resource_limits, 
           is_active, created_at, updated_at
    FROM mcp_types
  `;

	const params = [];

	if (activeOnly) {
		query += ' WHERE is_active = $1';
		params.push(true);
	}

	query += ' ORDER BY display_name';

	const result = await pool.query(query, params);
	return result.rows;
}

/**
 * Get MCP type by name
 * @param {string} name - MCP type name
 * @returns {Promise<Object|null>} MCP type or null if not found
 */
export async function getMCPTypeByName(name) {
	const query = `
    SELECT id, name, display_name, description, icon_url, 
           config_template, required_credentials, resource_limits, 
           is_active, created_at, updated_at
    FROM mcp_types 
    WHERE name = $1
  `;

	const result = await pool.query(query, [name]);
	return result.rows[0] || null;
}

/**
 * Get MCP type by ID
 * @param {string} id - MCP type ID
 * @returns {Promise<Object|null>} MCP type or null if not found
 */
export async function getMCPTypeById(id) {
	const query = `
    SELECT id, name, display_name, description, icon_url, 
           config_template, required_credentials, resource_limits, 
           is_active, created_at, updated_at
    FROM mcp_types 
    WHERE id = $1
  `;

	const result = await pool.query(query, [id]);
	return result.rows[0] || null;
}
