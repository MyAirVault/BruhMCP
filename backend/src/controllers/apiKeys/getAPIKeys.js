import { getAPIKeysByUserId } from '../../db/queries/apiKeysQueries.js';

/**
 * Get API keys for the authenticated user
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export async function getAPIKeys(req, res) {
	try {
		const userId = req.user?.id || '';

		if (!userId) {
			res.json({
				error: {
					code: 'USER_NOT_FOUND',
					message: 'User was not found!',
				},
			});
			return;
		}

		const apiKeys = await getAPIKeysByUserId(userId);

		// Transform response to match API specification
		const formattedApiKeys = apiKeys.map(apiKey => ({
			id: apiKey.id,
			mcp_type_id: apiKey.mcp_type_id,
			mcp_type: {
				id: apiKey.mcp_type_id,
				name: apiKey.mcp_type_name,
				display_name: apiKey.mcp_type_display_name,
			},
			is_active: apiKey.is_active,
			created_at: apiKey.created_at,
			updated_at: apiKey.updated_at,
			expires_at: apiKey.expires_at,
		}));

		res.json({
			data: formattedApiKeys,
		});
	} catch (error) {
		console.error('Error fetching API keys:', error);
		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to fetch API keys',
			},
		});
	}
}
