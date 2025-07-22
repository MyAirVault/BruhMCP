/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether credentials are valid
 * @property {Object|null} api_info - Service information if validation succeeded
 * @property {string|null} error_code - Error code if validation failed
 * @property {string|null} error_message - Error message if validation failed
 * @property {Object|null} details - Additional error details
 */
/**
 * Test API credentials using the modular validation system
 * @param {string} serviceName - Service name (gmail, figma, github, etc.)
 * @param {Object} credentials - Credentials to test
 * @param {boolean} performApiTest - Whether to perform actual API test (default: format validation only)
 * @returns {Promise<ValidationResult>} Validation result
 */
export function testAPICredentials(serviceName: string, credentials: Object, performApiTest?: boolean): Promise<ValidationResult>;
/**
 * @typedef {Object} ValidationError
 * @property {string[]} path - Path to the error
 * @property {string} message - Error message
 */
/**
 * @typedef {Object} ParseResult
 * @property {boolean} success - Whether parsing succeeded
 * @property {{errors: ValidationError[]}} [error] - Validation errors if parsing failed
 * @property {Object} [data] - Parsed data if parsing succeeded
 */
/**
 * @typedef {Object} CredentialSchema
 * @property {function(Object): ParseResult} safeParse - Function to safely parse credentials
 */
/**
 * Get credential schema by MCP type ID
 * @param {string} _mcpTypeId - MCP type ID
 * @returns {CredentialSchema} Credential schema
 */
export function getCredentialSchemaByType(_mcpTypeId: string): CredentialSchema;
export type ValidationResult = {
    /**
     * - Whether credentials are valid
     */
    valid: boolean;
    /**
     * - Service information if validation succeeded
     */
    api_info: Object | null;
    /**
     * - Error code if validation failed
     */
    error_code: string | null;
    /**
     * - Error message if validation failed
     */
    error_message: string | null;
    /**
     * - Additional error details
     */
    details: Object | null;
};
export type ValidationError = {
    /**
     * - Path to the error
     */
    path: string[];
    /**
     * - Error message
     */
    message: string;
};
export type ParseResult = {
    /**
     * - Whether parsing succeeded
     */
    success: boolean;
    /**
     * - Validation errors if parsing failed
     */
    error?: {
        errors: ValidationError[];
    } | undefined;
    /**
     * - Parsed data if parsing succeeded
     */
    data?: Object | undefined;
};
export type CredentialSchema = {
    /**
     * - Function to safely parse credentials
     */
    safeParse: (arg0: Object) => ParseResult;
};
//# sourceMappingURL=credentialValidationService.d.ts.map