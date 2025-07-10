import { pool } from './config.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new MCP instance
 * @param {Object} instanceData - Instance data
 * @returns {Promise<Object>} Created instance
 */
export async function createMCPInstance(instanceData) {
	const {
		userId,
		mcpTypeId,
		apiKeyId,
		customName,
		instanceNumber,
		accessToken,
		expirationOption,
		expiresAt,
		config,
	} = instanceData;

	const query = `
    INSERT INTO mcp_instances (
      user_id, mcp_type_id, api_key_id, custom_name, instance_number,
      access_token, expiration_option, expires_at, config
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

	const result = await pool.query(query, [
		userId,
		mcpTypeId,
		apiKeyId,
		customName,
		instanceNumber,
		accessToken,
		expirationOption,
		expiresAt,
		JSON.stringify(config || {}),
	]);

	return result.rows[0];
}

/**
 * Update MCP instance
 * @param {string} instanceId - Instance ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated instance
 */
export async function updateMCPInstance(instanceId, updateData) {
	const fields = [];
	const values = [];
	let paramIndex = 1;

	// Build dynamic update query
	Object.entries(updateData).forEach(([key, value]) => {
		if (key === 'config') {
			fields.push(`${key} = $${paramIndex}`);
			values.push(JSON.stringify(value));
		} else {
			fields.push(`${key} = $${paramIndex}`);
			values.push(value);
		}
		paramIndex++;
	});

	values.push(instanceId);

	const query = `
    UPDATE mcp_instances 
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramIndex}
    RETURNING *
  `;

	const result = await pool.query(query, values);
	return result.rows[0];
}

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
