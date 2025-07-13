import { getMCPInstanceById, deleteMCPInstance } from '../../../db/queries/mcpInstancesQueries.js';
import processManager from '../../../services/processManager.js';

/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */

/**
 * Delete MCP instance
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function deleteMCP(req, res) {
	try {
		const userId = req.user?.id;
		if (!userId) {
			return res.status(401).json({
				error: {
					code: 'UNAUTHORIZED',
					message: 'User authentication required'
				}
			});
		}
		
		const { id } = req.params;
		if (!id) {
			return res.status(400).json({
				error: {
					code: 'MISSING_PARAMETER',
					message: 'Instance ID is required'
				}
			});
		}

		const instance = await getMCPInstanceById(id, userId);
		if (!instance) {
			return res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: 'MCP instance not found',
				},
			});
		}

		console.log(`🗑️  Deleting MCP instance ${id} for user ${userId}`);

		// Terminate process if running
		if (instance.process_id) {
			console.log(`🔄 Terminating process ${instance.process_id} for instance ${id}`);
			await processManager.terminateProcess(id);
		}

		// Delete from database
		await deleteMCPInstance(id, userId);

		console.log(`✅ MCP instance ${id} deleted successfully`);

		res.status(200).json({
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
