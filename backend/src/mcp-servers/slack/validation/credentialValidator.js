// @ts-check
import { BaseValidator, createValidationResult } from '../../../services/validation/baseValidator.js';

/**
 * Slack OAuth credentials object
 * @typedef {Object} SlackOAuthCredentials
 * @property {string} client_id - OAuth client ID
 * @property {string} client_secret - OAuth client secret
 */

/**
 * Slack Bot Token credentials object
 * @typedef {Object} SlackBotTokenCredentials
 * @property {string} bot_token - Slack bot token (starts with xoxb-)
 */

/**
 * Slack User Token credentials object
 * @typedef {Object} SlackUserTokenCredentials
 * @property {string} user_token - Slack user token (starts with xoxp-)
 */

/**
 * Slack service information object
 * @typedef {Object} SlackServiceInfo
 * @property {string} service - Service name
 * @property {string} auth_type - Authentication type
 * @property {string} [client_id] - OAuth client ID (for OAuth validation)
 * @property {string} validation_type - Type of validation performed
 * @property {string} note - Additional information
 * @property {string[]} permissions - List of required permissions/scopes
 */

/**
 * Generic credentials object that could be any of the Slack credential types
 * @typedef {SlackOAuthCredentials|SlackBotTokenCredentials|SlackUserTokenCredentials} SlackCredentials
 */

/**
 * Slack OAuth credential validator
 */
class SlackOAuthValidator extends BaseValidator {
  constructor() {
    super('slack', 'oauth');
  }

  /**
   * Validate Slack OAuth credentials format
   * @param {SlackOAuthCredentials} credentials - Credentials to validate
   * @returns {Promise<import('../../../services/validation/baseValidator.js').ValidationResult>} Validation result
   */
  async validateFormat(credentials) {
    // Check if credentials object has required OAuth fields
    if (!credentials || typeof credentials !== 'object') {
      return createValidationResult(false, 'Credentials must be a valid object', 'credentials');
    }

    if (!credentials.client_id || !credentials.client_secret) {
      return createValidationResult(false, 'OAuth credentials must include client_id and client_secret', 'credentials');
    }

    // Basic OAuth format validation for Slack
    if (typeof credentials.client_id !== 'string' || credentials.client_id.length === 0) {
      return createValidationResult(false, 'Client ID must be a non-empty string', 'client_id');
    }

    if (typeof credentials.client_secret !== 'string' || credentials.client_secret.length === 0) {
      return createValidationResult(false, 'Client secret must be a non-empty string', 'client_secret');
    }

    return createValidationResult(true, null, null, this.getServiceInfo(credentials));
  }

  /**
   * Get Slack service information
   * @param {SlackOAuthCredentials} credentials - Validated credentials
   * @returns {SlackServiceInfo} Service information
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
   * @param {SlackBotTokenCredentials} credentials - Credentials to validate
   * @returns {Promise<import('../../../services/validation/baseValidator.js').ValidationResult>} Validation result
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
   * @param {SlackBotTokenCredentials} _credentials - Validated credentials
   * @returns {SlackServiceInfo} Service information
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
   * @param {SlackUserTokenCredentials} credentials - Credentials to validate
   * @returns {Promise<import('../../../services/validation/baseValidator.js').ValidationResult>} Validation result
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
   * @param {SlackUserTokenCredentials} _credentials - Validated credentials
   * @returns {SlackServiceInfo} Service information
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
 * Check if credentials are OAuth credentials
 * @param {Object} credentials - Credentials to check
 * @returns {credentials is SlackOAuthCredentials} True if OAuth credentials
 */
function isOAuthCredentials(credentials) {
  return credentials && 
         typeof credentials === 'object' &&
         'client_id' in credentials && 
         'client_secret' in credentials;
}

/**
 * Check if credentials are bot token credentials
 * @param {Object} credentials - Credentials to check
 * @returns {credentials is SlackBotTokenCredentials} True if bot token credentials
 */
function isBotTokenCredentials(credentials) {
  return credentials && 
         typeof credentials === 'object' &&
         'bot_token' in credentials;
}

/**
 * Check if credentials are user token credentials
 * @param {Object} credentials - Credentials to check
 * @returns {credentials is SlackUserTokenCredentials} True if user token credentials
 */
function isUserTokenCredentials(credentials) {
  return credentials && 
         typeof credentials === 'object' &&
         'user_token' in credentials;
}

/**
 * Slack validator factory - determines which validator to use based on credentials
 * @param {Object} credentials - Credentials to validate
 * @returns {BaseValidator} Appropriate validator instance
 */
function createSlackValidator(credentials) {
  if (isOAuthCredentials(credentials)) {
    return new SlackOAuthValidator();
  } else if (isBotTokenCredentials(credentials)) {
    return new SlackBotTokenValidator();
  } else if (isUserTokenCredentials(credentials)) {
    return new SlackUserTokenValidator();
  } else {
    throw new Error('Invalid Slack credentials format - must provide either OAuth credentials (client_id, client_secret), bot token (bot_token), or user token (user_token)');
  }
}

export default createSlackValidator;