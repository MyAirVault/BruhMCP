// @ts-check

/**
 * Base validation interface that all service validators should implement
 */
export class BaseValidator {
  /**
   * @param {string} serviceName - Name of the service (gmail, figma, github, etc.)
   * @param {string} authType - Type of authentication (api_key, oauth, bearer_token, etc.)
   */
  constructor(serviceName, authType) {
    this.serviceName = serviceName;
    this.authType = authType;
  }

  /**
   * Validate credential format - must be implemented by each service
   * @param {any} credentials - Credentials to validate
   * @returns {Promise<ValidationResult>} Validation result
   */
  async validateFormat(credentials) {
    throw new Error(`validateFormat must be implemented by ${this.serviceName} validator`);
  }

  /**
   * Test credentials against actual API (optional, for API key validation)
   * @param {any} credentials - Credentials to test
   * @returns {Promise<ValidationResult>} Validation result
   */
  async testCredentials(credentials) {
    // Default implementation - return format validation result
    return await this.validateFormat(credentials);
  }

  /**
   * Get service information for successful validation
   * @param {any} credentials - Validated credentials
   * @returns {Object} Service information
   */
  getServiceInfo(credentials) {
    return {
      service: this.serviceName,
      auth_type: this.authType,
      validation_type: 'format_validation',
      permissions: [],
    };
  }
}

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether credentials are valid
 * @property {string|null} error - Error message if validation failed
 * @property {string|null} field - Field that caused validation failure
 * @property {Object|null} service_info - Service information if validation succeeded
 */

/**
 * Create a validation result object
 * @param {boolean} valid - Whether validation passed
 * @param {string|null} error - Error message if validation failed
 * @param {string|null} field - Field that caused validation failure
 * @param {Object|null} service_info - Service information if validation succeeded
 * @returns {ValidationResult} Validation result
 */
export function createValidationResult(valid, error = null, field = null, service_info = null) {
  return {
    valid,
    error,
    field,
    service_info,
  };
}