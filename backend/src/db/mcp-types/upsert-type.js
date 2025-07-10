import { pool } from '../config.js';

/**
 * Update or insert MCP type
 * @param {Object} mcpType - MCP type data
 * @returns {Promise<void>}
 */
export async function upsertMCPType(mcpType) {
	const {
		name,
		display_name,
		description,
		icon_url,
		server_script,
		config_template,
		required_credentials,
		resource_limits,
	} = mcpType;

	const query = `
    INSERT INTO mcp_types (
      name, display_name, description, icon_url, server_script, 
      config_template, required_credentials, resource_limits, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (name) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      description = EXCLUDED.description,
      icon_url = EXCLUDED.icon_url,
      server_script = EXCLUDED.server_script,
      config_template = EXCLUDED.config_template,
      required_credentials = EXCLUDED.required_credentials,
      resource_limits = EXCLUDED.resource_limits,
      is_active = EXCLUDED.is_active,
      updated_at = CURRENT_TIMESTAMP
  `;

	const values = [
		name,
		display_name,
		description,
		icon_url,
		server_script,
		JSON.stringify(config_template),
		JSON.stringify(required_credentials),
		JSON.stringify(resource_limits),
		true,
	];

	await pool.query(query, values);
	console.log(`✅ Upserted MCP type: ${name} (${display_name})`);
}
