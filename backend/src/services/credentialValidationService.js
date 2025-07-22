// @ts-check
import { validationRegistry } from './validation/validation-registry.js';

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether credentials are valid
 * @property {Object|null} api_info - Service information if validation succeeded
 * @property {string|null} error_code - Error code if validation failed
 * @property {string|null} error_message - Error message if validation failed
 * @property {Object|null} details - Additional error details
 */

/**
 * Test API credentials using the modular validation system
 * @param {string} serviceName - Service name (gmail, figma, github, etc.)
 * @param {Object} credentials - Credentials to test
 * @param {boolean} performApiTest - Whether to perform actual API test (default: format validation only)
 * @returns {Promise<ValidationResult>} Validation result
 */
export async function testAPICredentials(serviceName, credentials, performApiTest = false) {
	try {
		// Initialize validation registry
		await validationRegistry.initialize();

		/** @type {ValidationResult} */
		const result = {
			valid: false,
			api_info: null,
			error_code: null,
			error_message: null,
			details: null,
		};

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
			performApiTest,
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
				const validation =
					performApiTest && typeof validator.testCredentials === 'function'
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
			} catch (/** @type {unknown} */ error) {
				console.error(`❌ Error in validator for ${serviceName}:`, error);
				result.error_code = 'API_ERROR';
				const errorMessage = error instanceof Error ? error.message : String(error);
				result.error_message = `Failed to validate ${serviceName} credentials: ${errorMessage}`;
				result.details = { error: errorMessage };
				return result;
			}
		} else {
			console.log(`⚠️  No validator found for ${serviceName}`);
		}

		// If no valid credentials found
		result.error_code = 'INVALID_CREDENTIALS';
		result.error_message = 'Invalid or missing credentials';
		result.details = {
			field: 'credentials',
			reason: 'Credentials format not recognized or invalid',
		};

		return result;
	} catch (/** @type {unknown} */ error) {
		console.error('Error testing credentials:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		return {
			valid: false,
			api_info: null,
			error_code: 'VALIDATION_ERROR',
			error_message: 'Failed to validate credentials',
			details: {
				error: errorMessage,
			},
		};
	}
}


/**
 * @typedef {Object} ValidationError
 * @property {string[]} path - Path to the error
 * @property {string} message - Error message
 */

/**
 * @typedef {Object} ParseResult
 * @property {boolean} success - Whether parsing succeeded
 * @property {{errors: ValidationError[]}} [error] - Validation errors if parsing failed
 * @property {Object} [data] - Parsed data if parsing succeeded
 */

/**
 * @typedef {Object} CredentialSchema
 * @property {function(Object): ParseResult} safeParse - Function to safely parse credentials
 */

/**
 * Get credential schema by MCP type ID
 * @param {string} _mcpTypeId - MCP type ID
 * @returns {CredentialSchema} Credential schema
 */
export function getCredentialSchemaByType(_mcpTypeId) {
	// This would normally be fetched from the database
	// For now, we'll return a basic schema
	return {
		safeParse: (/** @type {Object} */ credentials) => {
			/** @type {ValidationError[]} */
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
