/**
 * Cached credential object stored in memory
 */
export type CachedCredential = {
    /**
     * - The access token
     */
    bearerToken: string;
    /**
     * - The refresh token
     */
    refreshToken: string;
    /**
     * - Token expiration timestamp
     */
    expiresAt: number;
    /**
     * - Associated user ID
     */
    user_id: string;
};
/**
 * Database instance object from lookupInstanceCredentials
 */
export type DatabaseInstance = {
    /**
     * - The instance ID
     */
    instanceId: string;
    /**
     * - Whether the service is active
     */
    service_active: boolean;
    /**
     * - Instance status
     */
    status: 'active' | 'inactive' | 'expired';
    /**
     * - Instance expiration timestamp
     */
    expires_at?: string | undefined;
    /**
     * - Authentication type
     */
    auth_type: 'oauth';
    /**
     * - OAuth client ID
     */
    client_id: string;
    /**
     * - OAuth client secret
     */
    client_secret: string;
    /**
     * - Associated user ID
     */
    user_id: string;
    /**
     * - Database stored access token
     */
    access_token?: string | undefined;
    /**
     * - Database stored refresh token
     */
    refresh_token?: string | undefined;
    /**
     * - Database token expiration timestamp
     */
    token_expires_at?: string | undefined;
    /**
     * - When credentials were last updated
     */
    credentials_updated_at?: string | undefined;
};
/**
 * Extended cached credential object with additional properties
 */
export type ExtendedCachedCredential = CachedCredential & {
    cached_at?: string;
    refresh_attempts?: number;
    scope?: string;
    last_used?: string;
};
/**
 * Service configuration object
 */
export type ServiceConfig = {
    /**
     * - Service name
     */
    name: string;
    /**
     * - Display name
     */
    displayName: string;
    /**
     * - Service version
     */
    version: string;
    /**
     * - Service port
     */
    port?: number | undefined;
    /**
     * - Authentication type
     */
    authType?: string | undefined;
    /**
     * - Service description
     */
    description?: string | undefined;
    /**
     * - OAuth scopes
     */
    scopes: string[];
};
/**
 * Reddit API post object
 */
export type RedditPost = {
    /**
     * - Post ID
     */
    id: string;
    /**
     * - Post title
     */
    title: string;
    /**
     * - Post text content
     */
    selftext: string;
    /**
     * - Post author username
     */
    author: string;
    /**
     * - Subreddit name
     */
    subreddit: string;
    /**
     * - Post score (upvotes - downvotes)
     */
    score: number;
    /**
     * - Ratio of upvotes
     */
    upvote_ratio: number;
    /**
     * - Number of comments
     */
    num_comments: number;
    /**
     * - Creation timestamp
     */
    created_utc: number;
    /**
     * - Post URL
     */
    url: string;
    /**
     * - Reddit permalink
     */
    permalink: string;
    /**
     * - Whether it's a self post
     */
    is_self: boolean;
    /**
     * - Thumbnail URL
     */
    thumbnail?: string | undefined;
    /**
     * - Whether post is NSFW
     */
    over_18: boolean;
};
/**
 * Reddit API comment object
 */
export type RedditComment = {
    /**
     * - Comment ID
     */
    id: string;
    /**
     * - Comment text
     */
    body: string;
    /**
     * - Comment author username
     */
    author: string;
    /**
     * - Comment score
     */
    score: number;
    /**
     * - Creation timestamp
     */
    created_utc: number;
    /**
     * - Parent comment/post ID
     */
    parent_id: string;
    /**
     * - Link to parent post
     */
    link_id: string;
    /**
     * - Subreddit name
     */
    subreddit: string;
    /**
     * - Comment replies
     */
    replies?: RedditComment[] | undefined;
};
/**
 * Reddit API subreddit object
 */
export type RedditSubreddit = {
    /**
     * - Subreddit name
     */
    display_name: string;
    /**
     * - Subreddit title
     */
    title: string;
    /**
     * - Subreddit description
     */
    description: string;
    /**
     * - Number of subscribers
     */
    subscribers: number;
    /**
     * - Whether subreddit is NSFW
     */
    over18: boolean;
    /**
     * - Icon image URL
     */
    icon_img: string;
    /**
     * - Banner image URL
     */
    banner_img: string;
    /**
     * - Creation timestamp
     */
    created_utc: string;
};
/**
 * Reddit API user object
 */
