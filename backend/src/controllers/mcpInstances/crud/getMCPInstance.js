import { getMCPInstanceById } from '../../../db/queries/mcpInstancesQueries.js';
import { generateAccessUrl } from '../utils.js';

/**
 * Get MCP instance by ID
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function getMCPInstance(req, res) {
	try {
		const userId = req.user.id;
		const { id } = req.params;

		const instance = await getMCPInstanceById(id, userId);

		if (!instance) {
			return res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: 'MCP instance not found',
				},
			});
		}

		// Format response
		const formattedInstance = {
			id: instance.id,
			custom_name: instance.custom_name,
			instance_number: instance.instance_number,
			access_token: instance.access_token,
			access_url: generateAccessUrl(instance.id, instance.mcp_type_name),
			status: instance.status,
			is_active: instance.is_active,
			expiration_option: instance.expiration_option,
			expires_at: instance.expires_at,
			mcp_type: {
				name: instance.mcp_type_name,
				display_name: instance.mcp_type_display_name,
				icon_url: instance.mcp_type_icon_url,
			},
			config: instance.config,
			created_at: instance.created_at,
			updated_at: instance.updated_at,
		};

		res.json({
			data: formattedInstance,
		});
	} catch (error) {
		console.error('Error fetching MCP instance:', error);
		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to fetch MCP instance',
			},
		});
	}
}
