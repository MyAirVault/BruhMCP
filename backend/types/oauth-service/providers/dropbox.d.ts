export const dropboxOAuth: DropboxOAuth;
/**
 * Dropbox OAuth Provider class
 */
declare class DropboxOAuth extends baseOAuth {
    constructor();
    authUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    revokeUrl: string;
    /**
     * Generate Dropbox OAuth authorization URL
     * @param {Object} params - Authorization parameters
     * @param {string} params.client_id - Dropbox OAuth Client ID
     * @param {Array} params.scopes - Required OAuth scopes (not used by Dropbox)
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
     * @param {string} params.client_id - Dropbox OAuth Client ID
     * @param {string} params.client_secret - Dropbox OAuth Client Secret
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
     * Refresh Dropbox access token using refresh token
     * @param {Object} params - Refresh parameters
     * @param {string} params.refresh_token - Dropbox refresh token
     * @param {string} params.client_id - Dropbox OAuth Client ID
     * @param {string} params.client_secret - Dropbox OAuth Client Secret
     * @returns {Object} New token response
     */
    refreshAccessToken(params: {
        refresh_token: string;
        client_id: string;
        client_secret: string;
    }): Object;
}
import { baseOAuth } from './base-oauth.js';
export {};
//# sourceMappingURL=dropbox.d.ts.map