export type RedditUser = {
    /**
     * - Username
     */
    name: string;
    /**
     * - Link karma
     */
    link_karma: number;
    /**
     * - Comment karma
     */
    comment_karma: number;
    /**
     * - Account creation timestamp
     */
    created_utc: number;
    /**
     * - Whether user has Reddit Gold
     */
    is_gold: boolean;
    /**
     * - Whether user is a moderator
     */
    is_mod: boolean;
    /**
     * - Profile icon URL
     */
    icon_img?: string | undefined;
};
/**
 * Reddit API error response structure
 */
export type RedditApiError = {
    /**
     * - Error type
     */
    error: string;
    /**
     * - Error message
     */
    message: string;
    /**
     * - HTTP status code
     */
    status?: number | undefined;
};
/**
 * OAuth error analysis result
 */
export type OAuthErrorAnalysis = {
    /**
     * - Error type
     */
    type: string;
    /**
     * - Whether re-authentication is required
     */
    requiresReauth: boolean;
    /**
     * - Whether the operation should be retried
     */
    shouldRetry: boolean;
    /**
     * - User-friendly error message
     */
    userMessage: string;
    /**
     * - Log level for this error
     */
    logLevel: string;
};
/**
 * Token metrics data structure
 */
export type TokenMetrics = {
    /**
     * - Number of token refreshes
     */
    refreshCount: number;
    /**
     * - Number of successful operations
     */
    successCount: number;
    /**
     * - Number of errors
     */
    errorCount: number;
    /**
     * - Last refresh timestamp
     */
    lastRefreshTime: number;
    /**
     * - Total response time
     */
    totalResponseTime: number;
};
/**
 * MCP validation schema property
 */
export type MCPSchemaProperty = {
    /**
     * - Property type
     */
    type: string;
    /**
     * - Property description
     */
    description?: string | undefined;
    /**
     * - Enum values
     */
    enum?: string[] | undefined;
    /**
     * - Minimum length
     */
    minLength?: number | undefined;
    /**
     * - Maximum length
     */
    maxLength?: number | undefined;
    /**
     * - Regex pattern
     */
    pattern?: string | undefined;
    /**
     * - Minimum value
     */
    minimum?: number | undefined;
    /**
     * - Maximum value
     */
    maximum?: number | undefined;
    /**
     * - Array item schema
     */
    items?: MCPSchemaProperty | undefined;
    /**
     * - Object properties
     */
    properties?: {
        [x: string]: MCPSchemaProperty;
    } | undefined;
    /**
     * - Required properties
     */
    required?: string[] | undefined;
};
/**
 * MCP tool schema
 */
export type MCPToolSchema = {
    /**
     * - Tool name
     */
    name: string;
    /**
     * - Tool description
     */
    description: string;
    /**
     * - Input schema
     */
    inputSchema: MCPSchemaProperty;
};
/**
 * MCP request/response structure
 */
export type MCPStructure = {
    /**
     * - Available tools
     */
    tools: MCPToolSchema[];
};
/**
 * Token information extracted from cache or database
 */
export type TokenInfo = {
    /**
     * - The refresh token
     */
    refreshToken?: string | undefined;
    /**
     * - The access token
     */
    accessToken?: string | undefined;
    /**
     * - Token expiration timestamp
     */
    tokenExpiresAt?: number | undefined;
};
/**
 * Result of token refresh operation
 */
export type TokenRefreshResult = {
    /**
     * - Whether the refresh was successful
     */
    success: boolean;
    /**
     * - The new access token if successful
     */
    accessToken?: string | undefined;
    /**
     * - The refresh token (new or existing)
     */
    refreshToken?: string | undefined;
    /**
     * - Token lifetime in seconds
     */
    expiresIn?: number | undefined;
    /**
     * - Token scope
     */
    scope?: string | undefined;
    /**
     * - Error object if refresh failed
     */
    error?: TokenRefreshError | undefined;
    /**
     * - Method used for refresh (oauth_service or direct_oauth)
     */
    method: string;
    /**
     * - Additional metadata for successful refresh
     */
    metadata?: TokenRefreshMetadata | undefined;
    /**
     * - Error information for failed refresh
     */
    errorInfo?: TokenRefreshErrorInfo | undefined;
};
/**
 * Token refresh error object
 */
