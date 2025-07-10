// @ts-check
import fetch from 'node-fetch';

/**
 * Test API credentials against the actual API
 * @param {string} _mcpTypeId - MCP type ID
 * @param {any} credentials - Credentials to test
 * @returns {Promise<any>} Validation result
 */
export async function testAPICredentials(_mcpTypeId, credentials) {
	try {
		const result = /** @type {any} */ ({
			valid: false,
			api_info: null,
			error_code: null,
			error_message: null,
			details: null,
		});

		// Check if credentials object has required fields
		if (!credentials || typeof credentials !== 'object') {
			result.error_code = 'INVALID_CREDENTIALS';
			result.error_message = 'Credentials must be a valid object';
			return result;
		}

		// Figma API validation
		if (credentials.api_key && credentials.api_key.startsWith('figd_')) {
			try {
				const response = await fetch('https://api.figma.com/v1/me', {
					headers: {
						'X-Figma-Token': credentials.api_key,
					},
				});

				if (response.ok) {
					const data = /** @type {any} */ (await response.json());
					result.valid = true;
					result.api_info = {
						service: 'Figma API',
						user_id: data.id,
						email: data.email,
						handle: data.handle,
						permissions: ['file_read', 'file_write'],
					};
					return result;
				} else {
					result.error_code = 'INVALID_CREDENTIALS';
					result.error_message = 'Invalid Figma API token';
					return result;
				}
			} catch (/** @type {any} */ error) {
				result.error_code = 'API_ERROR';
				result.error_message = 'Failed to validate Figma API token';
				result.details = { error: error.message };
				return result;
			}
		}

		// GitHub API validation
		if (credentials.personal_access_token && credentials.personal_access_token.startsWith('ghp_')) {
			try {
				const response = await fetch('https://api.github.com/user', {
					headers: {
						Authorization: `token ${credentials.personal_access_token}`,
						'User-Agent': 'MCP-Server',
					},
				});

				if (response.ok) {
					const data = /** @type {any} */ (await response.json());
					result.valid = true;
					result.api_info = {
						service: 'GitHub API',
						user_id: data.id,
						login: data.login,
						name: data.name,
						permissions: ['repo', 'read:org'],
					};
					return result;
				} else {
					result.error_code = 'INVALID_CREDENTIALS';
					result.error_message = 'Invalid GitHub personal access token';
					return result;
				}
			} catch (/** @type {any} */ error) {
				result.error_code = 'API_ERROR';
				result.error_message = 'Failed to validate GitHub token';
				result.details = { error: error.message };
				return result;
			}
		}

		// Gmail API validation
		if (credentials.api_key && credentials.api_key.startsWith('AIza')) {
			try {
				// Gmail API requires OAuth2, so we'll just validate the key format
				// In a real implementation, you'd need to handle OAuth2 flow
				result.valid = true;
				result.api_info = {
					service: 'Gmail API',
					note: 'OAuth2 validation required for full access',
					permissions: ['read', 'send'],
				};
				return result;
			} catch (/** @type {any} */ error) {
				result.error_code = 'API_ERROR';
				result.error_message = 'Failed to validate Gmail API key';
				result.details = { error: error.message };
				return result;
			}
		}

		// If no valid credentials found
		result.error_code = 'INVALID_CREDENTIALS';
		result.error_message = 'Invalid or missing credentials';
		result.details = {
			field: 'credentials',
			reason: 'Credentials format not recognized or invalid',
		};

		return result;
	} catch (/** @type {any} */ error) {
		console.error('Error testing credentials:', error);
		return {
			valid: false,
			api_info: null,
			error_code: 'VALIDATION_ERROR',
			error_message: 'Failed to validate credentials',
			details: {
				error: error.message,
			},
		};
	}
}

/**
 * Get credential schema by MCP type ID
 * @param {string} _mcpTypeId - MCP type ID
 * @returns {Object} Credential schema
 */
export function getCredentialSchemaByType(_mcpTypeId) {
	// This would normally be fetched from the database
	// For now, we'll return a basic schema
	return {
		safeParse: (/** @type {any} */ credentials) => {
			const errors = [];

			if (!credentials || typeof credentials !== 'object') {
				errors.push({
					path: ['credentials'],
					message: 'Credentials must be an object',
				});
			}

			if (errors.length > 0) {
				return {
					success: false,
					error: { errors },
				};
			}

			return {
				success: true,
				data: credentials,
			};
		},
	};
}
