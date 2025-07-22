/**
 * Enhanced credential validation service for instance updates
 * Builds on existing credentialValidationService with instance-specific logic
 */
/**
 * @typedef {Object} ServiceCredentials
 * @property {string} api_key - API key for the service
 */
/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether credentials are valid
 * @property {string} [message] - Success message
 * @property {string} [error] - Error message if validation failed
 * @property {string} [errorCode] - Error code for programmatic handling
 * @property {string} [service] - Service name
 * @property {Object} [userInfo] - User information from API
 * @property {string} [testEndpoint] - Endpoint used for testing
 * @property {string} [validatedAt] - ISO timestamp of validation
 * @property {Object} [details] - Additional details about the validation
 */
/**
 * @typedef {Object} FormatValidationResult
 * @property {boolean} isValid - Whether format is valid
 * @property {string} [error] - Error message if format is invalid
 * @property {string} [errorCode] - Error code for programmatic handling
 * @property {string} [service] - Service name
 * @property {Object} [details] - Additional details about the validation
 */
/**
 * @typedef {Object} ConnectivityResult
 * @property {boolean} connected - Whether connection was successful
 * @property {string} service - Service name
 * @property {string} message - Result message
 * @property {string|null} error - Error message if connection failed
 */
/**
 * Validate credentials for a specific service instance
 * @param {string} serviceName - Service name (figma, github, etc.)
 * @param {ServiceCredentials} credentials - Credentials to validate
 * @returns {Promise<ValidationResult>} Validation result with detailed feedback
 */
export function validateCredentialsForService(serviceName: string, credentials: ServiceCredentials): Promise<ValidationResult>;
/**
 * Validate Figma credentials specifically
 * @param {string} apiKey - Figma Personal Access Token
 * @returns {Promise<Object>} Validation result
 */
export function validateFigmaCredentials(apiKey: string): Promise<Object>;
/**
 * Validate GitHub credentials specifically
 * @param {string} apiKey - GitHub Personal Access Token
 * @returns {Promise<Object>} Validation result
 */
export function validateGithubCredentials(apiKey: string): Promise<Object>;
/**
 * Validate credentials with format checking
 * @param {string} serviceName - Service name
 * @param {ServiceCredentials} credentials - Credentials to validate
 * @returns {Promise<ValidationResult>} Validation result with format validation
 */
export function validateCredentialsWithFormat(serviceName: string, credentials: ServiceCredentials): Promise<ValidationResult>;
/**
 * Test credential connectivity without full validation
 * Useful for quick health checks
 * @param {string} serviceName - Service name
 * @param {ServiceCredentials} credentials - Credentials to test
 * @returns {Promise<ConnectivityResult>} Basic connectivity result
 */
export function testCredentialConnectivity(serviceName: string, credentials: ServiceCredentials): Promise<ConnectivityResult>;
export type ServiceCredentials = {
    /**
     * - API key for the service
     */
    api_key: string;
};
export type ValidationResult = {
    /**
     * - Whether credentials are valid
     */
    isValid: boolean;
    /**
     * - Success message
     */
    message?: string | undefined;
    /**
     * - Error message if validation failed
     */
    error?: string | undefined;
    /**
     * - Error code for programmatic handling
     */
    errorCode?: string | undefined;
    /**
     * - Service name
     */
    service?: string | undefined;
    /**
     * - User information from API
     */
    userInfo?: Object | undefined;
    /**
     * - Endpoint used for testing
     */
    testEndpoint?: string | undefined;
    /**
     * - ISO timestamp of validation
     */
    validatedAt?: string | undefined;
    /**
     * - Additional details about the validation
     */
    details?: Object | undefined;
};
export type FormatValidationResult = {
    /**
     * - Whether format is valid
     */
    isValid: boolean;
    /**
     * - Error message if format is invalid
     */
    error?: string | undefined;
    /**
     * - Error code for programmatic handling
     */
    errorCode?: string | undefined;
    /**
     * - Service name
     */
    service?: string | undefined;
    /**
     * - Additional details about the validation
     */
    details?: Object | undefined;
};
export type ConnectivityResult = {
    /**
     * - Whether connection was successful
     */
    connected: boolean;
    /**
     * - Service name
     */
    service: string;
    /**
     * - Result message
     */
    message: string;
    /**
     * - Error message if connection failed
     */
    error: string | null;
};
//# sourceMappingURL=instanceCredentialValidationService.d.ts.map