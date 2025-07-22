/// <reference types="../../../types/express.d.ts" />

import { getAllMCPInstances } from '../../../db/queries/mcpInstancesQueries.js';
import { generateAccessUrl } from '../utils.js';

/**
 * Get MCP instances for user
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function getMCPInstances(req, res) {
	try {
		const userId = req.user?.id;
		if (!userId) {
			res.status(401).json({
				error: {
					code: 'UNAUTHORIZED',
					message: 'User not authenticated',
				},
			});
			return;
		}

		const { status, is_active, mcp_type, expiration_option, page = '1', limit = '20' } = /** @type {{ 
			status?: string;
			is_active?: string;
			mcp_type?: string;
			expiration_option?: string;
			page?: string;
			limit?: string;
		}} */ (req.query);

		const pageNum = parseInt(page);
		const limitNum = parseInt(limit);
		const offset = (pageNum - 1) * limitNum;

		const instances = await getAllMCPInstances(userId, {
			status,
			isActive: is_active === 'true' ? true : is_active === 'false' ? false : undefined,
			mcp_type,
			expiration_option,
			limit: limitNum,
			offset,
		});

		// Format response
		const formattedInstances = instances.map(instance => ({
			id: instance.instance_id,
			custom_name: instance.custom_name,
			instance_number: instance.instance_number,
			access_token: instance.access_token,
			access_url: generateAccessUrl(instance.instance_id, instance.mcp_service_name),
			status: instance.status,
			oauth_status: instance.oauth_status,
			expiration_option: instance.expiration_option,
			expires_at: instance.expires_at,
			mcp_type: {
				name: instance.mcp_service_name,
				display_name: instance.display_name,
				type: instance.type,
				icon_url: instance.icon_url_path,
			},
			created_at: instance.created_at,
		}));

		res.json({
			data: formattedInstances,
			meta: {
				total: formattedInstances.length,
				page: pageNum,
				limit: limitNum,
				pages: Math.ceil(formattedInstances.length / limitNum),
			},
		});
	} catch (error) {
		console.error('Error fetching MCP instances:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to fetch MCP instances';
		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: errorMessage,
			},
		});
	}
}
