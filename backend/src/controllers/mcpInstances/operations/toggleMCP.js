import { getMCPInstanceById, updateMCPInstance } from '../../../db/queries/mcpInstancesQueries.js';
import { toggleMCPSchema } from '../schemas.js';
import processManager from '../../../services/processManager.js';
import { getMCPTypeById } from '../../../db/queries/mcpTypesQueries.js';

/**
 * Toggle MCP instance active/inactive
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function toggleMCP(req, res) {
	try {
		const userId = req.user.id;
		const { id } = req.params;

		const validationResult = toggleMCPSchema.safeParse(req.body);

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

		const { is_active } = validationResult.data;

		const instance = await getMCPInstanceById(id, userId);
		if (!instance) {
			return res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: 'MCP instance not found',
				},
			});
		}

		console.log(`🔄 Toggling MCP instance ${id} for user ${userId} to ${is_active ? 'active' : 'inactive'}`);

		// Handle process management based on toggle state
		if (is_active) {
			// Starting MCP - create process if not already running
			const processInfo = processManager.getProcessInfo(id);
			if (!processInfo) {
				console.log(`🚀 Starting MCP process for instance ${id}`);
				
				// Get MCP type for process creation
				const mcpType = await getMCPTypeById(instance.mcp_type_id);
				if (!mcpType) {
					throw new Error('MCP type not found');
				}
				
				// For now, credentials are stored as plain JSON (encryption to be added later)
				const decryptedCredentials = instance.credentials;
				
				// Create process
				const processResult = await processManager.createProcess({
					mcpType: mcpType.name,
					instanceId: id,
					userId: userId,
					credentials: decryptedCredentials,
					config: instance.config || {}
				});
				
				// Update instance with process info
				await updateMCPInstance(id, { 
					is_active: true,
					process_id: processResult.processId,
					assigned_port: processResult.assignedPort,
					status: 'active'
				});
			} else {
				// Process already running, just update status
				await updateMCPInstance(id, { is_active: true, status: 'active' });
			}
		} else {
			// Stopping MCP - terminate process
			console.log(`🛑 Stopping MCP process for instance ${id}`);
			
			// Terminate the process
			const terminated = await processManager.terminateProcess(id);
			if (terminated) {
				console.log(`✅ Process terminated for instance ${id}`);
			} else {
				console.log(`⚠️  Process not found or already terminated for instance ${id}`);
			}
			
			// Update instance status
			await updateMCPInstance(id, { 
				is_active: false, 
				status: 'inactive',
				process_id: null,
				assigned_port: null
			});
		}

		console.log(`✅ MCP instance ${id} toggled successfully to ${is_active ? 'active' : 'inactive'}`);

		res.json({
			data: {
				id,
				is_active,
				message: is_active ? 'MCP instance activated' : 'MCP instance deactivated',
			},
		});
	} catch (error) {
		console.error('Error toggling MCP instance:', error);
		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to toggle MCP instance',
			},
		});
	}
}
