import { getMCPInstanceById, deleteMCPInstance } from '../../../db/queries/mcpInstancesQueries.js';
import processManager from '../../../services/processManager.js';

/**
 * Delete MCP instance
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function deleteMCP(req, res) {
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

		// Terminate process if running
		if (instance.process_id) {
			await processManager.terminateProcess(id);
		}

		// Delete from database
		await deleteMCPInstance(id, userId);

		res.json({
			data: {
				message: 'MCP instance and credentials permanently deleted',
			},
		});
	} catch (error) {
		console.error('Error deleting MCP instance:', error);
		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to delete MCP instance',
			},
		});
	}
}
