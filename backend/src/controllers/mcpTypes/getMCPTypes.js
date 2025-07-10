import { getAllMCPTypes } from '../../db/mcpTypesQueries.js';

/**
 * Get all MCP types
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function getMCPTypes(req, res) {
	try {
		const { active } = req.query;
		const activeOnly = active === 'true';

		const mcpTypes = await getAllMCPTypes({ activeOnly });

		// Transform the response to match API specification
		const formattedMcpTypes = mcpTypes.map(mcpType => ({
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
		}));

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
