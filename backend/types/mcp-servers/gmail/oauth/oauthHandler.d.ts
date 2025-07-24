export default GmailOAuthHandler;
export type AuthCredentials = import("../../../services/mcp-auth-registry/types/authTypes.js").AuthCredentials;
export type OAuthFlowResult = import("../../../services/mcp-auth-registry/types/authTypes.js").OAuthFlowResult;
export type OAuthCallbackResult = import("../../../services/mcp-auth-registry/types/authTypes.js").OAuthCallbackResult;
/**
 * @typedef {import('../../../services/mcp-auth-registry/types/authTypes.js').AuthCredentials} AuthCredentials
 * @typedef {import('../../../services/mcp-auth-registry/types/authTypes.js').OAuthFlowResult} OAuthFlowResult
 * @typedef {import('../../../services/mcp-auth-registry/types/authTypes.js').OAuthCallbackResult} OAuthCallbackResult
 */
/**
 * Gmail OAuth Handler Class
 * Implements OAuth 2.0 flow for Gmail service
 */
declare class GmailOAuthHandler {
    redirectUri: string;
    scopes: string[];
    /**
     * Initiates OAuth flow for Gmail
     * @param {string} instanceId - MCP instance ID
     * @param {string} userId - User ID for authentication
     * @param {AuthCredentials} credentials - OAuth credentials (client_id, client_secret)
     * @returns {Promise<OAuthFlowResult>} OAuth flow result with auth URL
     */
    initiateFlow(instanceId: string, userId: string, credentials: AuthCredentials): Promise<OAuthFlowResult>;
    /**
     * Handles OAuth callback and exchanges code for tokens
     * @param {string} code - OAuth authorization code
     * @param {string} state - OAuth state parameter
     * @returns {Promise<OAuthCallbackResult>} Callback processing result
     */
    handleCallback(code: string, state: string): Promise<OAuthCallbackResult>;
    /**
     * Refreshes OAuth tokens
     * @param {string} refreshToken - Refresh token
     * @param {AuthCredentials} credentials - OAuth credentials
     * @returns {Promise<{access_token: string, refresh_token: string, expires_in: number}>} New tokens
     */
    refreshToken(refreshToken: string, credentials: AuthCredentials): Promise<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
    }>;
}
//# sourceMappingURL=oauthHandler.d.ts.map