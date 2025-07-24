/**
 * @fileoverview Reddit Credential Validation
 * Standardized function for validating Reddit OAuth credentials format
 */

import createRedditValidator from '../validation/credentialValidator.js';

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').ValidationResult} ValidationResult
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').CredentialsData} CredentialsData
 */

/**
 * Validates Reddit OAuth credentials format
 * @param {CredentialsData} credentials - Credentials to validate
 * @param {string} userId - User ID making the request
 * @returns {Promise<ValidationResult>} Validation result
 */
async function validateCredentials(credentials, userId) {
	try {
		console.log(`🔍 Validating Reddit credentials for user: ${userId}`);
		console.log('📨 Received credentials:', Object.keys(credentials));

		// Check required fields - handle both formats
		const clientId = credentials.client_id || credentials.clientId;
		const clientSecret = credentials.client_secret || credentials.clientSecret;
		
		if (!credentials || !clientId || !clientSecret) {
			return {
				success: false,
				message: 'Client ID and Client Secret are required for Reddit OAuth'
			};
		}

		// Convert our credentials format to what the existing validator expects
		const redditCredentials = {
			client_id: clientId,
			client_secret: clientSecret
		};

		// Create validator instance
		const validator = createRedditValidator(redditCredentials);

		// Validate credentials format (OAuth only does format validation)
		const result = await validator.validateFormat(redditCredentials);

		// Convert validator result to our expected format
		console.log('🔄 Reddit validator result:', { valid: result.valid, error: result.error });
		
		if (result.valid) {
			const response = {
				success: true,
				message: 'Reddit OAuth credentials format is valid',
				data: {
					userInfo: result.service_info,
					service: 'reddit',
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
				message: result.error || 'Invalid Reddit OAuth credentials format'
			};
			console.log('❌ Returning failure response:', response);
			return response;
		}
	} catch (error) {
		console.error('Reddit credential validation error:', error);
		return {
			success: false,
			message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}

export { validateCredentials };