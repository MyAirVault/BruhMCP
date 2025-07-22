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
            validateCredentials(clientId: string, clientSecret: string): Promise<import("../providers/base-oauth.js").ValidationResult>;
            generateAuthorizationUrl(params: import("../providers/base-oauth.js").AuthParams): Promise<string>;
            exchangeAuthorizationCode(params: import("../providers/base-oauth.js").ExchangeParams): Promise<GoogleTokenResponse>;
            refreshAccessToken(params: import("../providers/base-oauth.js").RefreshParams): Promise<GoogleTokenResponse>;
            validateTokenScopes(tokens: GoogleTokenResponse): Promise<import("../providers/base-oauth.js").ValidationResult>;
            getUserInfo(accessToken: string): Promise<GoogleUserInfo>;
            revokeToken(token: string): Promise<boolean>;
            providerName: string;
            handleApiResponse(response: Response, operation: string): Promise<any>;
            validateRequiredParams(params: Record<string, any>, required: string[]): void;
            validateTokenResponse(tokens: TokenResponse): ValidationResult;
            getProviderName(): string;
            getProviderUrls(): {
                authUrl: string | null;
                tokenUrl: string | null;
                userInfoUrl: string | null;
                revokeUrl: string | null;
            };
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
            providerName: string;
            handleApiResponse(response: Response, operation: string): Promise<any>;
            validateRequiredParams(params: Record<string, any>, required: string[]): void;
            validateTokenResponse(tokens: TokenResponse): ValidationResult;
            getProviderName(): string;
            getProviderUrls(): {
                authUrl: string | null;
                tokenUrl: string | null;
                userInfoUrl: string | null;
                revokeUrl: string | null;
            };
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
            providerName: string;
            handleApiResponse(response: Response, operation: string): Promise<any>;
            validateRequiredParams(params: Record<string, any>, required: string[]): void;
            validateTokenResponse(tokens: TokenResponse): ValidationResult;
            getProviderName(): string;
            getProviderUrls(): {
                authUrl: string | null;
                tokenUrl: string | null;
                userInfoUrl: string | null;
                revokeUrl: string | null;
            };
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
            providerName: string;
            handleApiResponse(response: Response, operation: string): Promise<any>;
            validateRequiredParams(params: Record<string, any>, required: string[]): void;
            validateTokenResponse(tokens: TokenResponse): ValidationResult;
            getProviderName(): string;
            getProviderUrls(): {
                authUrl: string | null;
                tokenUrl: string | null;
                userInfoUrl: string | null;
                revokeUrl: string | null;
            };
        };
        discord: {
            authUrl: string;
            tokenUrl: string;
            userInfoUrl: string;
            revokeUrl: string;
            validateCredentials(clientId: string, clientSecret: string): Promise<import("../providers/base-oauth.js").ValidationResult>;
            generateAuthorizationUrl(params: import("../providers/base-oauth.js").AuthParams): Promise<string>;
            exchangeAuthorizationCode(params: import("../providers/base-oauth.js").ExchangeParams): Promise<DiscordTokenResponse>;
            refreshAccessToken(params: import("../providers/base-oauth.js").RefreshParams): Promise<DiscordTokenResponse>;
            validateTokenScopes(tokens: DiscordTokenResponse): Promise<import("../providers/base-oauth.js").ValidationResult>;
            getUserInfo(accessToken: string): Promise<DiscordUserInfo>;
            revokeToken(token: string): Promise<boolean>;
            providerName: string;
            handleApiResponse(response: Response, operation: string): Promise<any>;
            validateRequiredParams(params: Record<string, any>, required: string[]): void;
            validateTokenResponse(tokens: TokenResponse): ValidationResult;
            getProviderName(): string;
            getProviderUrls(): {
                authUrl: string | null;
                tokenUrl: string | null;
                userInfoUrl: string | null;
                revokeUrl: string | null;
            };
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
            providerName: string;
            handleApiResponse(response: Response, operation: string): Promise<any>;
            validateRequiredParams(params: Record<string, any>, required: string[]): void;
            validateTokenResponse(tokens: TokenResponse): ValidationResult;
            getProviderName(): string;
            getProviderUrls(): {
                authUrl: string | null;
                tokenUrl: string | null;
                userInfoUrl: string | null;
                revokeUrl: string | null;
            };
        };
        github: {
            authUrl: string;
            tokenUrl: string;
            userInfoUrl: string;
            revokeUrl: string;
            validateCredentials(clientId: string, clientSecret: string): Promise<import("../providers/base-oauth.js").ValidationResult>;
            generateAuthorizationUrl(params: import("../providers/base-oauth.js").AuthParams): Promise<string>;
            exchangeAuthorizationCode(params: import("../providers/base-oauth.js").ExchangeParams): Promise<GitHubTokenResponse>;
            refreshAccessToken(params: import("../providers/base-oauth.js").RefreshParams): Promise<GitHubTokenResponse>;
            validateTokenScopes(tokens: GitHubTokenResponse): Promise<import("../providers/base-oauth.js").ValidationResult>;
            getUserInfo(accessToken: string): Promise<import("../providers/base-oauth.js").UserInfo>;
            revokeToken(_token: string): Promise<boolean>;
            providerName: string;
            handleApiResponse(response: Response, operation: string): Promise<any>;
            validateRequiredParams(params: Record<string, any>, required: string[]): void;
            validateTokenResponse(tokens: TokenResponse): ValidationResult;
            getProviderName(): string;
            getProviderUrls(): {
                authUrl: string | null;
                tokenUrl: string | null;
                userInfoUrl: string | null;
                revokeUrl: string | null;
            };
        };
        dropbox: {
            authUrl: string;
            tokenUrl: string;
            userInfoUrl: string;
            revokeUrl: string;
            validateCredentials(clientId: string, clientSecret: string): Promise<import("../providers/base-oauth.js").ValidationResult>;
            generateAuthorizationUrl(params: import("../providers/base-oauth.js").AuthParams): Promise<string>;
            exchangeAuthorizationCode(params: import("../providers/base-oauth.js").ExchangeParams): Promise<DropboxTokenResponse>;
            refreshAccessToken(params: import("../providers/base-oauth.js").RefreshParams): Promise<DropboxTokenResponse>;
            validateTokenScopes(tokens: DropboxTokenResponse): Promise<import("../providers/base-oauth.js").ValidationResult>;
            getUserInfo(accessToken: string): Promise<DropboxUserInfo>;
            revokeToken(token: string): Promise<boolean>;
            providerName: string;
            handleApiResponse(response: Response, operation: string): Promise<any>;
            validateRequiredParams(params: Record<string, any>, required: string[]): void;
            validateTokenResponse(tokens: TokenResponse): ValidationResult;
            getProviderName(): string;
            getProviderUrls(): {
                authUrl: string | null;
                tokenUrl: string | null;
                userInfoUrl: string | null;
                revokeUrl: string | null;
            };
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