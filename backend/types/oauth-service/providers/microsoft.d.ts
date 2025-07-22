export const microsoftOAuth: MicrosoftOAuth;
/**
 * Microsoft OAuth Provider class
 */
declare class MicrosoftOAuth extends baseOAuth {
    constructor();
    authUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    revokeUrl: string;
    /**
     * Validate Microsoft OAuth credentials format
     * @param {string} clientId - Microsoft OAuth Client ID
     * @param {string} clientSecret - Microsoft OAuth Client Secret
     * @returns {Object} Validation result
     */
    validateCredentials(clientId: string, clientSecret: string): Object;
    /**
     * Generate Microsoft OAuth authorization URL
     * @param {Object} params - Authorization parameters
     * @param {string} params.client_id - Microsoft OAuth Client ID
     * @param {Array} params.scopes - Required OAuth scopes
     * @param {string} params.state - State parameter for security
     * @param {string} params.redirect_uri - Redirect URI after authorization
     * @returns {string} Authorization URL
     */
    generateAuthorizationUrl(params: {
        client_id: string;
        scopes: any[];
        state: string;
        redirect_uri: string;
    }): string;
    /**
     * Exchange authorization code for tokens
     * @param {Object} params - Exchange parameters
     * @param {string} params.code - Authorization code from callback
     * @param {string} params.client_id - Microsoft OAuth Client ID
     * @param {string} params.client_secret - Microsoft OAuth Client Secret
     * @param {string} params.redirect_uri - Redirect URI used in authorization
     * @returns {Object} Token response
     */
    exchangeAuthorizationCode(params: {
        code: string;
        client_id: string;
        client_secret: string;
        redirect_uri: string;
    }): Object;
    /**
     * Refresh Microsoft access token using refresh token
     * @param {Object} params - Refresh parameters
     * @param {string} params.refresh_token - Microsoft refresh token
     * @param {string} params.client_id - Microsoft OAuth Client ID
     * @param {string} params.client_secret - Microsoft OAuth Client Secret
     * @returns {Object} New token response
     */
    refreshAccessToken(params: {
        refresh_token: string;
        client_id: string;
        client_secret: string;
    }): Object;
    /**
     * Validate Microsoft token scopes
     * @param {Object} tokens - Token response
     * @returns {Object} Scope validation result
     */
    validateTokenScopes(tokens: Object): Object;
    /**
     * Get user information using access token
     * @param {string} accessToken - Microsoft access token
     * @returns {Object} User information
     */
    getUserInfo(accessToken: string): Object;
    /**
     * Revoke Microsoft OAuth token
     * @param {string} token - Token to revoke (access or refresh token)
     * @returns {boolean} True if revocation was successful
     */
    revokeToken(token: string): boolean;
}
import { baseOAuth } from './base-oauth.js';
export {};
//# sourceMappingURL=microsoft.d.ts.map