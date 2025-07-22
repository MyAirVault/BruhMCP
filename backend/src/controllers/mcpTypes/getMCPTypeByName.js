import { getMCPTypeByName } from '../../db/queries/mcpTypesQueries.js';

/**
 * @typedef {Object} MCPType
 * @property {string} id
 * @property {string} name
 * @property {string} display_name
 * @property {string} description
 * @property {string} icon_url
 * @property {Object} config_template
 * @property {Object} resource_limits
 * @property {boolean} is_active
 * @property {Array<string|Object>} required_credentials
 */

/**
 * Get MCP type by name
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export async function getMCPTypeByNameHandler(req, res) {
	try {
		const { name } = req.params;

		const mcpTypeRaw = await getMCPTypeByName(name);
		/** @type {MCPType|null} */
		const mcpType = /** @type {MCPType|null} */ (mcpTypeRaw);

		if (!mcpType) {
			return res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: `MCP type '${name}' not found`,
				},
			});
		}

		// Transform the response to match API specification
		// Handle both old format (string array) and new format (object array)
		/** @type {Array<{name: string, type: string, description: string, required: boolean}>} */
		let requiredFields = [];
		if (mcpType.required_credentials && Array.isArray(mcpType.required_credentials)) {
			if (mcpType.required_credentials.length > 0) {
				if (typeof mcpType.required_credentials[0] === 'string') {
					// Old format: string array
					const stringCredentials = /** @type {string[]} */ (mcpType.required_credentials);
					requiredFields = stringCredentials.map(field => ({
						name: field,
						type: 'string',
						description: `${field.replace('_', ' ')} for ${mcpType.display_name}`,
						required: true,
					}));
				} else {
					// New format: object array
					requiredFields = /** @type {Array<{name: string, type: string, description: string, required: boolean}>} */ (mcpType.required_credentials);
				}
			}
		}

		const formattedMcpType = {
			id: mcpType.id,
			name: mcpType.name,
			display_name: mcpType.display_name,
			description: mcpType.description,
			icon_url: mcpType.icon_url,
			config_template: mcpType.config_template,
			resource_limits: mcpType.resource_limits,
			is_active: mcpType.is_active,
			required_fields: requiredFields,
		};

		return res.json({
			data: formattedMcpType,
		});
	} catch (error) {
		console.error('Error fetching MCP type:', error);
		return res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to fetch MCP type',
			},
		});
	}
}
