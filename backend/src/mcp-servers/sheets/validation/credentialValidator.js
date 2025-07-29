// @ts-check
/**
 * @fileoverview Google Sheets OAuth Credential Validator
 * Validates OAuth credentials format for Google Sheets service
 */

const { BaseValidator, createValidationResult  } = require('../../../services/validation/baseValidator');

/**
 * Google Sheets OAuth validator
 */
class GoogleSheetsOAuthValidator extends BaseValidator {
	constructor() {
		super('sheets', 'oauth');
	}

	/**
	 * Validate Google Sheets OAuth credentials format
	 * @param {import('../types/index.js').GoogleSheetsCredentials} credentials - Credentials to validate
	 * @returns {Promise<import('../../../services/validation/baseValidator.js').ValidationResult>} Validation result
	 */
	async validateFormat(credentials) {
		if (!credentials || typeof credentials !== 'object') {
			return createValidationResult(false, 'Credentials must be a valid object', 'credentials');
		}

		// Check for OAuth credentials (support both camelCase and snake_case)
		const clientId = credentials.clientId || (/** @type {any} */ (credentials)).client_id;
		const clientSecret = credentials.clientSecret || (/** @type {any} */ (credentials)).client_secret;

		if (!clientId) {
			return createValidationResult(false, 'Client ID is required', 'clientId');
		}

		if (!clientSecret) {
			return createValidationResult(false, 'Client Secret is required', 'clientSecret');
		}

		// Validate Client ID format (Google OAuth Client ID format)
		const clientIdRegex = /^[0-9]+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/;
		if (!clientIdRegex.test(clientId)) {
			return createValidationResult(
				false, 
				'Invalid Client ID format. Expected Google OAuth Client ID format: {numbers}-{string}.apps.googleusercontent.com', 
				'clientId'
			);
		}

		// Validate Client Secret format
		if (clientSecret.length < 24) {
			return createValidationResult(
				false, 
				'Client Secret appears to be too short. Google OAuth Client Secret should be at least 24 characters', 
				'clientSecret'
			);
		}

		return createValidationResult(true, null, null, this.getServiceInfo(credentials));
	}

	/**
	 * Test Google Sheets OAuth credentials against actual API
	 * Note: OAuth services only do format validation, not functional testing
	 * @param {import('../types/index.js').GoogleSheetsCredentials} credentials - Credentials to test
	 * @returns {Promise<import('../../../services/validation/baseValidator.js').ValidationResult>} Validation result
	 */
	async testCredentials(credentials) {
		// OAuth services only do format validation
		// Actual authentication happens through OAuth flow
		return this.validateFormat(credentials);
	}

	/**
	 * Get Google Sheets service information
	 * @param {import('../types/index.js').GoogleSheetsCredentials} _credentials - Validated credentials
	 * @returns {Object} Service information
	 */
	getServiceInfo(_credentials) {
		return {
			service: 'Google Sheets API',
			auth_type: 'oauth',
			validation_type: 'format_validation',
			requires_oauth_flow: true,
			permissions: ['read', 'write', 'manage'],
			scopes: [
				'https://www.googleapis.com/auth/spreadsheets',
				'https://www.googleapis.com/auth/drive.readonly',
				'https://www.googleapis.com/auth/userinfo.profile',
				'https://www.googleapis.com/auth/userinfo.email'
			]
		};
	}
}

/**
 * Google Sheets validator factory
 * @param {import('../types/index.js').GoogleSheetsCredentials} credentials - Credentials to validate
 * @returns {BaseValidator} Validator instance
 */
function createSheetsValidator(credentials) {
	if (credentials && (credentials.clientId || (/** @type {any} */ (credentials)).client_id)) {
		return new GoogleSheetsOAuthValidator();
	} else {
		throw new Error('Invalid Google Sheets credentials format - must provide clientId or client_id');
	}
}

module.exports = createSheetsValidator;