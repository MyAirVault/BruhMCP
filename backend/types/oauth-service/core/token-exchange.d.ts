export const tokenExchange: TokenExchange;
/**
 * Token Exchange class for handling token operations
 */
declare class TokenExchange {
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
    /**
     * Exchange refresh token for new access token
     * @param {Object} params - Token exchange parameters
     * @param {string} params.provider - OAuth provider name
     * @param {string} params.refresh_token - Refresh token
     * @param {string} params.client_id - OAuth client ID
     * @param {string} params.client_secret - OAuth client secret
     * @returns {Object} New token response
     */
    exchangeRefreshToken(params: {
        provider: string;
        refresh_token: string;
        client_id: string;
        client_secret: string;
    }): Object;
    /**
     * Exchange credentials for new tokens (fallback method)
     * @param {Object} params - Credential exchange parameters
     * @param {string} params.provider - OAuth provider name
     * @param {string} params.client_id - OAuth client ID
     * @param {string} params.client_secret - OAuth client secret
     * @param {Array} params.scopes - Required OAuth scopes
     * @returns {Object} Token response
     */
    exchangeCredentials(params: {
        provider: string;
        client_id: string;
        client_secret: string;
        scopes: any[];
    }): Object;
    /**
     * Validate token format and structure
     * @param {Object} tokens - Token response
     * @returns {Object} Validation result
     */
    validateTokenResponse(tokens: Object): Object;
    /**
     * Format token response for consistent output
     * @param {Object} tokens - Raw token response
     * @param {string} provider - OAuth provider name
     * @returns {Object} Formatted token response
     */
    formatTokenResponse(tokens: Object, provider: string): Object;
    /**
     * Check if token is expired or will expire soon
     * @param {Object} tokenData - Token data with expiration info
     * @param {number} bufferMinutes - Minutes before expiry to consider token as expired
     * @returns {boolean} True if token is expired or will expire soon
     */
    isTokenExpired(tokenData: Object, bufferMinutes?: number): boolean;
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
}
export {};
//# sourceMappingURL=token-exchange.d.ts.map