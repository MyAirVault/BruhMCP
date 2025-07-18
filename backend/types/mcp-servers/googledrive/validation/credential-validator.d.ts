/**
 * Validate OAuth 2.0 credentials for Google Drive
 * @param {Object} credentials - OAuth credentials to validate
 * @param {string} credentials.clientId - OAuth Client ID
 * @param {string} credentials.clientSecret - OAuth Client Secret
 * @param {string} credentials.refreshToken - OAuth Refresh Token (optional)
 * @param {string} credentials.accessToken - OAuth Access Token (optional)
 * @returns {Object} Validation result
 */
export function validateCredentials(credentials: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    accessToken: string;
}): Object;
/**
 * Validate OAuth access token format
 * @param {string} accessToken - Access token to validate
 * @returns {Object} Validation result
 */
export function validateAccessToken(accessToken: string): Object;
/**
 * Validate OAuth refresh token format
 * @param {string} refreshToken - Refresh token to validate
 * @returns {Object} Validation result
 */
export function validateRefreshToken(refreshToken: string): Object;
/**
 * Validate Google Drive scopes
 * @param {Array} scopes - Array of OAuth scopes
 * @returns {Object} Validation result
 */
export function validateScopes(scopes: any[]): Object;
/**
 * Validate instance configuration
 * @param {Object} config - Instance configuration
 * @returns {Object} Validation result
 */
export function validateInstanceConfig(config: Object): Object;
/**
 * Create a validator instance for the validation registry
 * @param {Object} credentials - Credentials to validate
 * @returns {Object} Validator instance with validateFormat and testCredentials methods
 */
export default function createGoogleDriveValidator(credentials: Object): Object;
//# sourceMappingURL=credential-validator.d.ts.map