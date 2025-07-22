export const slackOAuth: SlackOAuth;
/**
 * Slack OAuth Provider class
 */
declare class SlackOAuth extends baseOAuth {
    constructor();
    authUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    revokeUrl: string;
    /**
     * Validate Slack OAuth credentials format
     * @param {string} clientId - Slack OAuth Client ID
     * @param {string} clientSecret - Slack OAuth Client Secret
     * @returns {Object} Validation result
     */
    validateCredentials(clientId: string, clientSecret: string): Object;
    /**
     * Generate Slack OAuth authorization URL
     * @param {Object} params - Authorization parameters
     * @param {string} params.client_id - Slack OAuth Client ID
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
     * @param {string} params.client_id - Slack OAuth Client ID
     * @param {string} params.client_secret - Slack OAuth Client Secret
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
     * Refresh Slack access token using refresh token
     * @param {Object} params - Refresh parameters
     * @param {string} params.refresh_token - Slack refresh token
     * @param {string} params.client_id - Slack OAuth Client ID
     * @param {string} params.client_secret - Slack OAuth Client Secret
     * @returns {Object} New token response
     */
    refreshAccessToken(params: {
        refresh_token: string;
        client_id: string;
        client_secret: string;
    }): Object;
    /**
     * Validate Slack token scopes
     * @param {Object} tokens - Token response
     * @returns {Object} Scope validation result
     */
    validateTokenScopes(tokens: Object): Object;
    /**
     * Get user information using access token
     * @param {string} accessToken - Slack access token
     * @param {string} userId - Slack user ID (optional, defaults to token owner)
     * @returns {Object} User information
     */
    getUserInfo(accessToken: string, userId?: string): Object;
    /**
     * Revoke Slack OAuth token
     * @param {string} token - Token to revoke
     * @returns {boolean} True if revocation was successful
     */
    revokeToken(token: string): boolean;
}
import { baseOAuth } from './base-oauth.js';
export {};
//# sourceMappingURL=slack.d.ts.map