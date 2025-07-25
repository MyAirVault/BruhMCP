/**
 * Credentials object for OAuth authentication
 * @typedef {Object} OAuthCredentials
 * @property {string} auth_type - Authentication type ('oauth' or 'api_key')
 * @property {string} [client_id] - OAuth client ID (required for oauth)
 * @property {string} [client_secret] - OAuth client secret (required for oauth)
 * @property {string} [access_token] - Access token (optional for oauth)
 * @property {string} [refresh_token] - Refresh token (optional for oauth)
 * @property {string} [api_key] - API key (required for api_key auth type)
 */
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
 * @param {OAuthCredentials} credentials - Credentials object
 * @returns {boolean} True if valid structure
 */
export function validateCredentialStructure(credentials: OAuthCredentials): boolean;
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
export default createNotionValidator;
/**
 * Credentials object for OAuth authentication
 */
export type OAuthCredentials = {
    /**
     * - Authentication type ('oauth' or 'api_key')
     */
    auth_type: string;
    /**
     * - OAuth client ID (required for oauth)
     */
    client_id?: string | undefined;
    /**
     * - OAuth client secret (required for oauth)
     */
    client_secret?: string | undefined;
    /**
     * - Access token (optional for oauth)
     */
    access_token?: string | undefined;
    /**
     * - Refresh token (optional for oauth)
     */
    refresh_token?: string | undefined;
    /**
     * - API key (required for api_key auth type)
     */
    api_key?: string | undefined;
};
/**
 * OAuth credentials for Notion validator
 */
export type NotionOAuthCredentials = {
    /**
     * - OAuth client ID
     */
    client_id: string;
    /**
     * - OAuth client secret
     */
    client_secret: string;
};
/**
 * Bearer token credentials for Notion validator
 */
export type NotionBearerTokenCredentials = {
    /**
     * - Bearer token
     */
    bearer_token?: string | undefined;
    /**
     * - Access token
     */
    access_token?: string | undefined;
    /**
     * - API key
     */
    api_key?: string | undefined;
};
/**
 * Notion validator factory
 * @param {OAuthCredentials|NotionBearerTokenCredentials} credentials - Credentials to validate
 * @returns {BaseValidator} Validator instance
 */
declare function createNotionValidator(credentials: OAuthCredentials | NotionBearerTokenCredentials): BaseValidator;
import { BaseValidator } from '../../../services/validation/baseValidator.js';
//# sourceMappingURL=credentialValidator.d.ts.map