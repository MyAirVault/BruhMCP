/**
 * @fileoverview Gmail Credential Validation
 * Standardized function for validating Gmail OAuth credentials format
 */

const createGmailValidator = require('../validation/credentialValidator.js');

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').ValidationResult} ValidationResult
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').CredentialsData} CredentialsData
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
		console.log('📨 Received credentials:', Object.keys(credentials));

		// Check required fields - handle both formats
		const clientId = credentials.clientId || /** @type {any} */ (credentials).client_id;
		const clientSecret = credentials.clientSecret || /** @type {any} */ (credentials).client_secret;
		
		if (!credentials || !clientId || !clientSecret) {
			return {
				success: false,
				message: 'Client ID and Client Secret are required for Gmail OAuth'
			};
		}

		// Convert our credentials format to what the existing validator expects
		const gmailCredentials = {
			client_id: clientId,
			client_secret: clientSecret
		};

		// Create validator instance
		const validator = createGmailValidator(gmailCredentials);

		// Validate credentials format (OAuth only does format validation)
		const result = await validator.validateFormat(gmailCredentials);

		// Convert validator result to our expected format
		console.log('🔄 Gmail validator result:', { valid: result.valid, error: result.error });
		
		if (result.valid) {
			const response = {
				success: true,
				message: 'Gmail OAuth credentials format is valid',
				data: {
					userInfo: result.service_info,  // Changed from serviceInfo to userInfo
					service: 'gmail',
					authType: 'oauth',
					clientId: clientId,  // Use the parsed clientId
					validatedAt: new Date().toISOString(),
					note: 'OAuth flow required for full authentication'
				}
			};
			console.log('✅ Returning success response:', response);
			return response;
		} else {
			const response = {
				success: false,
				message: result.error || 'Invalid Gmail OAuth credentials format'
			};
			console.log('❌ Returning failure response:', response);
			return response;
		}
	} catch (error) {
		console.error('Gmail credential validation error:', error);
		return {
			success: false,
			message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}


;

module.exports = {
	validateCredentials
};