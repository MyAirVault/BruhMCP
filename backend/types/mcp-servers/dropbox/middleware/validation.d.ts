/**
 * Request validation utilities for Dropbox OAuth endpoints
 * Handles parameter sanitization, format checking, and CSRF protection
 */
/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} True if valid UUID v4
 */
export function isValidUUID(uuid: string): boolean;
/**
 * Validate instance ID format
 * @param {string} instanceId - Instance ID to validate
 * @returns {boolean} True if valid instance ID
 */
export function validateInstanceId(instanceId: string): boolean;
/**
 * Validate OAuth credentials format
 * @param {Object} credentials - Credentials to validate
 * @param {string} credentials.clientId - OAuth client ID
 * @param {string} credentials.clientSecret - OAuth client secret
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateOAuthCredentials(credentials: {
    clientId: string;
    clientSecret: string;
}): {
    valid: boolean;
    error?: string;
};
/**
 * Validate OAuth state parameter for CSRF protection
 * @param {string} state - State parameter to validate
 * @returns {{valid: boolean, error?: string, data?: Object}} Validation result
 */
export function validateOAuthState(state: string): {
    valid: boolean;
    error?: string;
    data?: Object;
};
/**
 * Sanitize string input by removing potentially dangerous characters
 * @param {string} input - Input string to sanitize
 * @param {number} [maxLength=255] - Maximum allowed length
 * @returns {string} Sanitized string
 */
export function sanitizeString(input: string, maxLength?: number | undefined): string;
/**
 * Validate authorization code format
 * @param {string} code - Authorization code to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateAuthorizationCode(code: string): {
    valid: boolean;
    error?: string;
};
/**
 * Validate refresh token format
 * @param {string} refreshToken - Refresh token to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateRefreshToken(refreshToken: string): {
    valid: boolean;
    error?: string;
};
/**
 * Validate access token format
 * @param {string} accessToken - Access token to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateAccessToken(accessToken: string): {
    valid: boolean;
    error?: string;
};
//# sourceMappingURL=validation.d.ts.map