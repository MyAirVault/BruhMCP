// @ts-check
import { BaseValidator, createValidationResult } from '../../../services/validation/base-validator.js';

/**
 * Discord Bot Token validator
 */
class DiscordBotTokenValidator extends BaseValidator {
	constructor() {
		super('discord', 'bot_token');
	}

	/**
	 * Validate Discord bot token format
	 * @param {any} credentials - Credentials to validate
	 * @returns {Promise<import('../../../services/validation/base-validator.js').ValidationResult>} Validation result
	 */
	async validateFormat(credentials) {
		if (!credentials || typeof credentials !== 'object') {
			return createValidationResult(false, 'Credentials must be a valid object', 'credentials');
		}

		// Check for bot_token or token
		const botToken = credentials.bot_token || credentials.token;

		if (!botToken) {
			return createValidationResult(false, 'Bot token is required', 'bot_token');
		}

		// Basic Discord bot token format validation
		if (typeof botToken !== 'string' || botToken.trim() === '') {
			return createValidationResult(false, 'Bot token must be a non-empty string', 'bot_token');
		}

		// Discord bot tokens typically start with a specific pattern
		// But we'll keep validation minimal to avoid false negatives
		if (botToken.length < 50) {
			return createValidationResult(false, 'Bot token appears to be too short', 'bot_token');
		}

		return createValidationResult(true, null, null, this.getServiceInfo(credentials));
	}

	/**
	 * Test Discord bot token (OAuth flow - no API test needed)
	 * @param {any} credentials - Credentials to test
	 * @returns {Promise<import('../../../services/validation/base-validator.js').ValidationResult>} Validation result
	 */
	async testCredentials(credentials) {
		// For OAuth flow, format validation is sufficient
		// API testing would require actual OAuth flow completion
		const formatResult = await this.validateFormat(credentials);
		if (!formatResult.valid) {
			return formatResult;
		}

		// Return success with OAuth flow message
		return createValidationResult(true, null, null, {
			service: 'Discord Bot API',
			auth_type: 'bot_token',
			validation_type: 'format_validation',
			requires_oauth_flow: true,
			message: 'Token format validated. Full OAuth flow required for API access.',
			permissions: ['read', 'write', 'manage'],
		});
	}

	/**
	 * Get Discord service information
	 * @param {any} _credentials - Validated credentials
	 * @returns {Object} Service information
	 */
	getServiceInfo(_credentials) {
		return {
			service: 'Discord Bot API',
			auth_type: 'bot_token',
			validation_type: 'format_validation',
			permissions: ['read', 'write', 'manage'],
		};
	}
}

/**
 * Discord OAuth validator
 */
class DiscordOAuthValidator extends BaseValidator {
	constructor() {
		super('discord', 'oauth');
	}

	/**
	 * Validate Discord OAuth credentials format
	 * @param {any} credentials - Credentials to validate
	 * @returns {Promise<import('../../../services/validation/base-validator.js').ValidationResult>} Validation result
	 */
	async validateFormat(credentials) {
		if (!credentials || typeof credentials !== 'object') {
			return createValidationResult(false, 'Credentials must be a valid object', 'credentials');
		}

		const { client_id, client_secret } = credentials;

		if (!client_id) {
			return createValidationResult(false, 'Client ID is required', 'client_id');
		}

		if (!client_secret) {
			return createValidationResult(false, 'Client Secret is required', 'client_secret');
		}

		// Validate Client ID format (Discord snowflake: 18-19 digits)
		if (typeof client_id !== 'string' || !/^\d{18,19}$/.test(client_id)) {
			return createValidationResult(
				false,
				'Invalid Discord Client ID format - must be 18-19 digits',
				'client_id'
			);
		}

		// Validate Client Secret format
		if (typeof client_secret !== 'string' || client_secret.length < 30 || client_secret.length > 40) {
			return createValidationResult(false, 'Discord Client Secret length appears invalid', 'client_secret');
		}

		return createValidationResult(true, null, null, this.getServiceInfo(credentials));
	}

	/**
	 * Test Discord OAuth credentials
	 * @param {any} credentials - Credentials to test
	 * @returns {Promise<import('../../../services/validation/base-validator.js').ValidationResult>} Validation result
	 */
	async testCredentials(credentials) {
		// For OAuth flow, format validation is sufficient
		// Actual OAuth testing would require user authorization flow
		const formatResult = await this.validateFormat(credentials);
		if (!formatResult.valid) {
			return formatResult;
		}

		return createValidationResult(true, null, null, {
			service: 'Discord OAuth API',
			auth_type: 'oauth',
			validation_type: 'format_validation',
			requires_oauth_flow: true,
			message: 'OAuth credentials validated. User authorization flow required for API access.',
			permissions: ['identify', 'email', 'guilds'],
		});
	}

	/**
	 * Get Discord OAuth service information
	 * @param {any} _credentials - Validated credentials
	 * @returns {Object} Service information
	 */
	getServiceInfo(_credentials) {
		return {
			service: 'Discord OAuth API',
			auth_type: 'oauth',
			validation_type: 'format_validation',
			permissions: ['identify', 'email', 'guilds'],
		};
	}
}

/**
 * Discord validator factory
 * @param {any} credentials - Credentials to validate
 * @returns {BaseValidator} Validator instance
 */
function createDiscordValidator(credentials) {
	if (credentials && (credentials.bot_token || credentials.token)) {
		return new DiscordBotTokenValidator();
	} else if (credentials && credentials.client_id && credentials.client_secret) {
		return new DiscordOAuthValidator();
	} else {
		throw new Error('Invalid Discord credentials format - must provide bot_token/token or client_id/client_secret');
	}
}

export default createDiscordValidator;
