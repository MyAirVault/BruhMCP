import { getMCPInstanceById, updateMCPInstance } from '../../../db/queries/mcpInstancesQueries.js';
import { renewMCPSchema } from '../schemas.js';
import { calculateExpirationDate } from '../utils.js';

/**
 * Renew an expired MCP instance
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export async function renewMCP(req, res) {
	try {
		const userId = req.user.id;
		const { id } = req.params;

		const validationResult = renewMCPSchema.safeParse(req.body);

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

		const { expiration_option } = validationResult.data;

		const instance = await getMCPInstanceById(id, userId);
		if (!instance) {
			return res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: 'MCP instance not found',
				},
			});
		}

		// Check if instance can be renewed (should be expired or disconnected)
		if (instance.status !== 'expired' && instance.status !== 'inactive') {
			return res.status(400).json({
				error: {
					code: 'INVALID_STATE',
					message: 'Can only renew expired or inactive MCP instances',
				},
			});
		}

		// Calculate new expiration date
		const expiresAt = calculateExpirationDate(expiration_option);

		// Update instance
		const updatedData = {
			expiration_option,
			expires_at: expiresAt,
			status: 'active',
			last_renewed_at: new Date(),
		};

		await updateMCPInstance(id, updatedData);

		res.json({
			data: {
				id,
				status: 'active',
				expires_at: expiresAt,
				expiration_option,
				message: 'MCP instance renewed successfully',
			},
		});
	} catch (error) {
		console.error('Error renewing MCP instance:', error);
		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to renew MCP instance',
			},
		});
	}
}
