/**
 * Enhanced credential validation service for instance updates
 * Builds on existing credentialValidationService with instance-specific logic
 */
/**
 * Validate credentials for a specific service instance
 * @param {string} serviceName - Service name (figma, github, etc.)
 * @param {Object} credentials - Credentials to validate
 * @returns {Promise<Object>} Validation result with detailed feedback
 */
export function validateCredentialsForService(serviceName: string, credentials: Object): Promise<Object>;
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
 * @param {Object} credentials - Credentials to validate
 * @returns {Promise<Object>} Validation result with format validation
 */
export function validateCredentialsWithFormat(serviceName: string, credentials: Object): Promise<Object>;
/**
 * Test credential connectivity without full validation
 * Useful for quick health checks
 * @param {string} serviceName - Service name
 * @param {Object} credentials - Credentials to test
 * @returns {Promise<Object>} Basic connectivity result
 */
export function testCredentialConnectivity(serviceName: string, credentials: Object): Promise<Object>;
//# sourceMappingURL=instanceCredentialValidationService.d.ts.map