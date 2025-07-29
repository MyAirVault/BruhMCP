export type ValidationResult = {
    /**
     * - Whether credentials are valid
     */
    valid: boolean;
    /**
     * - Error message if validation failed
     */
    error: string | null;
    /**
     * - Field that caused validation failure
     */
    field: string | null;
    /**
     * - Service information if validation succeeded
     */
    service_info: Object | null;
};
/**
 * Base validation interface that all service validators should implement
 */
export class BaseValidator {
    /**
     * @param {string} serviceName - Name of the service (gmail, figma, github, etc.)
     * @param {string} authType - Type of authentication (api_key, oauth, bearer_token, etc.)
     */
    constructor(serviceName: string, authType: string);
    serviceName: string;
    authType: string;
    /**
     * Validate credential format - must be implemented by each service
     * @param {Object} _credentials - Credentials to validate
     * @returns {Promise<ValidationResult>} Validation result
     */
    validateFormat(_credentials: Object): Promise<ValidationResult>;
    /**
     * Test credentials against actual API (optional, for API key validation)
     * @param {Object} credentials - Credentials to test
     * @returns {Promise<ValidationResult>} Validation result
     */
    testCredentials(credentials: Object): Promise<ValidationResult>;
    /**
     * Get service information for successful validation
     * @param {Object} _credentials - Validated credentials
     * @returns {Object} Service information
     */
    getServiceInfo(_credentials: Object): Object;
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
export function createValidationResult(valid: boolean, error?: string | null, field?: string | null, service_info?: Object | null): ValidationResult;
//# sourceMappingURL=baseValidator.d.ts.map