/**
 * Validate Notion Bearer token by making a test request
 * @param {string} bearerToken - OAuth Bearer token to validate
 * @returns {Promise<{valid: boolean, error?: string, user?: Object}>} Validation result
 */
export function validateNotionBearerToken(bearerToken: string): Promise<{
    valid: boolean;
    error?: string;
    user?: Object;
}>;
/**
 * Validate instance credentials structure
 * @param {Object} credentials - Credentials object
 * @returns {boolean} True if valid structure
 */
export function validateCredentialStructure(credentials: Object): boolean;
/**
 * Extract OAuth credentials from credentials object
 * @param {Object} credentials - Credentials object
 * @returns {Object|null} OAuth credentials or null if not found
 */
export function extractOAuthCredentials(credentials: Object): Object | null;
/**
 * Validate credentials and extract OAuth info
 * @param {Object} credentials - Credentials object
 * @returns {Promise<{valid: boolean, oauthCredentials?: Object, error?: string}>} Validation result
 */
export function validateAndExtractCredentials(credentials: Object): Promise<{
    valid: boolean;
    oauthCredentials?: Object;
    error?: string;
}>;
/**
 * Create a validator instance for the validation registry
 * @param {Object} credentials - Credentials to validate
 * @returns {Object} Validator instance with validateFormat and testCredentials methods
 */
export default function createNotionValidator(credentials: Object): Object;
//# sourceMappingURL=credential-validator.d.ts.map