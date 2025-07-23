/**
 * @fileoverview Gmail Credential Validation
 * Standardized function for validating Gmail OAuth credentials format
 */

import createGmailValidator from '../validation/credential-validator.js';

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/service-types.js').ValidationResult} ValidationResult
 * @typedef {import('../../../services/mcp-auth-registry/types/service-types.js').CredentialsData} CredentialsData
 */


/**
 * Validates Gmail OAuth credentials format
 * @param {CredentialsData} credentials - Credentials to validate
 * @param {string} userId - User ID making the request
 * @returns {Promise<ValidationResult>} Validation result
 */
async function validateCredentials(credentials, userId) {
	try {
		console.log(`🔍 Validating Gmail credentials for user: ${userId}`);

		// Check required fields
		if (!credentials || (!credentials.clientId || !credentials.clientSecret)) {
			return {
				success: false,
				message: 'Client ID and Client Secret are required for Gmail OAuth'
			};
		}

		// Convert our credentials format to what the existing validator expects
		const gmailCredentials = {
			client_id: credentials.clientId,
			client_secret: credentials.clientSecret
		};

		// Create validator instance
		const validator = createGmailValidator(gmailCredentials);

		// Validate credentials format (OAuth only does format validation)
		const result = await validator.validateFormat(gmailCredentials);

		// Convert validator result to our expected format
		if (result.valid) {
			return {
				success: true,
				message: 'Gmail OAuth credentials format is valid',
				data: {
					serviceInfo: result.service_info,
					service: 'gmail',
					authType: 'oauth',
					clientId: credentials.clientId,
					validatedAt: new Date().toISOString(),
					note: 'OAuth flow required for full authentication'
				}
			};
		} else {
			return {
				success: false,
				message: result.error || 'Invalid Gmail OAuth credentials format'
			};
		}
	} catch (error) {
		console.error('Gmail credential validation error:', error);
		return {
			success: false,
			message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}


export { validateCredentials };