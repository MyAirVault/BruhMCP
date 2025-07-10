import { getMCPInstanceById, updateMCPInstance } from '../../../db/queries/mcpInstancesQueries.js';
import { updateMCPSchema } from '../schemas.js';
import processManager from '../../../services/processManager.js';

/**
 * Edit MCP instance details
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function editMCP(req, res) {
	try {
		const userId = req.user.id;
		const { id } = req.params;

		const validationResult = updateMCPSchema.safeParse(req.body);

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

		const { custom_name, credentials, config } = validationResult.data;

		const instance = await getMCPInstanceById(id, userId);
		if (!instance) {
			return res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: 'MCP instance not found',
				},
			});
		}

		const updateData = {};

		// Update custom name if provided
		if (custom_name !== undefined) {
			updateData.custom_name = custom_name;
		}

		// Update config if provided
		if (config !== undefined) {
			updateData.config = config;
		}

		// Update credentials if provided
		if (credentials !== undefined) {
			// Update the associated API key
			const { updateAPIKeyCredentials } = await import('../../../db/queries/apiKeysQueries.js');
			await updateAPIKeyCredentials(instance.api_key_id, credentials);

			// If instance is running, restart process with new credentials
			if (instance.status === 'active' && instance.process_id) {
				try {
					// Terminate current process
					await processManager.terminateProcess(id);

					// Create new process with updated credentials
					const processInfo = await processManager.createProcess({
						mcpType: instance.mcp_type_name,
						instanceId: instance.id,
						userId,
						credentials,
						config: config || instance.config,
					});

					// Update instance with new process info
					updateData.process_id = processInfo.processId;
					updateData.assigned_port = processInfo.assignedPort;
				} catch (processError) {
					console.error('Failed to restart MCP process:', processError);
					updateData.status = 'inactive';
				}
			}
		}

		// Update instance in database
		await updateMCPInstance(id, updateData);

		res.json({
			data: {
				id,
				custom_name: custom_name || instance.custom_name,
				message: 'MCP instance updated successfully',
			},
		});
	} catch (error) {
		console.error('Error editing MCP instance:', error);
		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to edit MCP instance',
			},
		});
	}
}
