// @ts-check
import { BaseValidator, createValidationResult } from '../../../services/validation/base-validator.js';
import fetch from 'node-fetch';

/**
 * Airtable API key validator - simplified version
 */
class AirtableAPIKeyValidator extends BaseValidator {
  constructor() {
    super('airtable', 'api_key');
  }

  /**
   * Validate Airtable API key format - minimal validation
   * @param {any} credentials - Credentials to validate
   * @returns {Promise<import('../../../services/validation/base-validator.js').ValidationResult>} Validation result
   */
  async validateFormat(credentials) {
    if (!credentials || typeof credentials !== 'object') {
      return createValidationResult(false, 'Credentials must be a valid object', 'credentials');
    }

    // Check for api_key or apiKey
    const apiKey = credentials.api_key || credentials.apiKey;
    
    if (!apiKey) {
      return createValidationResult(false, 'API key is required', 'api_key');
    }

    // Skip format validation - just check if it's a non-empty string
    if (typeof apiKey !== 'string' || apiKey.trim() === '') {
      return createValidationResult(false, 'API key must be a non-empty string', 'api_key');
    }

    return createValidationResult(true, null, null, this.getServiceInfo(credentials));
  }

  /**
   * Test Airtable API key against actual API
   * @param {any} credentials - Credentials to test
   * @returns {Promise<import('../../../services/validation/base-validator.js').ValidationResult>} Validation result
   */
  async testCredentials(credentials) {
    // First validate basic format
    const formatResult = await this.validateFormat(credentials);
    if (!formatResult.valid) {
      return formatResult;
    }

    const apiKey = credentials.api_key || credentials.apiKey;

    try {
      const response = await fetch('https://api.airtable.com/v0/meta/bases', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = /** @type {any} */ (await response.json());
        return createValidationResult(true, null, null, {
          service: 'Airtable API',
          auth_type: 'api_key',
          validation_type: 'api_test',
          bases_count: data.bases?.length || 0,
          permissions: ['read', 'write'],
        });
      } else if (response.status === 401) {
        return createValidationResult(false, 'Invalid API key - authentication failed', 'api_key');
      } else {
        return createValidationResult(false, `API test failed with status: ${response.status}`, 'api_key');
      }
    } catch (/** @type {any} */ error) {
      return createValidationResult(false, `Failed to test Airtable API key: ${error.message}`, 'api_key');
    }
  }

  /**
   * Get Airtable service information
   * @param {any} _credentials - Validated credentials
   * @returns {Object} Service information
   */
  getServiceInfo(_credentials) {
    return {
      service: 'Airtable API',
      auth_type: 'api_key',
      validation_type: 'format_validation',
      permissions: ['read', 'write'],
    };
  }
}

/**
 * Airtable validator factory
 * @param {any} credentials - Credentials to validate
 * @returns {BaseValidator} Validator instance
 */
function createAirtableValidator(credentials) {
  if (credentials && (credentials.api_key || credentials.apiKey)) {
    return new AirtableAPIKeyValidator();
  } else {
    throw new Error('Invalid Airtable credentials format - must provide api_key or apiKey');
  }
}

export default createAirtableValidator;