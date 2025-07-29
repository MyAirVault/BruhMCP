/**
 * @fileoverview Notion Credential Validation
 * Standardized function for validating Notion OAuth credentials format
 */

const createNotionValidator = require('../validation/credentialValidator');

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').ValidationResult} ValidationResult
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').CredentialsData} CredentialsData
 */


/**
 * Validates Notion OAuth credentials format
 * @param {CredentialsData} credentials - Credentials to validate
 * @param {string} userId - User ID making the request
 * @returns {Promise<ValidationResult>} Validation result
 */
async function validateCredentials(credentials, userId) {
	try {
		console.log(`🔍 Validating Notion credentials for user: ${userId}`);
		console.log('📨 Received credentials:', Object.keys(credentials));

		// Check required fields
		const clientId = credentials.clientId;
		const clientSecret = credentials.clientSecret;
		
		if (!credentials || !clientId || !clientSecret) {
			return {
				success: false,
				message: 'Client ID and Client Secret are required for Notion OAuth'
			};
		}

		// Convert our credentials format to what the existing validator expects
		const notionCredentials = {
			client_id: clientId,
			client_secret: clientSecret
		};

		// Create validator instance
		const validator = createNotionValidator(/** @type {import('../validation/credentialValidator.js').OAuthCredentials} */ (notionCredentials));

		// Validate credentials format (OAuth only does format validation)
		const result = await validator.validateFormat(notionCredentials);

		// Convert validator result to our expected format
		console.log('🔄 Notion validator result:', { valid: result.valid, error: result.error });
		
		if (result.valid) {
			const response = {
				success: true,
				message: 'Notion OAuth credentials format is valid',
				data: {
					userInfo: result.service_info,
					service: 'notion',
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
				message: result.error || 'Invalid Notion OAuth credentials format'
			};
			console.log('❌ Returning failure response:', response);
			return response;
		}
	} catch (error) {
		console.error('Notion credential validation error:', error);
		return {
			success: false,
			message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}



module.exports = { validateCredentials  };