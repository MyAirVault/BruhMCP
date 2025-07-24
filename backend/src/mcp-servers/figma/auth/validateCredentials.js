/**
 * @fileoverview Figma Credential Validation
 * Standardized function for validating Figma API key credentials
 */

import createFigmaValidator from '../validation/credentialValidator.js';

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').ValidationResult} ValidationResult
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').CredentialsData} CredentialsData
 * @typedef {import('../../../services/validation/baseValidator.js').ValidationResult} BaseValidationResult
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
		console.log('📨 Received credentials:', Object.keys(credentials));

		// Convert our credentials format to what the existing validator expects
		// Frontend sends 'api_key', we need to handle both formats
		const figmaCredentials = {
			api_key: credentials.api_key || credentials.apiKey || credentials.apiToken
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
		/** @type {BaseValidationResult} */
		const result = await validator.testCredentials(figmaCredentials);

		// Convert validator result to our expected format
		console.log('🔄 Figma validator result:', { valid: result.valid, error: result.error });
		
		if (result.valid) {
			const response = {
				success: true,
				message: 'Figma API key is valid',
				data: {
					userInfo: result.service_info,
					service: 'figma',
					authType: 'apikey',
					validatedAt: new Date().toISOString()
				}
			};
			console.log('✅ Returning success response:', response);
			return response;
		} else {
			const response = {
				success: false,
				message: result.error || 'Invalid Figma API key'
			};
			console.log('❌ Returning failure response:', response);
			return response;
		}
	} catch (/** @type {any} */ error) {
		console.error('Figma credential validation error:', error);
		return {
			success: false,
			message: `Validation failed: ${error?.message || 'Unknown error'}`
		};
	}
}


export { validateCredentials };