import { getMCPTypeByName } from '../../db/mcpTypesQueries.js';

/**
 * Get MCP type by name
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function getMCPTypeByNameHandler(req, res) {
	try {
		const { name } = req.params;

		const mcpType = await getMCPTypeByName(name);

		if (!mcpType) {
			return res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: `MCP type '${name}' not found`,
				},
			});
		}

		// Transform the response to match API specification
		const formattedMcpType = {
			id: mcpType.id,
			name: mcpType.name,
			display_name: mcpType.display_name,
			description: mcpType.description,
			icon_url: mcpType.icon_url,
			config_template: mcpType.config_template,
			resource_limits: mcpType.resource_limits,
			is_active: mcpType.is_active,
			required_fields:
				mcpType.required_credentials?.map(field => ({
					name: field,
					type: 'string',
					description: `${field.replace('_', ' ')} for ${mcpType.display_name}`,
					required: true,
				})) || [],
		};

		res.json({
			data: formattedMcpType,
		});
	} catch (error) {
		console.error('Error fetching MCP type:', error);
		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to fetch MCP type',
			},
		});
	}
}
