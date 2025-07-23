import { deleteAPIKey } from '../../db/queries/apiKeysQueries.js';

/**
 * Delete API key
 * @param {import('express').Request } req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function deleteAPIKeyHandler(req, res) {
	try {
		const userId = req.user?.id || '';
		const { id } = req.params;

		if (!userId) {
			res.json({
				error: {
					code: 'USER_NOT_FOUND',
					message: 'User was not found!',
				},
			});
			return;
		}

		const deleted = await deleteAPIKey(id, userId);

		if (!deleted) {
			res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: 'API key not found',
				},
			});
			return;
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
		return;
	}
}
