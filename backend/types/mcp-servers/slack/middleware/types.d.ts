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
    /**
     * - Associated Slack team ID
     */
    team_id: string;
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
    status: "active" | "inactive" | "expired";
    /**
     * - Instance expiration timestamp
     */
    expires_at?: string | undefined;
    /**
     * - Authentication type
     */
    auth_type: "oauth";
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
     * - Associated Slack team ID
     */
    team_id?: string | undefined;
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
 * Slack API message edit information
 */
export type SlackMessageEdit = {
    /**
     * - User ID who edited the message
     */
    user: string;
    /**
     * - Edit timestamp
     */
    ts: string;
};
/**
 * Slack API message object
 */
export type SlackMessage = {
    /**
     * - Message type
     */
    type: string;
    /**
     * - Message subtype
     */
    subtype?: string | undefined;
    /**
     * - Message text
     */
    text?: string | undefined;
    /**
     * - User ID who sent the message
     */
    user?: string | undefined;
    /**
     * - Message timestamp
     */
    ts: string;
    /**
     * - Channel ID
     */
    channel?: string | undefined;
    /**
     * - Thread timestamp if message is in thread
     */
    thread_ts?: string | undefined;
    /**
     * - Number of replies in thread
     */
    reply_count?: number | undefined;
    /**
     * - Number of users who replied in thread
     */
    reply_users_count?: number | undefined;
    /**
     * - Timestamp of latest reply
     */
    latest_reply?: string | undefined;
    /**
     * - Bot ID if message is from a bot
     */
    bot_id?: string | undefined;
    /**
     * - Username if message is from a bot
     */
    username?: string | undefined;
    /**
     * - Message attachments
     */
    attachments?: SlackAttachment[] | undefined;
    /**
     * - Message blocks
     */
    blocks?: SlackBlock[] | undefined;
    /**
     * - Message reactions
     */
    reactions?: SlackReaction[] | undefined;
    /**
     * - Message files
     */
    files?: SlackFile[] | undefined;
    /**
     * - Edit information if message was edited
     */
    edited?: SlackMessageEdit | undefined;
};
/**
 * Slack API channel object
 */
export type SlackChannel = {
    /**
     * - Channel ID
     */
    id: string;
    /**
     * - Channel name
     */
    name: string;
    /**
     * - Whether this is a channel
     */
    is_channel: boolean;
    /**
     * - Whether this is a group
     */
    is_group: boolean;
    /**
     * - Whether this is a direct message
     */
    is_im: boolean;
    /**
     * - Whether this is a multi-party direct message
     */
    is_mpim: boolean;
    /**
     * - Whether the channel is private
     */
    is_private: boolean;
    /**
     * - Whether the channel is archived
     */
    is_archived: boolean;
    /**
     * - Whether this is the general channel
     */
    is_general: boolean;
    /**
     * - User ID of channel creator
     */
    creator: string;
    /**
     * - Channel creation timestamp
     */
    created: number;
    /**
     * - Normalized channel name
     */
    name_normalized?: string | undefined;
    /**
     * - Whether the channel is shared
     */
    is_shared?: boolean | undefined;
    /**
     * - Whether the user is a member
     */
    is_member?: boolean | undefined;
    /**
     * - Number of channel members
     */
    num_members?: number | undefined;
    /**
     * - Array of member user IDs
     */
    members?: string[] | undefined;
    /**
     * - Channel topic
     */
    topic?: SlackTopic | undefined;
    /**
     * - Channel purpose
     */
    purpose?: SlackPurpose | undefined;
    /**
     * - Latest message in channel
     */
    latest?: SlackMessage | undefined;
};
/**
 * Slack API user object
 */
export type SlackUser = {
    /**
     * - User ID
     */
    id: string;
    /**
     * - Username
     */
    name: string;
    /**
     * - Real name
     */
    real_name: string;
    /**
     * - Display name
     */
    display_name?: string | undefined;
    /**
     * - User profile
     */
    profile?: SlackProfile | undefined;
    /**
     * - Whether user is admin
     */
    is_admin: boolean;
    /**
     * - Whether user is owner
     */
    is_owner?: boolean | undefined;
    /**
     * - Whether user is primary owner
     */
    is_primary_owner?: boolean | undefined;
    /**
     * - Whether user is restricted
     */
    is_restricted?: boolean | undefined;
    /**
     * - Whether user is ultra restricted
     */
    is_ultra_restricted?: boolean | undefined;
    /**
     * - Whether user is a bot
     */
    is_bot: boolean;
    /**
     * - Whether user is an app user
     */
    is_app_user?: boolean | undefined;
    /**
     * - Whether user is deleted
     */
    deleted: boolean;
    /**
     * - User timezone
     */
    tz: string;
    /**
     * - User timezone label
     */
    tz_label: string;
    /**
     * - User timezone offset
     */
    tz_offset: number;
    /**
     * - User last updated timestamp
     */
    updated?: number | undefined;
    /**
     * - Whether user has 2FA enabled
     */
    has_2fa?: boolean | undefined;
};
/**
 * Slack API profile object
 */
