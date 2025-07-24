/**
 * @fileoverview Dropbox Credential Validation
 * Standardized function for validating Dropbox OAuth credentials format
 */

import createDropboxValidator from '../validation/credentialValidator.js';

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').ValidationResult} ValidationResult
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').CredentialsData} CredentialsData
 */

/**
 * Validates Dropbox OAuth credentials format
 * @param {CredentialsData} credentials - Credentials to validate
 * @param {string} userId - User ID making the request
 * @returns {Promise<ValidationResult>} Validation result
 */
async function validateCredentials(credentials, userId) {
	try {
		console.log(`🔍 Validating Dropbox credentials for user: ${userId}`);
		console.log('📨 Received credentials:', Object.keys(credentials));

		// Check required fields - handle both formats
		const clientId = credentials.clientId;
		const clientSecret = credentials.clientSecret;
		
		if (!credentials || !clientId || !clientSecret) {
			return {
				success: false,
				message: 'Client ID and Client Secret are required for Dropbox OAuth'
			};
		}

		// Convert our credentials format to what the existing validator expects
		const dropboxCredentials = {
			client_id: clientId,
			client_secret: clientSecret
		};

		// Create validator instance
		const validator = createDropboxValidator(dropboxCredentials);

		// Validate credentials format (OAuth only does format validation)
		const result = await validator.validateFormat(dropboxCredentials);

		// Convert validator result to our expected format
		console.log('🔄 Dropbox validator result:', { valid: result.valid, error: result.error });
		
		if (result.valid) {
			const response = {
				success: true,
				message: 'Dropbox OAuth credentials format is valid',
				data: {
					userInfo: result.service_info,  // Changed from serviceInfo to userInfo
					service: 'dropbox',
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
				message: result.error || 'Invalid Dropbox OAuth credentials format'
			};
			console.log('❌ Returning failure response:', response);
			return response;
		}
	} catch (error) {
		console.error('Dropbox credential validation error:', error);
		return {
			success: false,
			message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}

export { validateCredentials };