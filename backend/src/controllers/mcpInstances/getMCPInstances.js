import { getMCPInstancesByUserId } from '../../db/mcpInstancesQueries.js';

/**
 * Get MCP instances for user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function getMCPInstances(req, res) {
	try {
		const userId = req.user.id;
		const { status, is_active, mcp_type, expiration_option, page = 1, limit = 20 } = req.query;

		const offset = (parseInt(page) - 1) * parseInt(limit);

		const instances = await getMCPInstancesByUserId(userId, {
			status,
			isActive: is_active === 'true' ? true : is_active === 'false' ? false : undefined,
			mcpType: mcp_type,
			expirationOption: expiration_option,
			limit: parseInt(limit),
			offset,
		});

		// Format response
		const formattedInstances = instances.map(instance => ({
			id: instance.id,
			custom_name: instance.custom_name,
			instance_number: instance.instance_number,
			access_token: instance.access_token,
			access_url: instance.assigned_port ? `http://localhost:${instance.assigned_port}` : null,
			assigned_port: instance.assigned_port,
			process_id: instance.process_id,
			status: instance.status,
			is_active: instance.is_active,
			expiration_option: instance.expiration_option,
			expires_at: instance.expires_at,
			mcp_type: {
				name: instance.mcp_type_name,
				display_name: instance.mcp_type_display_name,
				icon_url: instance.mcp_type_icon_url,
			},
			created_at: instance.created_at,
		}));

		res.json({
			data: formattedInstances,
			meta: {
				total: formattedInstances.length,
				page: parseInt(page),
				limit: parseInt(limit),
				pages: Math.ceil(formattedInstances.length / parseInt(limit)),
			},
		});
	} catch (error) {
		console.error('Error fetching MCP instances:', error);
		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to fetch MCP instances',
			},
		});
	}
}
