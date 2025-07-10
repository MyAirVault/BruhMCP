import { deleteAPIKey } from '../../db/queries/apiKeysQueries.js';

/**
 * Delete API key
 * @param {import('express').Request & { user: { id: string } }} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<import('express').Response | void>}
 */
export async function deleteAPIKeyHandler(req, res) {
	try {
		const userId = req.user.id;
		const { id } = req.params;

		const deleted = await deleteAPIKey(id, userId);

		if (!deleted) {
			return res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: 'API key not found',
				},
			});
		}

		res.status(204).send();
	} catch (error) {
		console.error('Error deleting API key:', error);
		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to delete API key',
			},
		});
	}
}
