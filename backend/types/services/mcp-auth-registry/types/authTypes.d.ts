export type AuthCredentials = {
    /**
     * - OAuth client ID (for OAuth services)
     */
    client_id?: string | undefined;
    /**
     * - OAuth client secret (for OAuth services)
     */
    client_secret?: string | undefined;
    /**
     * - API token (for API key services)
     */
    api_token?: string | undefined;
    /**
     * - API key (for API key services)
     */
    api_key?: string | undefined;
    /**
     * - OAuth scopes (for OAuth services)
     */
    scopes?: string[] | undefined;
};
export type CredentialValidator = {
    /**
     * - Validates credentials
     */
    validateCredentials: (arg0: AuthCredentials) => Promise<ValidationResult>;
    /**
     * - Tests credentials against API
     */
    testCredentials?: ((arg0: AuthCredentials) => Promise<ValidationResult>) | undefined;
    /**
     * - Validates credential format
     */
    validateFormat?: ((arg0: AuthCredentials) => ValidationResult) | undefined;
};
export type ValidatorConstructor = Function;
export type OAuthHandler = {
    /**
     * - Initiates OAuth flow
     */
    initiateFlow: (arg0: string, arg1: AuthCredentials) => Promise<OAuthFlowResult>;
    /**
     * - Handles OAuth callback
     */
    handleCallback: (arg0: string, arg1: string) => Promise<OAuthCallbackResult>;
    /**
     * - Refreshes OAuth token
     */
    refreshToken?: ((arg0: string, arg1: Object) => Promise<Object>) | undefined;
};
export type ValidatorType = CredentialValidator | Function;
export type ValidationResult = {
    /**
     * - Whether credentials are valid
     */
    isValid: boolean;
    /**
     * - Error message if validation failed
     */
    error?: string | undefined;
    /**
     * - User information if validation successful
     */
    userInfo?: {
        /**
         * - User ID
         */
        id?: string | undefined;
        /**
         * - User email
         */
        email?: string | undefined;
        /**
         * - User name
         */
        name?: string | undefined;
        /**
         * - User handle/username
         */
        handle?: string | undefined;
    } | undefined;
};
export type OAuthFlowResult = {
    /**
     * - OAuth authorization URL
     */
    authUrl: string;
    /**
     * - OAuth state parameter containing instanceId
     */
    state: string;
    /**
     * - MCP instance ID
     */
    instanceId: string;
};
export type OAuthCallbackResult = {
    /**
     * - Whether callback was successful
     */
    success: boolean;
    /**
     * - Error message if callback failed
     */
    error?: string | undefined;
    /**
     * - OAuth tokens if successful
     */
    tokens?: {
        /**
         * - Access token
         */
        access_token?: string | undefined;
        /**
         * - Refresh token
         */
        refresh_token?: string | undefined;
        /**
         * - Token expiration in seconds
         */
        expires_in?: number | undefined;
        /**
         * - Token scope
         */
        scope?: string | undefined;
    } | undefined;
};
export type ServiceConfig = {
    /**
     * - Service name
     */
    name: string;
    /**
     * - Service authentication type
     */
    type: "oauth" | "apikey";
    /**
     * - Credential validator
     */
    validator: ValidatorType;
    /**
     * - OAuth handler (for OAuth services)
     */
    oauthHandler?: OAuthHandler | undefined;
    /**
     * - Required credential fields
     */
    requiredFields: Array<string>;
};
export type InstanceMetadata = {
    /**
     * - User information from validation
     */
    userInfo?: {
        /**
         * - User ID
         */
        id?: string | undefined;
        /**
         * - User email
         */
        email?: string | undefined;
        /**
         * - User name
         */
        name?: string | undefined;
    } | undefined;
    /**
     * - User email
     */
    userEmail?: string | undefined;
    /**
     * - Creation method
     */
    createdVia?: string | undefined;
    /**
     * - Authentication type
     */
    authType?: string | undefined;
    /**
     * - Validation timestamp
     */
    validatedAt?: string | undefined;
};
export type InstanceCreationData = {
    /**
     * - Name of the service
     */
    serviceName: string;
    /**
     * - Service credentials
     */
    credentials: AuthCredentials;
    /**
     * - User ID creating the instance
     */
    userId: string;
    /**
     * - Additional metadata
     */
    metadata?: InstanceMetadata | undefined;
};
export type OAuthStatusUpdate = {
    /**
     * - OAuth status ('pending'|'completed'|'failed'|'expired')
     */
    status: string;
    /**
     * - Access token (encrypted)
     */
    accessToken?: string | undefined;
    /**
     * - Refresh token (encrypted)
     */
    refreshToken?: string | undefined;
    /**
     * - Token expiration date
     */
    tokenExpiresAt?: Date | undefined;
    /**
     * - Token scope
     */
    scope?: string | undefined;
    /**
     * - Error message if failed
     */
    error?: string | undefined;
    /**
     * - Detailed error message
     */
    errorMessage?: string | undefined;
};
export type AuditLogMetadata = {
    /**
     * - Method used for operation
     */
    method?: string | undefined;
    /**
     * - Service name
     */
    service?: string | undefined;
    /**
     * - Error message
     */
    error?: string | undefined;
    /**
     * - OAuth scope
     */
    scope?: string | undefined;
    /**
     * - Authentication type
     */
    authType?: string | undefined;
};
export type AuthRegistryConfig = {
    /**
     * - Path to MCP services directory
     */
    servicesPath: string;
    /**
     * - Base URL for callbacks
     */
    baseUrl: string;
    /**
     * - Enable automatic service discovery
     */
    autoDiscovery: boolean;
    /**
     * - Service discovery interval in ms
     */
    discoveryInterval?: number | undefined;
};
//# sourceMappingURL=authTypes.d.ts.map