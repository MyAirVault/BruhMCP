export const oauthManager: OAuthManager;
/**
 * OAuth Manager class for handling OAuth flows
 */
declare class OAuthManager {
    providers: {
        google: {
            authUrl: string;
            tokenUrl: string;
            userInfoUrl: string;
            tokenInfoUrl: string;
            revokeUrl: string;
            validateCredentials(clientId: string, clientSecret: string): Object;
            generateAuthorizationUrl(params: {
                client_id: string;
                scopes: any[];
                state: string;
                redirect_uri: string;
            }): string;
            exchangeAuthorizationCode(params: {
                code: string;
                client_id: string;
                client_secret: string;
                redirect_uri: string;
            }): Object;
            refreshAccessToken(params: {
                refresh_token: string;
                client_id: string;
                client_secret: string;
            }): Object;
            validateTokenScopes(tokens: Object): Object;
            getUserInfo(accessToken: string): Object;
            revokeToken(token: string): boolean;
            providerName: any;
            handleApiResponse(response: Response, operation: string): Object;
            validateRequiredParams(params: Object, required: any[]): void;
            validateTokenResponse(tokens: Object): Object;
            getProviderName(): string;
            getProviderUrls(): Object;
        };
        microsoft: {
            authUrl: string;
            tokenUrl: string;
            userInfoUrl: string;
            revokeUrl: string;
            validateCredentials(clientId: string, clientSecret: string): Object;
            generateAuthorizationUrl(params: {
                client_id: string;
                scopes: any[];
                state: string;
                redirect_uri: string;
            }): string;
            exchangeAuthorizationCode(params: {
                code: string;
                client_id: string;
                client_secret: string;
                redirect_uri: string;
            }): Object;
            refreshAccessToken(params: {
                refresh_token: string;
                client_id: string;
                client_secret: string;
            }): Object;
            validateTokenScopes(tokens: Object): Object;
            getUserInfo(accessToken: string): Object;
            revokeToken(token: string): boolean;
            providerName: any;
            handleApiResponse(response: Response, operation: string): Object;
            validateRequiredParams(params: Object, required: any[]): void;
            validateTokenResponse(tokens: Object): Object;
            getProviderName(): string;
            getProviderUrls(): Object;
        };
        notion: {
            authUrl: string;
            tokenUrl: string;
            userInfoUrl: string;
            revokeUrl: any;
            validateCredentials(clientId: string, clientSecret: string): Object;
            generateAuthorizationUrl(params: {
                client_id: string;
                scopes: any[];
                state: string;
                redirect_uri: string;
            }): string;
            exchangeAuthorizationCode(params: {
                code: string;
                client_id: string;
                client_secret: string;
                redirect_uri: string;
            }): Object;
            refreshAccessToken(params: Object): Object;
            validateTokenScopes(tokens: Object): Object;
            getUserInfo(accessToken: string): Object;
            revokeToken(token: string): boolean;
            providerName: any;
            handleApiResponse(response: Response, operation: string): Object;
            validateRequiredParams(params: Object, required: any[]): void;
            validateTokenResponse(tokens: Object): Object;
            getProviderName(): string;
            getProviderUrls(): Object;
        };
        slack: {
            authUrl: string;
            tokenUrl: string;
            userInfoUrl: string;
            revokeUrl: string;
            validateCredentials(clientId: string, clientSecret: string): Object;
            generateAuthorizationUrl(params: {
                client_id: string;
                scopes: any[];
                state: string;
                redirect_uri: string;
            }): string;
            exchangeAuthorizationCode(params: {
                code: string;
                client_id: string;
                client_secret: string;
                redirect_uri: string;
            }): Object;
            refreshAccessToken(params: {
                refresh_token: string;
                client_id: string;
                client_secret: string;
            }): Object;
            validateTokenScopes(tokens: Object): Object;
            getUserInfo(accessToken: string, userId?: string): Object;
            revokeToken(token: string): boolean;
            providerName: any;
            handleApiResponse(response: Response, operation: string): Object;
            validateRequiredParams(params: Object, required: any[]): void;
            validateTokenResponse(tokens: Object): Object;
            getProviderName(): string;
            getProviderUrls(): Object;
        };
        discord: {
            authUrl: string;
            tokenUrl: string;
            userInfoUrl: string;
            revokeUrl: string;
            validateCredentials(clientId: string, clientSecret: string): Object;
            generateAuthorizationUrl(params: {
                client_id: string;
                scopes: any[];
                state: string;
                redirect_uri: string;
            }): string;
            exchangeAuthorizationCode(params: {
                code: string;
                client_id: string;
                client_secret: string;
                redirect_uri: string;
            }): Object;
            refreshAccessToken(params: {
                refresh_token: string;
                client_id: string;
                client_secret: string;
            }): Object;
            validateTokenScopes(tokens: Object): Object;
            getUserInfo(accessToken: string): Object;
            revokeToken(token: string): boolean;
            providerName: any;
            handleApiResponse(response: Response, operation: string): Object;
            validateRequiredParams(params: Object, required: any[]): void;
            validateTokenResponse(tokens: Object): Object;
            getProviderName(): string;
            getProviderUrls(): Object;
        };
        reddit: {
            authUrl: string;
            tokenUrl: string;
            userInfoUrl: string;
            revokeUrl: string;
            validateCredentials(clientId: string, clientSecret: string): Object;
            generateAuthorizationUrl(params: {
                client_id: string;
                scopes: any[];
                state: string;
                redirect_uri: string;
            }): string;
            exchangeAuthorizationCode(params: {
                code: string;
                client_id: string;
                client_secret: string;
                redirect_uri: string;
            }): Object;
            refreshAccessToken(params: {
                refresh_token: string;
                client_id: string;
                client_secret: string;
            }): Object;
            validateTokenScopes(tokens: Object): Object;
            getUserInfo(accessToken: string): Object;
            revokeToken(token: string): boolean;
            providerName: any;
            handleApiResponse(response: Response, operation: string): Object;
            validateRequiredParams(params: Object, required: any[]): void;
            validateTokenResponse(tokens: Object): Object;
            getProviderName(): string;
            getProviderUrls(): Object;
        };
        github: {
            authUrl: string;
            tokenUrl: string;
            userInfoUrl: string;
            revokeUrl: string;
            validateCredentials(clientId: string, clientSecret: string): Object;
            generateAuthorizationUrl(params: {
                client_id: string;
                scopes: any[];
                state: string;
                redirect_uri: string;
            }): string;
            exchangeAuthorizationCode(params: {
                code: string;
                client_id: string;
                client_secret: string;
                redirect_uri: string;
            }): Object;
            refreshAccessToken(params: Object): Object;
            validateTokenScopes(tokens: Object): Object;
            getUserInfo(accessToken: string): Object;
            revokeToken(token: string): boolean;
            providerName: any;
            handleApiResponse(response: Response, operation: string): Object;
            validateRequiredParams(params: Object, required: any[]): void;
            validateTokenResponse(tokens: Object): Object;
            getProviderName(): string;
            getProviderUrls(): Object;
        };
        dropbox: {
            authUrl: string;
            tokenUrl: string;
            userInfoUrl: string;
            revokeUrl: string;
            validateCredentials(clientId: string, clientSecret: string): Object;
            generateAuthorizationUrl(params: {
                client_id: string;
                scopes: any[];
                state: string;
                redirect_uri: string;
            }): string;
            exchangeAuthorizationCode(params: {
                code: string;
                client_id: string;
                client_secret: string;
                redirect_uri: string;
            }): Object;
            refreshAccessToken(params: {
                refresh_token: string;
                client_id: string;
                client_secret: string;
            }): Object;
            validateTokenScopes(tokens: Object): Object;
            getUserInfo(accessToken: string): Object;
            revokeToken(token: string): boolean;
            providerName: any;
            handleApiResponse(response: Response, operation: string): Object;
            validateRequiredParams(params: Object, required: any[]): void;
            validateTokenResponse(tokens: Object): Object;
            getProviderName(): string;
            getProviderUrls(): Object;
        };
    };
    tempCredentials: Map<any, any>;
    cleanupInterval: NodeJS.Timeout;
    /**
     * Generate OAuth authorization URL
     * @param {Object} params - OAuth parameters
     * @param {string} params.provider - OAuth provider name
     * @param {string} params.client_id - OAuth client ID
     * @param {string} params.client_secret - OAuth client secret
     * @param {string} params.instance_id - Instance ID to include in state
     * @param {Array} params.scopes - Required OAuth scopes
     * @returns {string} Authorization URL
     */
    generateAuthorizationUrl(params: {
        provider: string;
        client_id: string;
        client_secret: string;
        instance_id: string;
        scopes: any[];
    }): string;
    /**
     * Handle OAuth callback
     * @param {Object} params - Callback parameters
     * @param {string} params.provider - OAuth provider name
     * @param {string} params.code - Authorization code
     * @param {string} params.state - State parameter
     * @returns {Object} Token response
     */
    handleCallback(params: {
        provider: string;
        code: string;
        state: string;
    }): Object;
    /**
     * Get redirect URI for provider
     * @param {string} provider - OAuth provider name
     * @returns {string} Redirect URI
     */
    getRedirectUri(provider: string): string;
    /**
     * Validate state parameter and extract instance_id
     * @param {string} state - State parameter
     * @returns {Object} Extracted state data
     */
    validateState(state: string): Object;
    /**
     * Clean up expired credentials from temporary storage
     * Should be called periodically to prevent memory leaks
     */
    cleanupExpiredCredentials(): void;
    /**
     * Get credentials for a specific state (for debugging)
     * @param {string} state - State parameter
     * @returns {Object|null} Stored credentials or null if not found
     */
    getCredentialsForState(state: string): Object | null;
    /**
     * Get supported providers
     * @returns {Array} List of supported providers
     */
    getSupportedProviders(): any[];
    /**
     * Check if provider is supported
     * @param {string} provider - Provider name
     * @returns {boolean} Whether provider is supported
     */
    isProviderSupported(provider: string): boolean;
    /**
     * Destroy the OAuth manager and clean up resources
     */
    destroy(): void;
}
export {};
//# sourceMappingURL=oauth-manager.d.ts.map