export type SlackProfile = {
    /**
     * - Avatar hash
     */
    avatar_hash?: string | undefined;
    /**
     * - Status text
     */
    status_text?: string | undefined;
    /**
     * - Status emoji
     */
    status_emoji?: string | undefined;
    /**
     * - Status expiration timestamp
     */
    status_expiration?: number | undefined;
    /**
     * - Real name
     */
    real_name?: string | undefined;
    /**
     * - Display name
     */
    display_name?: string | undefined;
    /**
     * - Normalized real name
     */
    real_name_normalized?: string | undefined;
    /**
     * - Normalized display name
     */
    display_name_normalized?: string | undefined;
    /**
     * - Email address
     */
    email?: string | undefined;
    /**
     * - Job title
     */
    title?: string | undefined;
    /**
     * - Phone number
     */
    phone?: string | undefined;
    /**
     * - Skype username
     */
    skype?: string | undefined;
    /**
     * - First name
     */
    first_name?: string | undefined;
    /**
     * - Last name
     */
    last_name?: string | undefined;
    /**
     * - 24px profile image
     */
    image_24?: string | undefined;
    /**
     * - 32px profile image
     */
    image_32?: string | undefined;
    /**
     * - 48px profile image
     */
    image_48?: string | undefined;
    /**
     * - 72px profile image
     */
    image_72?: string | undefined;
    /**
     * - 192px profile image
     */
    image_192?: string | undefined;
    /**
     * - 512px profile image
     */
    image_512?: string | undefined;
    /**
     * - 1024px profile image
     */
    image_1024?: string | undefined;
    /**
     * - Original profile image
     */
    image_original?: string | undefined;
    /**
     * - Team ID
     */
    team?: string | undefined;
};
/**
 * Slack API attachment object
 */
export type SlackAttachment = {
    /**
     * - Attachment ID
     */
    id?: string | undefined;
    /**
     * - Fallback text
     */
    fallback?: string | undefined;
    /**
     * - Attachment color
     */
    color?: string | undefined;
    /**
     * - Pretext
     */
    pretext?: string | undefined;
    /**
     * - Author name
     */
    author_name?: string | undefined;
    /**
     * - Author link
     */
    author_link?: string | undefined;
    /**
     * - Author icon
     */
    author_icon?: string | undefined;
    /**
     * - Title
     */
    title?: string | undefined;
    /**
     * - Title link
     */
    title_link?: string | undefined;
    /**
     * - Text
     */
    text?: string | undefined;
    /**
     * - Fields
     */
    fields?: SlackField[] | undefined;
    /**
     * - Image URL
     */
    image_url?: string | undefined;
    /**
     * - Thumbnail URL
     */
    thumb_url?: string | undefined;
    /**
     * - Footer
     */
    footer?: string | undefined;
    /**
     * - Footer icon
     */
    footer_icon?: string | undefined;
    /**
     * - Timestamp
     */
    ts?: number | undefined;
};
/**
 * Slack API field object
 */
export type SlackField = {
    /**
     * - Field title
     */
    title: string;
    /**
     * - Field value
     */
    value: string;
    /**
     * - Whether field is short
     */
    short?: boolean | undefined;
};
/**
 * Slack API block object
 */
export type SlackBlock = {
    /**
     * - Block type
     */
    type: string;
    /**
     * - Block ID
     */
    block_id?: string | undefined;
    /**
     * - Text object
     */
    text?: Object | undefined;
    /**
     * - Block elements
     */
    elements?: SlackElement[] | undefined;
    /**
     * - Block accessory
     */
    accessory?: Object | undefined;
};
/**
 * Slack API element object
 */
export type SlackElement = {
    /**
     * - Element type
     */
    type: string;
    /**
     * - Action ID
     */
    action_id?: string | undefined;
    /**
     * - Text object
     */
    text?: Object | undefined;
    /**
     * - URL
     */
    url?: string | undefined;
    /**
     * - Value
     */
    value?: string | undefined;
};
/**
 * Slack API topic object
 */
export type SlackTopic = {
    /**
     * - Topic value
     */
    value: string;
    /**
     * - Creator user ID
     */
    creator: string;
    /**
     * - Last set timestamp
     */
    last_set: number;
};
/**
 * Slack API purpose object
 */
