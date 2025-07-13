import { pool } from '../../db/config.js';

/**
 * Get all MCP services (updated for multi-tenant architecture)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function getMCPTypes(req, res) {
	try {
		const { active } = req.query;
		const activeOnly = active === 'true';

		// Query the new mcp_table
		let query = `
			SELECT 
				mcp_service_id as id,
				mcp_service_name as name,
				display_name,
				description,
				icon_url_path as icon_url,
				port,
				type,
				is_active,
				total_instances_created,
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
		const mcpTypes = result.rows;

		// Transform the response to match API specification
		const formattedMcpTypes = mcpTypes.map(mcpType => {
			// Generate required fields based on auth type
			let requiredFields = [];
			
			if (mcpType.type === 'api_key') {
				requiredFields = [
					{
						name: 'api_key',
						type: 'string',
						description: `API key for ${mcpType.display_name}`,
						required: true,
						placeholder: 'Enter your API key...'
					}
				];
			} else if (mcpType.type === 'oauth') {
				requiredFields = [
					{
						name: 'client_id',
						type: 'string',
						description: `Client ID for ${mcpType.display_name}`,
						required: true,
						placeholder: 'Enter your client ID...'
					},
					{
						name: 'client_secret',
						type: 'string',
						description: `Client Secret for ${mcpType.display_name}`,
						required: true,
						placeholder: 'Enter your client secret...'
					}
				];
			}

			return {
				id: mcpType.id,
				name: mcpType.name,
				display_name: mcpType.display_name,
				description: mcpType.description,
				icon_url: mcpType.icon_url,
				port: mcpType.port,
				type: mcpType.type,
				is_active: mcpType.is_active,
				total_instances_created: mcpType.total_instances_created,
				active_instances_count: mcpType.active_instances_count,
				required_fields: requiredFields,
				created_at: mcpType.created_at,
				updated_at: mcpType.updated_at
			};
		});

		res.json({
			data: formattedMcpTypes,
			meta: {
				total: formattedMcpTypes.length,
			},
		});
	} catch (error) {
		console.error('Error fetching MCP types:', error);
		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to fetch MCP types',
			},
		});
	}
}
