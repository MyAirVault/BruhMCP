/**
 * @fileoverview Google Sheets Credential Validation
 * Standardized function for validating Google Sheets OAuth credentials format
 */

import createSheetsValidator from '../validation/credentialValidator.js';

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').ValidationResult} ValidationResult
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').CredentialsData} CredentialsData
 */


/**
 * Validates Google Sheets OAuth credentials format
 * @param {CredentialsData} credentials - Credentials to validate
 * @param {string} userId - User ID making the request
 * @returns {Promise<ValidationResult>} Validation result
 */
async function validateCredentials(credentials, userId) {
	try {
		console.log(`🔍 Validating Google Sheets credentials for user: ${userId}`);
		console.log('📨 Received credentials:', Object.keys(credentials));

		// Check required fields - handle both formats
		const clientId = credentials.clientId;
		const clientSecret = credentials.clientSecret;
		
		if (!credentials || !clientId || !clientSecret) {
			return {
				success: false,
				message: 'Client ID and Client Secret are required for Google Sheets OAuth'
			};
		}

		// Convert our credentials format to what the existing validator expects
		/** @type {{clientId: string, clientSecret: string}} */
		const sheetsCredentials = {
			clientId: clientId,
			clientSecret: clientSecret
		};

		// Create validator instance
		const validator = createSheetsValidator(sheetsCredentials);

		// Validate credentials format (OAuth only does format validation)
		const result = await validator.validateFormat(sheetsCredentials);

		// Convert validator result to our expected format
		console.log('🔄 Sheets validator result:', { valid: result.valid, error: result.error });
		
		if (result.valid) {
			const response = {
				success: true,
				message: 'Google Sheets OAuth credentials format is valid',
				data: {
					userInfo: result.service_info,
					service: 'sheets',
					authType: 'oauth',
					clientId: clientId,
					validatedAt: new Date().toISOString(),
					note: 'OAuth flow required for full authentication'
				}
			};
			console.log('✅ Returning success response:', response);
			return response;
		} else {
			const response = {
				success: false,
				message: result.error || 'Invalid Google Sheets OAuth credentials format'
			};
			console.log('❌ Returning failure response:', response);
			return response;
		}
	} catch (error) {
		console.error('Sheets credential validation error:', error);
		return {
			success: false,
			message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}


export { validateCredentials };