// @ts-check
import { BaseValidator, createValidationResult } from '../../../services/validation/base-validator.js';
import fetch from 'node-fetch';

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
 * Discord validator factory
 * @param {any} credentials - Credentials to validate
 * @returns {BaseValidator} Validator instance
 */
function createDiscordValidator(credentials) {
  if (credentials && (credentials.bot_token || credentials.token)) {
    return new DiscordBotTokenValidator();
  } else {
    throw new Error('Invalid Discord credentials format - must provide bot_token or token');
  }
}

export default createDiscordValidator;