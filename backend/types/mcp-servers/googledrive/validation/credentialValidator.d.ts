/**
 * OAuth credentials interface
 * @typedef {Object} OAuthCredentials
 * @property {string} clientId - OAuth Client ID
 * @property {string} clientSecret - OAuth Client Secret
 * @property {string} [refreshToken] - OAuth Refresh Token (optional)
 * @property {string} [accessToken] - OAuth Access Token (optional)
 */
/**
 * Validation result interface
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {string} [error] - Error message if validation failed
 * @property {string} [message] - Success message if validation passed
 * @property {Object} [details] - Additional validation details
 */
/**
 * Token validation result interface
 * @typedef {Object} TokenValidationResult
 * @property {boolean} valid - Whether token is valid
 * @property {Object} [details] - Token validation details
 */
/**
 * Validate OAuth 2.0 credentials for Google Drive
 * @param {OAuthCredentials} credentials - OAuth credentials to validate
 * @returns {Promise<ValidationResult>} Validation result
 */
export function validateCredentials(credentials: OAuthCredentials): Promise<ValidationResult>;
/**
 * Validate OAuth access token format
 * @param {string} accessToken - Access token to validate
 * @returns {TokenValidationResult} Validation result
 */
export function validateAccessToken(accessToken: string): TokenValidationResult;
/**
 * Validate OAuth refresh token format
 * @param {string} refreshToken - Refresh token to validate
 * @returns {TokenValidationResult} Validation result
 */
export function validateRefreshToken(refreshToken: string): TokenValidationResult;
/**
 * Validate Google Drive scopes
 * @param {string[]} scopes - Array of OAuth scopes
 * @returns {ValidationResult} Validation result
 */
export function validateScopes(scopes: string[]): ValidationResult;
/**
 * Instance configuration interface
 * @typedef {Object} InstanceConfig
 * @property {string} instanceId - Instance UUID
 * @property {string} userId - User UUID
 * @property {string} serviceName - Service name
 * @property {OAuthCredentials} credentials - OAuth credentials
 */
/**
 * Validate instance configuration
 * @param {InstanceConfig} config - Instance configuration
 * @returns {ValidationResult} Validation result
 */
export function validateInstanceConfig(config: InstanceConfig): ValidationResult;
export default createGoogleDriveValidator;
/**
 * OAuth credentials interface
 */
export type OAuthCredentials = {
    /**
     * - OAuth Client ID
     */
    clientId: string;
    /**
     * - OAuth Client Secret
     */
    clientSecret: string;
    /**
     * - OAuth Refresh Token (optional)
     */
    refreshToken?: string | undefined;
    /**
     * - OAuth Access Token (optional)
     */
    accessToken?: string | undefined;
};
/**
 * Validation result interface
 */
export type ValidationResult = {
    /**
     * - Whether validation passed
     */
    valid: boolean;
    /**
     * - Error message if validation failed
     */
    error?: string | undefined;
    /**
     * - Success message if validation passed
     */
    message?: string | undefined;
    /**
     * - Additional validation details
     */
    details?: Object | undefined;
};
/**
 * Token validation result interface
 */
export type TokenValidationResult = {
    /**
     * - Whether token is valid
     */
    valid: boolean;
    /**
     * - Token validation details
     */
    details?: Object | undefined;
};
/**
 * Instance configuration interface
 */
export type InstanceConfig = {
    /**
     * - Instance UUID
     */
    instanceId: string;
    /**
     * - User UUID
     */
    userId: string;
    /**
     * - Service name
     */
    serviceName: string;
    /**
     * - OAuth credentials
     */
    credentials: OAuthCredentials;
};
/**
 * Google Drive validator factory
 * @param {MixedCredentials} credentials - Credentials to validate
 * @returns {BaseValidator} Validator instance
 */
declare function createGoogleDriveValidator(credentials: {
    /**
     * - OAuth Client ID (camelCase)
     */
    clientId?: string | undefined;
    /**
     * - OAuth Client ID (snake_case)
     */
    client_id?: string | undefined;
    /**
     * - OAuth Client Secret (camelCase)
     */
    clientSecret?: string | undefined;
    /**
     * - OAuth Client Secret (snake_case)
     */
    client_secret?: string | undefined;
    /**
     * - OAuth Refresh Token (camelCase)
     */
    refreshToken?: string | undefined;
    /**
     * - OAuth Refresh Token (snake_case)
     */
    refresh_token?: string | undefined;
    /**
     * - OAuth Access Token (camelCase)
     */
    accessToken?: string | undefined;
    /**
     * - OAuth Access Token (snake_case)
     */
    access_token?: string | undefined;
}): BaseValidator;
import { BaseValidator } from '../../../services/validation/baseValidator.js';
//# sourceMappingURL=credentialValidator.d.ts.map