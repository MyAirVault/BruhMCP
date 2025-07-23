import { getAllMCPTypes } from '../../db/queries/mcpTypesQueries.js';
import { ErrorResponses } from '../../utils/errorResponse.js';

/**
 * @typedef {Object} MCPType
 * @property {string} mcp_service_id
 * @property {string} mcp_service_name
 * @property {string} display_name
 * @property {string} description
 * @property {string} icon_url_path
 * @property {number} port
 * @property {string} type
 * @property {boolean} is_active
 * @property {number} active_instances_count
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} RequiredField
 * @property {string} name
 * @property {string} type
 * @property {string} description
 * @property {boolean} required
 * @property {string} placeholder
 */

/**
 * Get all MCP services (updated for multi-tenant architecture)
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export async function getMCPTypes(req, res) {
	try {
		const { active } = req.query;
		const activeOnly = active === 'true';

		// Get MCP types using abstracted query function
		const mcpTypesRawResult = await getAllMCPTypes(activeOnly);
		/** @type {MCPType[]} */
		const mcpTypesRaw = mcpTypesRawResult;

		// Transform to match the expected format for this controller
		const mcpTypes = mcpTypesRaw.map(type => ({
			id: type.mcp_service_id,
			name: type.mcp_service_name,
			display_name: type.display_name,
			description: type.description,
			icon_url: type.icon_url_path,
			port: type.port,
			type: type.type,
			is_active: type.is_active,
			active_instances_count: type.active_instances_count,
			created_at: type.created_at,
			updated_at: type.updated_at,
		}));

		// Transform the response to match API specification
		const formattedMcpTypes = mcpTypes.map(mcpType => {
			// Generate required fields based on auth type
			/** @type {RequiredField[]} */
			let requiredFields = [];

			if (mcpType.type === 'api_key') {
				requiredFields = [
					{
						name: 'api_key',
						type: 'string',
						description: `API key for ${mcpType.display_name}`,
						required: true,
						placeholder: 'Enter your API key...',
					},
				];
			} else if (mcpType.type === 'oauth') {
				requiredFields = [
					{
						name: 'client_id',
						type: 'string',
						description: `Client ID for ${mcpType.display_name}`,
						required: true,
						placeholder: 'Enter your client ID...',
					},
					{
						name: 'client_secret',
						type: 'string',
						description: `Client Secret for ${mcpType.display_name}`,
						required: true,
						placeholder: 'Enter your client secret...',
					},
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
				active_instances_count: mcpType.active_instances_count,
				required_fields: requiredFields,
				created_at: mcpType.created_at.toISOString(),
				updated_at: mcpType.updated_at.toISOString(),
			};
		});

		res.json({
			data: formattedMcpTypes,
			meta: {
				total: formattedMcpTypes.length,
			},
		});
		return;
	} catch (error) {
		console.error('Error fetching MCP types:', error);
		return ErrorResponses.internal(res, 'Failed to fetch MCP types');
	}
}
