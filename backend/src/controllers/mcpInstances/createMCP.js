import {
	createMCPInstance,
	updateMCPInstance,
	deleteMCPInstance,
	getNextInstanceNumber,
	generateUniqueAccessToken,
	countUserMCPInstances,
} from '../../db/mcpInstancesQueries.js';
import { getMCPTypeByName } from '../../db/mcpTypesQueries.js';
import { getAPIKeyByUserAndType } from '../../db/apiKeysQueries.js';
import processManager from '../../services/processManager.js';
import { createMCPSchema } from './schemas.js';
import { calculateExpirationDate } from './utils.js';

/**
 * Create new MCP instance
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function createMCP(req, res) {
	try {
		const userId = req.user.id;

		// Validate request body
		const validationResult = createMCPSchema.safeParse(req.body);

		if (!validationResult.success) {
			return res.status(400).json({
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Invalid request parameters',
					details: validationResult.error.errors.map(err => ({
						field: err.path.join('.'),
						message: err.message,
					})),
				},
			});
		}

		const { mcp_type, custom_name, expiration_option, credentials, config } = validationResult.data;

		// Check user limits
		const userCounts = await countUserMCPInstances(userId);
		const maxInstances = parseInt(process.env.MCP_MAX_INSTANCES) || 10;

		if (userCounts.total >= maxInstances) {
			return res.status(400).json({
				error: {
					code: 'INSTANCE_LIMIT',
					message: `Maximum instances per user reached (${maxInstances})`,
				},
			});
		}

		// Get MCP type
		const mcpType = await getMCPTypeByName(mcp_type);
		if (!mcpType) {
			return res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: `MCP type '${mcp_type}' not found`,
				},
			});
		}

		// Get or create API key
		let apiKey = await getAPIKeyByUserAndType(userId, mcpType.id);
		if (!apiKey) {
			// Store credentials as API key
			const { storeAPIKey } = await import('../../db/apiKeysQueries.js');
			apiKey = await storeAPIKey(userId, mcpType.id, credentials);
		}

		// Generate unique access token
		const accessToken = await generateUniqueAccessToken();

		// Get next instance number
		const instanceNumber = await getNextInstanceNumber(userId, mcpType.id);

		// Calculate expiration date
		const expiresAt = calculateExpirationDate(expiration_option);

		// Create database record
		const instance = await createMCPInstance({
			userId,
			mcpTypeId: mcpType.id,
			apiKeyId: apiKey.id,
			customName: custom_name,
			instanceNumber,
			accessToken,
			expirationOption: expiration_option,
			expiresAt,
			config,
		});

		// Create process
		try {
			const processInfo = await processManager.createProcess({
				mcpType: mcp_type,
				instanceId: instance.id,
				userId,
				credentials: apiKey.credentials,
				config,
			});

			// Update instance with process info
			await updateMCPInstance(instance.id, {
				process_id: processInfo.processId,
				assigned_port: processInfo.assignedPort,
				status: 'active',
			});

			// Return response
			res.status(201).json({
				data: {
					id: instance.id,
					custom_name: instance.custom_name,
					instance_number: instance.instance_number,
					access_token: instance.access_token,
					access_url: processInfo.accessUrl,
					assigned_port: processInfo.assignedPort,
					status: 'active',
					is_active: instance.is_active,
					expiration_option: instance.expiration_option,
					expires_at: instance.expires_at,
					mcp_type: {
						name: mcpType.name,
						display_name: mcpType.display_name,
					},
					created_at: instance.created_at,
				},
			});
		} catch (processError) {
			// Clean up database record if process creation fails
			await deleteMCPInstance(instance.id, userId);

			console.error('Failed to create MCP process:', processError);
			return res.status(500).json({
				error: {
					code: 'PROCESS_CREATION_FAILED',
					message: 'Failed to create MCP process',
				},
			});
		}
	} catch (error) {
		console.error('Error creating MCP instance:', error);
		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to create MCP instance',
			},
		});
	}
}