export type SlackPurpose = {
    /**
     * - Purpose value
     */
    value: string;
    /**
     * - Creator user ID
     */
    creator: string;
    /**
     * - Last set timestamp
     */
    last_set: number;
};
/**
 * Slack API reaction object
 */
export type SlackReaction = {
    /**
     * - Reaction emoji name
     */
    name: string;
    /**
     * - Number of users who reacted
     */
    count: number;
    /**
     * - Array of user IDs who reacted
     */
    users: string[];
};
/**
 * Slack API file object
 */
export type SlackFile = {
    /**
     * - File ID
     */
    id: string;
    /**
     * - File name
     */
    name?: string | undefined;
    /**
     * - File title
     */
    title?: string | undefined;
    /**
     * - MIME type
     */
    mimetype?: string | undefined;
    /**
     * - File type
     */
    filetype?: string | undefined;
    /**
     * - Human-readable file type
     */
    pretty_type?: string | undefined;
    /**
     * - User ID who uploaded the file
     */
    user?: string | undefined;
    /**
     * - File mode
     */
    mode?: string | undefined;
    /**
     * - Whether file is editable
     */
    editable?: boolean | undefined;
    /**
     * - Whether file is external
     */
    is_external?: boolean | undefined;
    /**
     * - External file type
     */
    external_type?: string | undefined;
    /**
     * - File size in bytes
     */
    size?: number | undefined;
    /**
     * - Private URL
     */
    url_private?: string | undefined;
    /**
     * - Private download URL
     */
    url_private_download?: string | undefined;
    /**
     * - 64px thumbnail URL
     */
    thumb_64?: string | undefined;
    /**
     * - 80px thumbnail URL
     */
    thumb_80?: string | undefined;
    /**
     * - 160px thumbnail URL
     */
    thumb_160?: string | undefined;
    /**
     * - 360px thumbnail URL
     */
    thumb_360?: string | undefined;
    /**
     * - 480px thumbnail URL
     */
    thumb_480?: string | undefined;
    /**
     * - 720px thumbnail URL
     */
    thumb_720?: string | undefined;
    /**
     * - 800px thumbnail URL
     */
    thumb_800?: string | undefined;
    /**
     * - 960px thumbnail URL
     */
    thumb_960?: string | undefined;
    /**
     * - 1024px thumbnail URL
     */
    thumb_1024?: string | undefined;
    /**
     * - Permalink URL
     */
    permalink?: string | undefined;
    /**
     * - Public permalink URL
     */
    permalink_public?: string | undefined;
    /**
     * - Creation timestamp
     */
    created?: number | undefined;
    /**
     * - Timestamp
     */
    timestamp?: number | undefined;
};
/**
 * Slack file upload result object
 */
export type SlackFileUploadResult = {
    /**
     * - Whether the upload was successful
     */
    ok: boolean;
    /**
     * - The uploaded file object
     */
    file?: SlackFile | undefined;
    /**
     * - Warning message if any
     */
    warning?: string | undefined;
};
/**
 * Slack API error response structure
 */
export type SlackApiError = {
    /**
     * - Error code
     */
    error: string;
    /**
     * - Warning message
     */
    warning?: string | undefined;
    /**
     * - Always false for errors
     */
    ok: boolean;
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
    /**
     * - Slack team ID
     */
    teamId?: string | undefined;
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
     * - Slack team ID
     */
    teamId?: string | undefined;
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
     * - Slack team ID
     */
    teamId?: string | undefined;
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
     * - Slack team ID
     */
    teamId?: string | undefined;
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
export type ExpressRequest = import("express").Request & {
    bearerToken?: string;
    instanceId?: string;
    userId?: string;
    teamId?: string;
};
/**
 * Express Response object
 */
export type ExpressResponse = import("express").Response;
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
    /**
     * - Slack team ID
     */
    team_id?: string | undefined;
};
/**
 * Slack API team object
 */
export type SlackTeam = {
    /**
     * - Team ID
     */
    id: string;
    /**
     * - Team name
     */
    name: string;
    /**
     * - Team domain
     */
    domain?: string | undefined;
    /**
     * - Team email domain
     */
    email_domain?: string | undefined;
    /**
     * - Team icon object
     */
    icon?: Object | undefined;
    /**
     * - Enterprise ID if part of enterprise
     */
    enterprise_id?: string | undefined;
    /**
     * - Enterprise name if part of enterprise
     */
    enterprise_name?: string | undefined;
    /**
     * - Base URL for team avatars
     */
    avatar_base_url?: string | undefined;
    /**
     * - Whether team is verified
     */
    is_verified?: boolean | undefined;
    /**
     * - Team discovery setting
     */
    discovery_setting?: string | undefined;
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