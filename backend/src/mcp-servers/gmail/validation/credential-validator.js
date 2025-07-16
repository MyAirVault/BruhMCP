// @ts-check
import { BaseValidator, createValidationResult } from '../../../services/validation/base-validator.js';
import { googleOAuth } from '../../../oauth-service/providers/google.js';

/**
 * Gmail OAuth credential validator
 */
class GmailOAuthValidator extends BaseValidator {
  constructor() {
    super('gmail', 'oauth');
  }

  /**
   * Validate Gmail OAuth credentials format
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
      // Use Google OAuth provider to validate credentials format
      const validation = await googleOAuth.validateCredentials(
        credentials.client_id,
        credentials.client_secret
      );

      if (validation.valid) {
        return createValidationResult(true, null, null, this.getServiceInfo(credentials));
      } else {
        return createValidationResult(false, validation.error, validation.field);
      }
    } catch (/** @type {any} */ error) {
      return createValidationResult(false, `Failed to validate Gmail OAuth credentials: ${error.message}`, 'credentials');
    }
  }

  /**
   * Get Gmail service information
   * @param {any} credentials - Validated credentials
   * @returns {Object} Service information
   */
  getServiceInfo(credentials) {
    return {
      service: 'Gmail OAuth',
      auth_type: 'oauth',
      client_id: credentials.client_id,
      validation_type: 'format_validation',
      note: 'Format validation passed. OAuth flow required for full access.',
      permissions: ['gmail.modify', 'userinfo.email', 'userinfo.profile'],
    };
  }
}

/**
 * Gmail API Key validator (legacy support)
 */
class GmailAPIKeyValidator extends BaseValidator {
  constructor() {
    super('gmail', 'api_key');
  }

  /**
   * Validate Gmail API key format
   * @param {any} credentials - Credentials to validate
   * @returns {Promise<import('../../../services/validation/base-validator.js').ValidationResult>} Validation result
   */
  async validateFormat(credentials) {
    if (!credentials || typeof credentials !== 'object') {
      return createValidationResult(false, 'Credentials must be a valid object', 'credentials');
    }

    if (!credentials.api_key) {
      return createValidationResult(false, 'API key is required', 'api_key');
    }

    // Gmail API keys typically start with 'AIza'
    if (!credentials.api_key.startsWith('AIza')) {
      return createValidationResult(false, 'Invalid Gmail API key format - must start with "AIza"', 'api_key');
    }

    // Basic length validation
    if (credentials.api_key.length < 30 || credentials.api_key.length > 50) {
      return createValidationResult(false, 'Gmail API key length appears invalid', 'api_key');
    }

    return createValidationResult(true, null, null, this.getServiceInfo(credentials));
  }

  /**
   * Get Gmail API service information
   * @param {any} _credentials - Validated credentials
   * @returns {Object} Service information
   */
  getServiceInfo(_credentials) {
    return {
      service: 'Gmail API',
      auth_type: 'api_key',
      validation_type: 'format_validation',
      note: 'OAuth2 validation required for full access',
      permissions: ['read', 'send'],
    };
  }
}

/**
 * Gmail validator factory - determines which validator to use based on credentials
 * @param {any} credentials - Credentials to validate
 * @returns {BaseValidator} Appropriate validator instance
 */
function createGmailValidator(credentials) {
  if (credentials && credentials.client_id && credentials.client_secret) {
    return new GmailOAuthValidator();
  } else if (credentials && credentials.api_key) {
    return new GmailAPIKeyValidator();
  } else {
    throw new Error('Invalid Gmail credentials format - must provide either OAuth credentials (client_id, client_secret) or API key');
  }
}

export default createGmailValidator;