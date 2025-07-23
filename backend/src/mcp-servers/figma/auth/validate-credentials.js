/**
 * @fileoverview Figma Credential Validation
 * Standardized function for validating Figma API key credentials
 */

import createFigmaValidator from '../validation/credential-validator.js';

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/service-types.js').ValidationResult} ValidationResult
 * @typedef {import('../../../services/mcp-auth-registry/types/service-types.js').CredentialsData} CredentialsData
 */


/**
 * Validates Figma API key credentials
 * @param {CredentialsData} credentials - Credentials to validate
 * @param {string} userId - User ID making the request
 * @returns {Promise<ValidationResult>} Validation result
 */
async function validateCredentials(credentials, userId) {
	try {
		console.log(`🔍 Validating Figma credentials for user: ${userId}`);

		// Convert our credentials format to what the existing validator expects
		const figmaCredentials = {
			api_key: credentials.apiKey || credentials.apiToken
		};

		if (!figmaCredentials.api_key) {
			return {
				success: false,
				message: 'API key is required for Figma service'
			};
		}

		// Create validator instance
		const validator = createFigmaValidator(figmaCredentials);

		// Test credentials against Figma API
		const result = await validator.testCredentials(figmaCredentials);

		// Convert validator result to our expected format
		if (result.valid) {
			return {
				success: true,
				message: 'Figma API key is valid',
				data: {
					userInfo: result.data,
					service: 'figma',
					authType: 'apikey',
					validatedAt: new Date().toISOString()
				}
			};
		} else {
			return {
				success: false,
				message: result.error || 'Invalid Figma API key'
			};
		}
	} catch (error) {
		console.error('Figma credential validation error:', error);
		return {
			success: false,
			message: `Validation failed: ${error.message}`
		};
	}
}


export { validateCredentials };