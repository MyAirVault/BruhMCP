import { testAPICredentials, getCredentialSchemaByType } from '../../services/credentialValidationService.js';
import { credentialValidationSchema } from './schemas.js';
import { getMCPTypeById, getMCPTypeByName } from '../../db/queries/mcpTypesQueries.js';

/**
 * Validate API credentials
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export async function validateCredentials(req, res) {
	try {
		// Validate request body using Zod
		const validationResult = credentialValidationSchema.safeParse(req.body);

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

		// Look up the MCP type to get the service name
		// First try by ID (UUID), then by name (string)
		let mcpType = null;
		
		// Check if mcp_type_id is a UUID or a service name
		const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mcp_type_id);
		
		if (isUUID) {
			mcpType = await getMCPTypeById(mcp_type_id);
		} else {
			mcpType = await getMCPTypeByName(mcp_type_id);
		}
		
		if (!mcpType) {
			return res.status(404).json({
				error: {
					code: 'MCP_TYPE_NOT_FOUND',
					message: 'Invalid MCP type ID or service name',
					details: { mcp_type_id },
				},
			});
		}

		const serviceName = mcpType.mcp_service_name;

		// Additional credential-specific validation based on MCP type
		const credentialSchema = /** @type {any} */ (getCredentialSchemaByType(mcp_type_id));
		const credentialValidation = credentialSchema.safeParse(credentials);

		if (!credentialValidation.success) {
			return res.status(400).json({
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Invalid credentials format',
					details: credentialValidation.error.errors.map((/** @type {any} */ err) => ({
						field: `credentials.${err.path.join('.')}`,
						message: err.message,
					})),
				},
			});
		}

		// Test credentials with actual API using the service name
		const testResult = /** @type {any} */ (await testAPICredentials(serviceName, credentials));

		if (testResult.valid) {
			return res.status(200).json({
				data: {
					valid: true,
					message: 'Credentials validated successfully',
					api_info: testResult.api_info,
				},
			});
		} else {
			return res.status(400).json({
				error: {
					code: testResult.error_code,
					message: testResult.error_message,
					details: testResult.details,
				},
			});
		}
	} catch (error) {
		console.error('Credential validation error:', error);
		return res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Internal server error during validation',
			},
		});
	}
}
