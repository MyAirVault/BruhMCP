import { getMCPInstanceById } from '../../../db/queries/mcpInstances/index.js';
import { generateAccessUrl } from '../utils.js';

/**
 * @typedef {Object} User
 * @property {number} id - User ID
 */

/**
 * @typedef {import('express').Request} AuthenticatedRequest
 */

/** @typedef {import('express').Response} Response */

/**
 * Database instance record from getMCPInstanceById query
 * @typedef {Object} MCPInstanceRecord
 * @property {string} instance_id - The unique instance ID
 * @property {string} custom_name - User-defined custom name
 * @property {number} instance_number - Instance number
 * @property {string} access_token - Access token for the instance
 * @property {string} mcp_service_name - The MCP service name
 * @property {string} status - Current status of the instance
 * @property {string} oauth_status - OAuth status
 * @property {boolean} is_active - Whether the instance is active
 * @property {string} expiration_option - Expiration option setting
 * @property {string|null} expires_at - Expiration timestamp
 * @property {string} display_name - Display name for the service
 * @property {string} type - Service type
 * @property {Object} config - Instance configuration object
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * Get MCP instance by ID
 * @param {AuthenticatedRequest} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function getMCPInstance(req, res) {
	try {
		const userId = req.user?.id;
		if (!userId) {
			res.status(401).json({
				error: {
					code: 'UNAUTHORIZED',
					message: 'User authentication required',
				},
			});
			return;
		}

		const { id } = req.params;
		if (!id) {
			res.status(400).json({
				error: {
					code: 'MISSING_PARAMETER',
					message: 'Instance ID is required',
				},
			});
			return;
		}

		const instance = await getMCPInstanceById(id, String(userId));

		if (!instance) {
			res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: 'MCP instance not found',
				},
			});
			return;
		}

		// Format response
		const instanceData = /** @type {any} */ (instance);
		console.log('🔍 getMCPInstance - Raw instance data:', {
			instance_id: instanceData.instance_id,
			oauth_status: instanceData.oauth_status,
			status: instanceData.status
		});
		const formattedInstance = {
			id: instanceData.instance_id,
			custom_name: instanceData.custom_name,
			instance_number: instanceData.instance_number,
			access_token: instanceData.access_token,
			access_url: generateAccessUrl(instanceData.instance_id, instanceData.mcp_service_name),
			status: instanceData.status,
			oauth_status: instanceData.oauth_status,
			is_active: instanceData.is_active,
			expiration_option: instanceData.expiration_option,
			expires_at: instanceData.expires_at,
			mcp_type: {
				name: instanceData.mcp_service_name,
				display_name: instanceData.display_name,
				type: instanceData.type,
			},
			config: instanceData.config,
			created_at: instanceData.created_at,
			updated_at: instanceData.updated_at,
		};

		res.json({
			data: formattedInstance,
		});
		return;
	} catch (error) {
		console.error('Error fetching MCP instance:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to fetch MCP instance',
				details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
			},
		});
		return;
	}
}
