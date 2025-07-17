// @ts-check
import { BaseValidator, createValidationResult } from '../../../services/validation/base-validator.js';

/**
 * Dropbox OAuth credential validator
 */
class DropboxOAuthValidator extends BaseValidator {
  constructor() {
    super('dropbox', 'oauth');
  }

  /**
   * Validate Dropbox OAuth credentials format
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
      // Validate Dropbox OAuth credential format
      const validation = await this.validateDropboxCredentials(
        credentials.client_id,
        credentials.client_secret
      );

      if (validation.valid) {
        return createValidationResult(true, null, null, this.getServiceInfo(credentials));
      } else {
        return createValidationResult(false, validation.error, validation.field);
      }
    } catch (/** @type {any} */ error) {
      return createValidationResult(false, `Failed to validate Dropbox OAuth credentials: ${error.message}`, 'credentials');
    }
  }

  /**
   * Validate Dropbox OAuth credentials
   * @param {string} clientId - Client ID
   * @param {string} clientSecret - Client secret
   * @returns {Promise<Object>} Validation result
   */
  async validateDropboxCredentials(clientId, clientSecret) {
    // Basic format validation for Dropbox credentials
    if (!clientId || typeof clientId !== 'string' || clientId.length < 10) {
      return { valid: false, error: 'Invalid client_id format', field: 'client_id' };
    }

    if (!clientSecret || typeof clientSecret !== 'string' || clientSecret.length < 10) {
      return { valid: false, error: 'Invalid client_secret format', field: 'client_secret' };
    }

    // Dropbox client IDs and secrets are typically longer strings
    if (clientId.length > 100 || clientSecret.length > 100) {
      return { valid: false, error: 'Credential length exceeds expected format', field: 'credentials' };
    }

    // Check for common invalid patterns
    if (clientId.includes(' ') || clientSecret.includes(' ')) {
      return { valid: false, error: 'OAuth credentials cannot contain spaces', field: 'credentials' };
    }

    return { valid: true };
  }

  /**
   * Get Dropbox service information
   * @param {any} credentials - Validated credentials
   * @returns {Object} Service information
   */
  getServiceInfo(credentials) {
    return {
      service: 'Dropbox OAuth',
      auth_type: 'oauth',
      client_id: credentials.client_id,
      validation_type: 'format_validation',
      note: 'Format validation passed. OAuth flow required for full access.',
      permissions: ['account_info.read', 'files.metadata.write', 'files.content.write', 'sharing.write'],
    };
  }
}

/**
 * Dropbox API Key validator (legacy support)
 */
class DropboxAPIKeyValidator extends BaseValidator {
  constructor() {
    super('dropbox', 'api_key');
  }

  /**
   * Validate Dropbox API key format
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

    // Dropbox API keys (legacy) are typically longer strings
    if (credentials.api_key.length < 32 || credentials.api_key.length > 128) {
      return createValidationResult(false, 'Dropbox API key length appears invalid', 'api_key');
    }

    // Check for common invalid patterns
    if (credentials.api_key.includes(' ')) {
      return createValidationResult(false, 'API key cannot contain spaces', 'api_key');
    }

    return createValidationResult(true, null, null, this.getServiceInfo(credentials));
  }

  /**
   * Get Dropbox API service information
   * @param {any} _credentials - Validated credentials
   * @returns {Object} Service information
   */
  getServiceInfo(_credentials) {
    return {
      service: 'Dropbox API',
      auth_type: 'api_key',
      validation_type: 'format_validation',
      note: 'OAuth2 validation required for full access',
      permissions: ['read', 'write', 'share'],
    };
  }
}

/**
 * Dropbox validator factory - determines which validator to use based on credentials
 * @param {any} credentials - Credentials to validate
 * @returns {BaseValidator} Appropriate validator instance
 */
function createDropboxValidator(credentials) {
  if (credentials && credentials.client_id && credentials.client_secret) {
    return new DropboxOAuthValidator();
  } else if (credentials && credentials.api_key) {
    return new DropboxAPIKeyValidator();
  } else {
    throw new Error('Invalid Dropbox credentials format - must provide either OAuth credentials (client_id, client_secret) or API key');
  }
}

export default createDropboxValidator;