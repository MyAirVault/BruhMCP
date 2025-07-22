/**
 * Validate OAuth 2.0 credentials for Google Sheets
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
 * Validate Google Sheets scopes
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
export default createGoogleSheetsValidator;
/**
 * Google Sheets validator factory
 * @param {any} credentials - Credentials to validate
 * @returns {BaseValidator} Validator instance
 */
declare function createGoogleSheetsValidator(credentials: any): BaseValidator;
import { BaseValidator } from '../../../services/validation/base-validator.js';
//# sourceMappingURL=credential-validator.d.ts.map