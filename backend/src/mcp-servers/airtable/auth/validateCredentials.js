/**
 * @fileoverview Airtable Credential Validation
 * Standardized function for validating Airtable API key credentials
 */

import createAirtableValidator from '../validation/credentialValidator.js';

/**
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').ValidationResult} ValidationResult
 * @typedef {import('../../../services/mcp-auth-registry/types/serviceTypes.js').CredentialsData} CredentialsData
 * @typedef {import('../../../services/validation/baseValidator.js').ValidationResult} BaseValidationResult
 */

/**
 * @typedef {Object} AirtableCredentialsInput
 * @property {string} [api_key] - Primary API key field
 * @property {string} [apiKey] - Alternative API key field
 * @property {string} [apiToken] - Alternative API token field
 */

/**
 * @typedef {Object} NormalizedAirtableCredentials
 * @property {string} api_key - Normalized API key
 */


/**
 * Validates Airtable API key credentials
 * @param {CredentialsData} credentials - Credentials to validate
 * @param {string} userId - User ID making the request
 * @returns {Promise<ValidationResult>} Validation result
 */
async function validateCredentials(credentials, userId) {
	try {
		console.log(`🔍 Validating Airtable credentials for user: ${userId}`);
		console.log('📨 Received credentials:', Object.keys(credentials));

		// Convert our credentials format to what the existing validator expects
		// Frontend sends 'api_key', we need to handle both formats
		/** @type {AirtableCredentialsInput} */
		const typedCredentials = credentials;

		/** @type {NormalizedAirtableCredentials} */
		const airtableCredentials = {
			api_key: typedCredentials.api_key || typedCredentials.apiKey || typedCredentials.apiToken || ''
		};

		if (!airtableCredentials.api_key) {
			return {
				success: false,
				message: 'API key is required for Airtable service'
			};
		}

		// Create validator instance
		const validator = createAirtableValidator(airtableCredentials);

		// Test credentials against Airtable API
		/** @type {BaseValidationResult} */
		const result = await validator.testCredentials(airtableCredentials);

		// Convert validator result to our expected format
		console.log('🔄 Airtable validator result:', { valid: result.valid, error: result.error });
		
		if (result.valid) {
			const response = {
				success: true,
				message: 'Airtable API key is valid',
				data: {
					userInfo: result.service_info,
					service: 'airtable',
					authType: 'apikey',
					validatedAt: new Date().toISOString()
				}
			};
			console.log('✅ Returning success response:', response);
			return response;
		} else {
			const response = {
				success: false,
				message: result.error || 'Invalid Airtable API key'
			};
			console.log('❌ Returning failure response:', response);
			return response;
		}
	} catch (error) {
		console.error('Airtable credential validation error:', error);
		return {
			success: false,
			message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		};
	}
}


export { validateCredentials };