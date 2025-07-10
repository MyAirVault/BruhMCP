import { pool } from '../config.js';

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
