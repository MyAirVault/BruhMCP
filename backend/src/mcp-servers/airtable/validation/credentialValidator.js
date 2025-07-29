// @ts-check
const { BaseValidator, createValidationResult  } = require('../../../services/validation/baseValidator.js');
const { axiosGet } = require('../../../utils/axiosUtils.js');

/**
 * Airtable API key validator
 */
class AirtableAPIKeyValidator extends BaseValidator {
  constructor() {
    super('airtable', 'api_key');
  }

  /**
   * Validate Airtable API key format
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

    // Airtable Personal Access Tokens start with 'pat'
    if (!credentials.api_key.startsWith('pat')) {
      return createValidationResult(false, 'Invalid Airtable API key format - must start with "pat"', 'api_key');
    }

    // Basic length validation for PATs
    if (credentials.api_key.length < 40 || credentials.api_key.length > 100) {
      return createValidationResult(false, 'Airtable API key length appears invalid', 'api_key');
    }

    return createValidationResult(true, null, null, this.getServiceInfo(credentials));
  }

  /**
   * Test Airtable API key against actual API
   * @param {any} credentials - Credentials to test
   * @returns {Promise<import('../../../services/validation/baseValidator.js').ValidationResult>} Validation result
   */
  async testCredentials(credentials) {
    // First validate format
    const formatResult = await this.validateFormat(credentials);
    if (!formatResult.valid) {
      return formatResult;
    }

    try {
      const response = await axiosGet('https://api.airtable.com/v0/meta/bases', {
        headers: {
          'Authorization': `Bearer ${credentials.api_key}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        console.log('✅ Airtable API validation successful:', { basesCount: data.bases?.length || 0 });
        return createValidationResult(true, null, null, {
          service: 'Airtable API',
          auth_type: 'api_key',
          bases_count: data.bases?.length || 0,
          validation_type: 'api_test',
          permissions: ['read', 'write'],
        });
      } else {
        console.log('❌ Airtable API validation failed:', response.status, response.statusText);
        return createValidationResult(false, 'Invalid Airtable API token - API test failed', 'api_key');
      }
    } catch (/** @type {any} */ error) {
      return createValidationResult(false, `Failed to test Airtable API token: ${error.message}`, 'api_key');
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

module.exports = createAirtableValidator;