export type TokenRefreshError = {
    /**
     * - Error message
     */
    message: string;
    /**
     * - Error type classification
     */
    errorType?: string | undefined;
    /**
     * - Original error message
     */
    originalError?: string | undefined;
    /**
     * - Error name for compatibility with Error interface
     */
    name: string;
};
/**
 * Metadata for successful token refresh
 */
export type TokenRefreshMetadata = {
    /**
     * - Token lifetime in seconds
     */
    expiresIn: number;
    /**
     * - Token scope
     */
    scope?: string | undefined;
    /**
     * - Operation response time in milliseconds
     */
    responseTime: number;
    /**
     * - Method used for refresh
     */
    method: string;
};
/**
 * Error information for failed token refresh
 */
export type TokenRefreshErrorInfo = {
    /**
     * - The error object
     */
    error: TokenRefreshError;
    /**
     * - Method used for refresh
     */
    method: string;
    /**
     * - Operation response time in milliseconds
     */
    responseTime: number;
    /**
     * - Original error message
     */
    originalError: string;
    /**
     * - Associated user ID
     */
    userId: string;
};
/**
 * Result of authentication error handling
 */
export type AuthErrorResult = {
    /**
     * - Whether re-authentication is required
     */
    requiresReauth: boolean;
    /**
     * - Error message
     */
    error: string;
    /**
     * - Error code
     */
    errorCode?: string | undefined;
    /**
     * - The instance ID
     */
    instanceId: string;
};
/**
 * Result of instance validation
 */
export type InstanceValidationResult = {
    /**
     * - Whether the instance is valid
     */
    isValid: boolean;
    /**
     * - Error response object if validation fails
     */
    errorResponse?: void | undefined;
};
/**
 * Metadata for audit log entries
 */
export type AuditLogMetadata = {
    /**
     * - Token lifetime in seconds
     */
    expiresIn?: number | undefined;
    /**
     * - Token scope
     */
    scope?: string | undefined;
    /**
     * - Operation response time in milliseconds
     */
    responseTime?: number | undefined;
    /**
     * - Original error message
     */
    originalError?: string | undefined;
    /**
     * - Whether refresh token was available
     */
    hasRefreshToken?: boolean | undefined;
    /**
     * - Whether access token was available
     */
    hasAccessToken?: boolean | undefined;
    /**
     * - Whether token was expired
     */
    tokenExpired?: string | boolean | undefined;
    /**
     * - Source of the token (cache, database)
     */
    tokenSource?: string | undefined;
    /**
     * - Method used for the operation
     */
    method?: string | undefined;
};
/**
 * Extended Express Request object with custom properties
 */
export type ExpressRequest = import('express').Request & {
    bearerToken?: string;
    instanceId?: string;
    userId?: string;
};
/**
 * Express Response object
 */
export type ExpressResponse = import('express').Response;
/**
 * Express Next function
 */
export type ExpressNext = () => void;
/**
 * OAuth token refresh options
 */
export type TokenRefreshOptions = {
    /**
     * - The refresh token
     */
    refreshToken: string;
    /**
     * - OAuth client ID
     */
    clientId: string;
    /**
     * - OAuth client secret
     */
    clientSecret: string;
};
/**
 * New OAuth tokens from refresh response
 */
export type NewOAuthTokens = {
    /**
     * - The new access token
     */
    access_token: string;
    /**
     * - The new refresh token (optional)
     */
    refresh_token?: string | undefined;
    /**
     * - Token lifetime in seconds
     */
    expires_in: number;
    /**
     * - Token scope
     */
    scope?: string | undefined;
};
/**
 * Token audit log entry
 */
export type TokenAuditLogEntry = {
    /**
     * - The instance ID
     */
    instanceId: string;
    /**
     * - Operation type (refresh, validate, etc.)
     */
    operation: string;
    /**
     * - Operation status (success, failure)
     */
    status: string;
    /**
     * - Method used
     */
    method: string;
    /**
     * - Error type if applicable
     */
    errorType?: string | undefined;
    /**
     * - Error message if applicable
     */
    errorMessage?: string | undefined;
    /**
     * - The user ID
     */
    userId: string;
    /**
     * - Additional metadata
     */
    metadata: AuditLogMetadata;
};
//# sourceMappingURL=types.d.ts.map