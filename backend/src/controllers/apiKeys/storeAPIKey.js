import { storeAPIKey } from '../../db/queries/apiKeysQueries.js';
import { getMCPTypeById } from '../../db/queries/mcpTypesQueries.js';
import { storeAPIKeySchema } from './schemas.js';

/**
 * Store API key for the authenticated user
 * @param {import('express').Request & { user: { id: string } }} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function storeAPIKeyHandler(req, res) {
	try {
		const userId = req.user.id;

		// Validate request body
		const validationResult = storeAPIKeySchema.safeParse(req.body);

		if (!validationResult.success) {
			res.status(400).json({
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Invalid request parameters',
					details: validationResult.error.errors.map((/** @type {any} */ err) => ({
						field: err.path.join('.'),
						message: err.message,
					})),
				},
			});
			return;
		}

		const { mcp_type_id, credentials } = validationResult.data;

		// Verify MCP type exists
		const mcpTypeResult = await getMCPTypeById(mcp_type_id);
		/** @type {{ mcp_service_id: string, mcp_service_name: string, display_name: string } | null} */
		const mcpType = /** @type {any} */ (mcpTypeResult);
		if (!mcpType) {
			res.status(404).json({
				error: {
					code: 'NOT_FOUND',
					message: 'MCP type not found',
				},
			});
			return;
		}

		// Store the API key - Note: This function currently throws an error as it's not implemented
		// It should be replaced with the actual MCP instance creation logic
		try {
			const apiKeyData = { user_id: userId, mcp_type_id, credentials };
			await storeAPIKey(apiKeyData);
		} catch (/** @type {unknown} */ error) {
			// Handle the case where storeAPIKey is not implemented
			if (error instanceof Error && error.message.includes('Use createMCP endpoint instead')) {
				res.status(501).json({
					error: {
						code: 'NOT_IMPLEMENTED',
						message: 'Use createMCP endpoint instead for storing API keys',
					},
				});
				return;
			}
			throw error;
		}

		// Mock response for now since storeAPIKey is not implemented
		/** @type {{ id: string, mcp_type_id: string, is_active: boolean, created_at: string, updated_at: string, expires_at: string | null }} */
		const apiKey = {
			id: 'mock-id',
			mcp_type_id: mcp_type_id,
			is_active: true,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			expires_at: null
		};

		res.status(201).json({
			data: {
				id: apiKey.id,
				mcp_type_id: apiKey.mcp_type_id,
				mcp_type: {
					id: mcpType.mcp_service_id,
					name: mcpType.mcp_service_name,
					display_name: mcpType.display_name,
				},
				is_active: apiKey.is_active,
				created_at: apiKey.created_at,
				updated_at: apiKey.updated_at,
				expires_at: apiKey.expires_at,
				message: 'Credentials stored successfully',
			},
		});
		return;
	} catch (/** @type {unknown} */ error) {
		console.error('Error storing API key:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to store API key',
				details: { error: errorMessage },
			},
		});
		return;
	}
}
