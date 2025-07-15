/**
 * Base OAuth Provider
 * Common functionality shared across all OAuth providers
 */
/**
 * Base OAuth Provider class
 */
export class baseOAuth {
    constructor(providerName: any);
    providerName: any;
    authUrl: any;
    tokenUrl: any;
    userInfoUrl: any;
    revokeUrl: any;
    /**
     * Validate OAuth credentials format (to be implemented by subclasses)
     * @param {string} clientId - OAuth Client ID
     * @param {string} clientSecret - OAuth Client Secret
     * @returns {Object} Validation result
     */
    validateCredentials(clientId: string, clientSecret: string): Object;
    /**
     * Generate OAuth authorization URL (to be implemented by subclasses)
     * @param {Object} params - Authorization parameters
     * @returns {string} Authorization URL
     */
    generateAuthorizationUrl(params: Object): string;
    /**
     * Exchange authorization code for tokens (to be implemented by subclasses)
     * @param {Object} params - Exchange parameters
     * @returns {Object} Token response
     */
    exchangeAuthorizationCode(params: Object): Object;
    /**
     * Refresh access token (to be implemented by subclasses)
     * @param {Object} params - Refresh parameters
     * @returns {Object} New token response
     */
    refreshAccessToken(params: Object): Object;
    /**
     * Validate token scopes (to be implemented by subclasses)
     * @param {Object} tokens - Token response
     * @returns {Object} Scope validation result
     */
    validateTokenScopes(tokens: Object): Object;
    /**
     * Get user information (to be implemented by subclasses)
     * @param {string} accessToken - Access token
     * @returns {Object} User information
     */
    getUserInfo(accessToken: string): Object;
    /**
     * Revoke OAuth token (to be implemented by subclasses)
     * @param {string} token - Token to revoke
     * @returns {boolean} True if revocation was successful
     */
    revokeToken(token: string): boolean;
    /**
     * Common error handler for OAuth API calls
     * @param {Response} response - Fetch response
     * @param {string} operation - Operation name for error context
     * @returns {Object} Parsed response or throws error
     */
    handleApiResponse(response: Response, operation: string): Object;
    /**
     * Common validation for required parameters
     * @param {Object} params - Parameters to validate
     * @param {Array} required - Required parameter names
     * @throws {Error} If required parameters are missing
     */
    validateRequiredParams(params: Object, required: any[]): void;
    /**
     * Common token validation
     * @param {Object} tokens - Token response
     * @returns {Object} Validation result
     */
    validateTokenResponse(tokens: Object): Object;
    /**
     * Get provider name
     * @returns {string} Provider name
     */
    getProviderName(): string;
    /**
     * Get provider URLs
     * @returns {Object} Provider URLs
     */
    getProviderUrls(): Object;
}
//# sourceMappingURL=base-oauth.d.ts.map