import { storeAPIKey } from '../../db/queries/apiKeysQueries.js';
import { getMCPTypeById } from '../../db/queries/mcpTypesQueries.js';
import { storeAPIKeySchema } from './schemas.js';

/**
 * Store API key for the authenticated user
 * @param {import('express').Request & { user: { id: string } }} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<import('express').Response | void>}
 */
export async function storeAPIKeyHandler(req, res) {
	try {
		const userId = req.user.id;

		// Validate request body
		const validationResult = storeAPIKeySchema.safeParse(req.body);

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

		const { mcp_type_id, credentials } = validationResult.data;

		// Verify MCP type exists
		const mcpType = /** @type {any} */ (await getMCPTypeById(mcp_type_id));
		if (!mcpType) {
			return res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: 'MCP type not found',
				},
			});
		}

		// Store the API key
		const apiKey = /** @type {any} */ (await storeAPIKey(userId, mcp_type_id, credentials));

		res.status(201).json({
			data: {
				id: apiKey.id,
				mcp_type_id: apiKey.mcp_type_id,
				mcp_type: {
					id: mcpType.id,
					name: mcpType.name,
					display_name: mcpType.display_name,
				},
				is_active: apiKey.is_active,
				created_at: apiKey.created_at,
				updated_at: apiKey.updated_at,
				expires_at: apiKey.expires_at,
				message: 'Credentials stored successfully',
			},
		});
	} catch (error) {
		console.error('Error storing API key:', error);
		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to store API key',
			},
		});
	}
}
