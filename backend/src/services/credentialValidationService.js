// @ts-check
import fetch from 'node-fetch';
import { validationRegistry } from './validation/validation-registry.js';

/**
 * Test API credentials using the modular validation system
 * @param {string} serviceName - Service name (gmail, figma, github, etc.)
 * @param {any} credentials - Credentials to test
 * @param {boolean} performApiTest - Whether to perform actual API test (default: format validation only)
 * @returns {Promise<any>} Validation result
 */
export async function testAPICredentials(serviceName, credentials, performApiTest = false) {
	try {
		// Initialize validation registry
		await validationRegistry.initialize();

		const result = /** @type {any} */ ({
			valid: false,
			api_info: null,
			error_code: null,
			error_message: null,
			details: null,
		});

		// Check if credentials object has required fields
		if (!credentials || typeof credentials !== 'object') {
			console.log('❌ Invalid credentials object:', credentials);
			result.error_code = 'INVALID_CREDENTIALS';
			result.error_message = 'Credentials must be a valid object';
			return result;
		}
		
		console.log(`📋 Validating credentials for ${serviceName}:`, {
			serviceName,
			credentialKeys: Object.keys(credentials),
			performApiTest
		});

		// Try to get service-specific validator
		console.log(`🔍 Looking for validator for service: ${serviceName}`);
		const validatorFactory = validationRegistry.getValidator(serviceName);
		
		if (validatorFactory) {
			console.log(`✅ Found validator for ${serviceName}`);
			try {
				// Create validator instance based on credentials
				const validator = validatorFactory(credentials);
				console.log(`📝 Created validator instance for ${serviceName}`);
				
				// Use API test if requested and available, otherwise use format validation
				const validation = performApiTest && typeof validator.testCredentials === 'function'
					? await validator.testCredentials(credentials)
					: await validator.validateFormat(credentials);

				console.log(`📊 Validation result for ${serviceName}:`, validation);

				if (validation.valid) {
					result.valid = true;
					result.api_info = validation.service_info;
					return result;
				} else {
					result.error_code = 'INVALID_CREDENTIALS';
					result.error_message = validation.error;
					result.details = {
						field: validation.field,
						reason: 'Service-specific validation failed',
					};
					return result;
				}
			} catch (/** @type {any} */ error) {
				console.error(`❌ Error in validator for ${serviceName}:`, error);
				result.error_code = 'API_ERROR';
				result.error_message = `Failed to validate ${serviceName} credentials: ${error.message}`;
				result.details = { error: error.message };
				return result;
			}
		} else {
			console.log(`⚠️  No validator found for ${serviceName}`);
		}

		// Fallback to legacy hardcoded validation for unsupported services
		const legacyResult = await legacyValidation(credentials);
		if (legacyResult) {
			return legacyResult;
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
 * Legacy validation fallback for services without custom validators
 * @param {any} credentials - Credentials to validate
 * @returns {Promise<any|null>} Validation result or null if no match
 */
async function legacyValidation(credentials) {
	const result = /** @type {any} */ ({
		valid: false,
		api_info: null,
		error_code: null,
		error_message: null,
		details: null,
	});

	// Add support for other services that don't have custom validators yet
	// This can be gradually removed as services get their own validators

	return null; // No legacy validation found
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
