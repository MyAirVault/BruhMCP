// @ts-check
import { BaseValidator, createValidationResult } from '../../../services/validation/baseValidator.js';

/**
 * Reddit OAuth credential validator
 */
class RedditOAuthValidator extends BaseValidator {
  constructor() {
    super('reddit', 'oauth');
  }

  /**
   * Validate Reddit OAuth credentials format
   * @param {any} credentials - Credentials to validate
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

    try {
      // Validate Reddit OAuth credential format
      const validation = await this.validateRedditCredentials(
        credentials.client_id,
        credentials.client_secret
      );

      if (validation.valid) {
        return createValidationResult(true, null, null, this.getServiceInfo(credentials));
      } else {
        return createValidationResult(false, validation.error, validation.field);
      }
    } catch (/** @type {any} */ error) {
      return createValidationResult(false, `Failed to validate Reddit OAuth credentials: ${error.message}`, 'credentials');
    }
  }

  /**
   * Validate Reddit OAuth credentials
   * @param {string} clientId - OAuth client ID
   * @param {string} clientSecret - OAuth client secret
   * @returns {Promise<{valid: boolean, error?: string, field?: string}>} Validation result
   */
  async validateRedditCredentials(clientId, clientSecret) {
    // Basic format validation
    if (typeof clientId !== 'string' || typeof clientSecret !== 'string') {
      return { valid: false, error: 'Client ID and client secret must be strings', field: 'credentials' };
    }

    // Reddit client ID format validation
    if (clientId.length < 10 || clientId.length > 50) {
      return { valid: false, error: 'Reddit client ID length appears invalid', field: 'client_id' };
    }

    // Reddit client secret format validation
    if (clientSecret.length < 20 || clientSecret.length > 100) {
      return { valid: false, error: 'Reddit client secret length appears invalid', field: 'client_secret' };
    }

    // Check for common patterns in Reddit credentials
    if (clientId.includes(' ') || clientSecret.includes(' ')) {
      return { valid: false, error: 'Credentials cannot contain spaces', field: 'credentials' };
    }

    // Reddit client IDs are typically alphanumeric with some special characters
    const clientIdRegex = /^[a-zA-Z0-9_-]+$/;
    if (!clientIdRegex.test(clientId)) {
      return { valid: false, error: 'Reddit client ID contains invalid characters', field: 'client_id' };
    }

    // Reddit client secrets are typically alphanumeric with some special characters
    const clientSecretRegex = /^[a-zA-Z0-9_-]+$/;
    if (!clientSecretRegex.test(clientSecret)) {
      return { valid: false, error: 'Reddit client secret contains invalid characters', field: 'client_secret' };
    }

    return { valid: true };
  }

  /**
   * Get Reddit service information
   * @param {any} credentials - Validated credentials
   * @returns {Object} Service information
   */
  getServiceInfo(credentials) {
    return {
      service: 'Reddit OAuth',
      auth_type: 'oauth',
      client_id: credentials.client_id,
      validation_type: 'format_validation',
      note: 'Format validation passed. OAuth flow required for full access.',
      permissions: ['identity', 'read', 'vote', 'submit', 'flair', 'edit', 'privatemessages'],
    };
  }
}

/**
 * Reddit API Key validator (if Reddit supported API keys)
 */
class RedditAPIKeyValidator extends BaseValidator {
  constructor() {
    super('reddit', 'api_key');
  }

  /**
   * Validate Reddit API key format
   * @param {any} credentials - Credentials to validate
   * @returns {Promise<import('../../../services/validation/baseValidator.js').ValidationResult>} Validation result
   */
  async validateFormat(credentials) {
    if (!credentials || typeof credentials !== 'object') {
      return createValidationResult(false, 'Credentials must be a valid object', 'credentials');
    }

    if (!credentials.api_key) {
      return createValidationResult(false, 'API key is required', 'api_key');
    }

    // Reddit doesn't typically use API keys, but validate format if provided
    if (typeof credentials.api_key !== 'string') {
      return createValidationResult(false, 'API key must be a string', 'api_key');
    }

    // Basic length validation
    if (credentials.api_key.length < 10 || credentials.api_key.length > 100) {
      return createValidationResult(false, 'API key length appears invalid', 'api_key');
    }

    return createValidationResult(true, null, null, this.getServiceInfo(credentials));
  }

  /**
   * Get Reddit API service information
   * @param {any} _credentials - Validated credentials
   * @returns {Object} Service information
   */
  getServiceInfo(_credentials) {
    return {
      service: 'Reddit API',
      auth_type: 'api_key',
      validation_type: 'format_validation',
      note: 'Reddit primarily uses OAuth2. API key support is limited.',
      permissions: ['read'],
    };
  }
}

/**
 * Reddit validator factory - determines which validator to use based on credentials
 * @param {any} credentials - Credentials to validate
 * @returns {BaseValidator} Appropriate validator instance
 */
function createRedditValidator(credentials) {
  if (credentials && credentials.client_id && credentials.client_secret) {
    return new RedditOAuthValidator();
  } else if (credentials && credentials.api_key) {
    return new RedditAPIKeyValidator();
  } else {
    throw new Error('Invalid Reddit credentials format - must provide either OAuth credentials (client_id, client_secret) or API key');
  }
}

export default createRedditValidator;