// @ts-check
import { BaseValidator, createValidationResult } from '../../../services/validation/base-validator.js';
import { slackOAuth } from '../../../oauth-service/providers/slack.js';

/**
 * Slack OAuth credential validator
 */
class SlackOAuthValidator extends BaseValidator {
  constructor() {
    super('slack', 'oauth');
  }

  /**
   * Validate Slack OAuth credentials format
   * @param {any} credentials - Credentials to validate
   * @returns {Promise<import('../../../services/validation/base-validator.js').ValidationResult>} Validation result
   */
  async validateFormat(credentials) {
    // Check if credentials object has required OAuth fields
    if (!credentials || typeof credentials !== 'object') {
      return createValidationResult(false, 'Credentials must be a valid object', 'credentials');
    }

    if (!credentials.client_id || !credentials.client_secret) {
      return createValidationResult(false, 'OAuth credentials must include client_id and client_secret', 'credentials');
    }

    try {
      // Use Slack OAuth provider to validate credentials format
      const validation = await slackOAuth.validateCredentials(
        credentials.client_id,
        credentials.client_secret
      );

      if (validation.valid) {
        return createValidationResult(true, null, null, this.getServiceInfo(credentials));
      } else {
        return createValidationResult(false, validation.error, validation.field);
      }
    } catch (/** @type {any} */ error) {
      return createValidationResult(false, `Failed to validate Slack OAuth credentials: ${error.message}`, 'credentials');
    }
  }

  /**
   * Get Slack service information
   * @param {any} credentials - Validated credentials
   * @returns {Object} Service information
   */
  getServiceInfo(credentials) {
    return {
      service: 'Slack OAuth',
      auth_type: 'oauth',
      client_id: credentials.client_id,
      validation_type: 'format_validation',
      note: 'Format validation passed. OAuth flow required for full access.',
      permissions: ['chat:write', 'channels:read', 'users:read', 'files:write', 'reactions:write'],
    };
  }
}

/**
 * Slack Bot Token validator
 */
class SlackBotTokenValidator extends BaseValidator {
  constructor() {
    super('slack', 'bot_token');
  }

  /**
   * Validate Slack Bot Token format
   * @param {any} credentials - Credentials to validate
   * @returns {Promise<import('../../../services/validation/base-validator.js').ValidationResult>} Validation result
   */
  async validateFormat(credentials) {
    if (!credentials || typeof credentials !== 'object') {
      return createValidationResult(false, 'Credentials must be a valid object', 'credentials');
    }

    if (!credentials.bot_token) {
      return createValidationResult(false, 'Bot token is required', 'bot_token');
    }

    // Slack Bot tokens start with 'xoxb-'
    if (!credentials.bot_token.startsWith('xoxb-')) {
      return createValidationResult(false, 'Invalid Slack Bot token format - must start with "xoxb-"', 'bot_token');
    }

    // Basic length validation
    if (credentials.bot_token.length < 50 || credentials.bot_token.length > 100) {
      return createValidationResult(false, 'Slack Bot token length appears invalid', 'bot_token');
    }

    return createValidationResult(true, null, null, this.getServiceInfo(credentials));
  }

  /**
   * Get Slack Bot Token service information
   * @param {any} _credentials - Validated credentials
   * @returns {Object} Service information
   */
  getServiceInfo(_credentials) {
    return {
      service: 'Slack Bot Token',
      auth_type: 'bot_token',
      validation_type: 'format_validation',
      note: 'Bot token format validation passed. Requires valid bot token with appropriate scopes.',
      permissions: ['chat:write', 'channels:read', 'users:read', 'files:write', 'reactions:write'],
    };
  }
}

/**
 * Slack User Token validator
 */
class SlackUserTokenValidator extends BaseValidator {
  constructor() {
    super('slack', 'user_token');
  }

  /**
   * Validate Slack User Token format
   * @param {any} credentials - Credentials to validate
   * @returns {Promise<import('../../../services/validation/base-validator.js').ValidationResult>} Validation result
   */
  async validateFormat(credentials) {
    if (!credentials || typeof credentials !== 'object') {
      return createValidationResult(false, 'Credentials must be a valid object', 'credentials');
    }

    if (!credentials.user_token) {
      return createValidationResult(false, 'User token is required', 'user_token');
    }

    // Slack User tokens start with 'xoxp-'
    if (!credentials.user_token.startsWith('xoxp-')) {
      return createValidationResult(false, 'Invalid Slack User token format - must start with "xoxp-"', 'user_token');
    }

    // Basic length validation
    if (credentials.user_token.length < 50 || credentials.user_token.length > 100) {
      return createValidationResult(false, 'Slack User token length appears invalid', 'user_token');
    }

    return createValidationResult(true, null, null, this.getServiceInfo(credentials));
  }

  /**
   * Get Slack User Token service information
   * @param {any} _credentials - Validated credentials
   * @returns {Object} Service information
   */
  getServiceInfo(_credentials) {
    return {
      service: 'Slack User Token',
      auth_type: 'user_token',
      validation_type: 'format_validation',
      note: 'User token format validation passed. Requires valid user token with appropriate scopes.',
      permissions: ['chat:write', 'channels:read', 'users:read', 'files:write', 'reactions:write'],
    };
  }
}

/**
 * Slack validator factory - determines which validator to use based on credentials
 * @param {any} credentials - Credentials to validate
 * @returns {BaseValidator} Appropriate validator instance
 */
function createSlackValidator(credentials) {
  if (credentials && credentials.client_id && credentials.client_secret) {
    return new SlackOAuthValidator();
  } else if (credentials && credentials.bot_token) {
    return new SlackBotTokenValidator();
  } else if (credentials && credentials.user_token) {
    return new SlackUserTokenValidator();
  } else {
    throw new Error('Invalid Slack credentials format - must provide either OAuth credentials (client_id, client_secret), bot token (bot_token), or user token (user_token)');
  }
}

export default createSlackValidator;