/**
 * Validate OAuth credentials format for a specific provider
 * @param {string} provider - OAuth provider name
 * @param {string} clientId - OAuth client ID
 * @param {string} clientSecret - OAuth client secret
 * @returns {Object} Validation result
 */
export function validateCredentialFormat(provider: string, clientId: string, clientSecret: string): Object;
/**
 * Generate secure state parameter for OAuth flow
 * @param {string} instanceId - Instance ID to embed in state
 * @returns {string} Base64 encoded state parameter
 */
export function generateSecureState(instanceId: string): string;
/**
 * Validate and parse state parameter
 * @param {string} state - Base64 encoded state parameter
 * @returns {Object} Parsed state data
 */
export function validateAndParseState(state: string): Object;
/**
 * Validate OAuth scopes format
 * @param {Array} scopes - Array of OAuth scopes
 * @returns {Object} Validation result
 */
export function validateScopes(scopes: any[]): Object;
/**
 * Validate redirect URI format
 * @param {string} redirectUri - OAuth redirect URI
 * @returns {Object} Validation result
 */
export function validateRedirectUri(redirectUri: string): Object;
/**
 * Sanitize OAuth parameters to prevent injection attacks
 * @param {Object} params - OAuth parameters
 * @returns {Object} Sanitized parameters
 */
export function sanitizeOAuthParams(params: Object): Object;
/**
 * Generate secure random string for OAuth operations
 * @param {number} length - Length of random string
 * @returns {string} Random string
 */
export function generateSecureRandom(length?: number): string;
/**
 * Hash sensitive data for logging
 * @param {string} data - Data to hash
 * @returns {string} Hashed data
 */
export function hashForLogging(data: string): string;
//# sourceMappingURL=validation.d.ts.map