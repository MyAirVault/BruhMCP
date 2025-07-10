import { getMCPInstanceById, updateMCPInstance } from '../../db/mcpInstancesQueries.js';
import { toggleMCPSchema } from './schemas.js';

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

		// Update instance
		await updateMCPInstance(id, { is_active });

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
