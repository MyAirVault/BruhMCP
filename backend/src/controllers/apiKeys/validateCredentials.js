import { testAPICredentials, getCredentialSchemaByType } from '../../services/credentialValidationService.js';
import { credentialValidationSchema } from './schemas.js';
import { getMCPTypeById, getMCPTypeByName } from '../../db/queries/mcpTypesQueries.js';

/**
 * Validate API credentials
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function validateCredentials(req, res) {
	try {
		console.log('🔐 Validate credentials request:', {
			body: req.body,
			mcp_type_id: req.body.mcp_type_id,
			credentials: req.body.credentials ? Object.keys(req.body.credentials) : 'none'
		});

		// Validate request body using Zod
		const validationResult = credentialValidationSchema.safeParse(req.body);

		if (!validationResult.success) {
			console.error('❌ Zod validation failed:', validationResult.error.errors);
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
		console.log('✅ Zod validation passed, mcp_type_id:', mcp_type_id);

		// Look up the MCP type to get the service name
		// First try by ID (UUID), then by name (string)
		/** @type {{ mcp_service_name: string } | null} */
		let mcpType = null;
		
		// Check if mcp_type_id is a UUID or a service name
		const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mcp_type_id);
		
		if (isUUID) {
			mcpType = /** @type {any} */ (await getMCPTypeById(mcp_type_id));
		} else {
			mcpType = /** @type {any} */ (await getMCPTypeByName(mcp_type_id));
		}
		
		if (!mcpType) {
			res.status(404).json({
				error: {
					code: 'MCP_TYPE_NOT_FOUND',
					message: 'Invalid MCP type ID or service name',
					details: { mcp_type_id },
				},
			});
			return;
		}

		const serviceName = mcpType.mcp_service_name;
		console.log(`🏷️  Service name from MCP type: ${serviceName}`);

		// Additional credential-specific validation based on MCP type
		/** @type {{ safeParse: (credentials: any) => { success: boolean, error: { errors: any[] } } }} */
		const credentialSchema = /** @type {any} */ (getCredentialSchemaByType(mcp_type_id));
		/** @type {{ success: boolean, error: { errors: any[] } }} */
		const credentialValidation = credentialSchema.safeParse(credentials);

		if (!credentialValidation.success) {
			res.status(400).json({
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Invalid credentials format',
					details: credentialValidation.error.errors.map((/** @type {any} */ err) => ({
						field: `credentials.${err.path.join('.')}`,
						message: err.message,
					})),
				},
			});
			return;
		}

		// Test credentials with actual API using the service name
		/** @type {{ valid: boolean, api_info: any, error_code: string, error_message: string, details: any }} */
		const testResult = await testAPICredentials(serviceName, credentials, true);

		if (testResult.valid) {
			res.status(200).json({
				data: {
					valid: true,
					message: 'Credentials validated successfully',
					api_info: testResult.api_info,
				},
			});
			return;
		} else {
			res.status(400).json({
				error: {
					code: testResult.error_code,
					message: testResult.error_message,
					details: testResult.details,
				},
			});
			return;
		}
	} catch (/** @type {unknown} */ error) {
		console.error('Credential validation error:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
		res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Internal server error during validation',
				details: { error: errorMessage },
			},
		});
		return;
	}
}
