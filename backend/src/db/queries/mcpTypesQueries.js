/**
 * Database queries for MCP types operations
 * @fileoverview Contains all database query functions for MCP service types management
 */

const { pool } = require('../config.js');

/**
 * @typedef {Object} MCPServiceType
 * @property {string} mcp_service_id - Unique identifier for the MCP service
 * @property {string} mcp_service_name - Service name (e.g., 'figma', 'github')
 * @property {string} display_name - Human-readable display name
 * @property {string} description - Service description
 * @property {string} icon_url_path - Path to service icon
 * @property {number} port - Service port number
 * @property {string} type - Service type
 * @property {boolean} is_active - Whether the service is active
 * @property {number} active_instances_count - Count of active instances
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} MCPTypeStats
 * @property {number} [active_instances_count] - Number of active instances
 */

/**
 * Get all MCP service types
 * @param {boolean} [activeOnly=false] - Whether to return only active services
 * @returns {Promise<MCPServiceType[]>} Array of MCP service type records
 */
async function getAllMCPTypes(activeOnly = false) {
	let query = `
		SELECT 
			mcp_service_id,
			mcp_service_name,
			display_name,
			description,
			icon_url_path,
			port,
			type,
			is_active,
			active_instances_count,
			created_at,
			updated_at
		FROM mcp_table
	`;
	
	const params = [];
	
	if (activeOnly) {
		query += ' WHERE is_active = $1';
		params.push(true);
	}
	
	query += ' ORDER BY display_name ASC';
	
	const result = await pool.query(query, params);
	return result.rows;
}

/**
 * Get MCP service type by name
 * @param {string} serviceName - Service name (e.g., 'figma', 'github')
 * @returns {Promise<MCPServiceType|null>} MCP service type record or null
 */
async function getMCPTypeByName(serviceName) {
	const query = `
		SELECT 
			mcp_service_id,
			mcp_service_name,
			display_name,
			description,
			icon_url_path,
			port,
			type,
			is_active,
			active_instances_count,
			created_at,
			updated_at
		FROM mcp_table
		WHERE mcp_service_name = $1
	`;
	
	const result = await pool.query(query, [serviceName]);
	return result.rows[0] || null;
}

/**
 * Get MCP service type by ID
 * @param {string} serviceId - Service ID (UUID)
 * @returns {Promise<MCPServiceType|null>} MCP service type record or null
 */
async function getMCPTypeById(serviceId) {
	const query = `
		SELECT 
			mcp_service_id,
			mcp_service_name,
			display_name,
			description,
			icon_url_path,
			port,
			type,
			is_active,
			active_instances_count,
			created_at,
			updated_at
		FROM mcp_table
		WHERE mcp_service_id = $1
	`;
	
	const result = await pool.query(query, [serviceId]);
	return result.rows[0] || null;
}

/**
 * Update MCP service type statistics
 * @param {string} serviceId - Service ID
 * @param {MCPTypeStats} stats - Statistics to update
 * @returns {Promise<MCPServiceType|null>} Updated service record or null
 */
async function updateMCPTypeStats(serviceId, stats) {
	const setClauses = [];
	const params = [];
	let paramIndex = 1;
	
	if (stats.active_instances_count !== undefined) {
		setClauses.push(`active_instances_count = $${paramIndex}`);
		params.push(stats.active_instances_count);
		paramIndex++;
	}
	
	if (setClauses.length === 0) {
		throw new Error('No statistics to update');
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

/**
 * Enable or disable MCP service type
 * @param {string} serviceId - Service ID
 * @param {boolean} isActive - Active status
 * @returns {Promise<MCPServiceType|null>} Updated service record or null
 */
async function toggleMCPType(serviceId, isActive) {
	const query = `
		UPDATE mcp_table 
		SET 
			is_active = $1,
			updated_at = NOW()
		WHERE mcp_service_id = $2
		RETURNING *
	`;
	
	const result = await pool.query(query, [isActive, serviceId]);
	return result.rows[0] || null;
}

module.exports = {
	getAllMCPTypes,
	getMCPTypeByName,
	getMCPTypeById,
	updateMCPTypeStats,
	toggleMCPType
};