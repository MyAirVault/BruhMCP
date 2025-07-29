// @ts-check
const { BaseValidator, createValidationResult } = require('../../../services/validation/baseValidator.js');
const { axiosGet } = require('../../../utils/axiosUtils.js');

/**
 * Figma API key validator
 */
class FigmaAPIKeyValidator extends BaseValidator {
  constructor() {
    super('figma', 'api_key');
  }

  /**
   * Validate Figma API key format
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

    // Figma API keys start with 'figd_'
    if (!credentials.api_key.startsWith('figd_')) {
      return createValidationResult(false, 'Invalid Figma API key format - must start with "figd_"', 'api_key');
    }

    // Basic length validation
    if (credentials.api_key.length < 40 || credentials.api_key.length > 100) {
      return createValidationResult(false, 'Figma API key length appears invalid', 'api_key');
    }

    return createValidationResult(true, null, null, this.getServiceInfo(credentials));
  }

  /**
   * Test Figma API key against actual API
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
      const response = await axiosGet('https://api.figma.com/v1/me', {
        headers: {
          'X-Figma-Token': credentials.api_key,
        },
      });

      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        console.log('✅ Figma API validation successful:', { userId: data.id, email: data.email });
        return createValidationResult(true, null, null, {
          service: 'Figma API',
          auth_type: 'api_key',
          user_id: data.id,
          email: data.email,
          handle: data.handle,
          validation_type: 'api_test',
          permissions: ['file_read', 'file_write'],
        });
      } else {
        console.log('❌ Figma API validation failed:', response.status, response.statusText);
        return createValidationResult(false, 'Invalid Figma API token - API test failed', 'api_key');
      }
    } catch (/** @type {any} */ error) {
      return createValidationResult(false, `Failed to test Figma API token: ${error.message}`, 'api_key');
    }
  }

  /**
   * Get Figma service information
   * @param {any} _credentials - Validated credentials
   * @returns {Object} Service information
   */
  getServiceInfo(_credentials) {
    return {
      service: 'Figma API',
      auth_type: 'api_key',
      validation_type: 'format_validation',
      permissions: ['file_read', 'file_write'],
    };
  }
}

/**
 * Figma validator factory
 * @param {any} credentials - Credentials to validate
 * @returns {BaseValidator} Validator instance
 */
function createFigmaValidator(credentials) {
  if (credentials && credentials.api_key) {
    return new FigmaAPIKeyValidator();
  } else {
    throw new Error('Invalid Figma credentials format - must provide API key');
  }
}

module.exports = createFigmaValidator;