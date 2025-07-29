/**
 * @fileoverview Type definitions for Slack MCP middleware modules
 * All types are properly defined with JSDoc for TypeScript compatibility
 */

/**
 * Cached credential object stored in memory
 * @typedef {Object} CachedCredential
 * @property {string} bearerToken - The access token
 * @property {string} refreshToken - The refresh token
 * @property {number} expiresAt - Token expiration timestamp
 * @property {string} user_id - Associated user ID
 * @property {string} team_id - Associated Slack team ID
 */

/**
 * Database instance object from lookupInstanceCredentials
 * @typedef {Object} DatabaseInstance
 * @property {string} instanceId - The instance ID
 * @property {boolean} service_active - Whether the service is active
 * @property {'active'|'inactive'|'expired'} status - Instance status
 * @property {string} [expires_at] - Instance expiration timestamp
 * @property {'oauth'} auth_type - Authentication type
 * @property {string} client_id - OAuth client ID
 * @property {string} client_secret - OAuth client secret
 * @property {string} user_id - Associated user ID
 * @property {string} [team_id] - Associated Slack team ID
 * @property {string} [access_token] - Database stored access token
 * @property {string} [refresh_token] - Database stored refresh token
 * @property {string} [token_expires_at] - Database token expiration timestamp
 * @property {string} [credentials_updated_at] - When credentials were last updated
 */

/**
 * Extended cached credential object with additional properties
 * @typedef {CachedCredential & {
 *   cached_at?: string,
 *   refresh_attempts?: number,
 *   scope?: string,
 *   last_used?: string
 * }} ExtendedCachedCredential
 */

/**
 * Service configuration object
 * @typedef {Object} ServiceConfig
 * @property {string} name - Service name
 * @property {string} displayName - Display name
 * @property {string} version - Service version
 * @property {number} [port] - Service port
 * @property {string} [authType] - Authentication type
 * @property {string} [description] - Service description
 * @property {string[]} scopes - OAuth scopes
 */

/**
 * Slack API message edit information
 * @typedef {Object} SlackMessageEdit
 * @property {string} user - User ID who edited the message
 * @property {string} ts - Edit timestamp
 */

/**
 * Slack API message object
 * @typedef {Object} SlackMessage
 * @property {string} type - Message type
 * @property {string} [subtype] - Message subtype
 * @property {string} [text] - Message text
 * @property {string} [user] - User ID who sent the message
 * @property {string} ts - Message timestamp
 * @property {string} [channel] - Channel ID
 * @property {string} [thread_ts] - Thread timestamp if message is in thread
 * @property {number} [reply_count] - Number of replies in thread
 * @property {number} [reply_users_count] - Number of users who replied in thread
 * @property {string} [latest_reply] - Timestamp of latest reply
 * @property {string} [bot_id] - Bot ID if message is from a bot
 * @property {string} [username] - Username if message is from a bot
 * @property {SlackAttachment[]} [attachments] - Message attachments
 * @property {SlackBlock[]} [blocks] - Message blocks
 * @property {SlackReaction[]} [reactions] - Message reactions
 * @property {SlackFile[]} [files] - Message files
 * @property {SlackMessageEdit} [edited] - Edit information if message was edited
 */

/**
 * Slack API channel object
 * @typedef {Object} SlackChannel
 * @property {string} id - Channel ID
 * @property {string} name - Channel name
 * @property {boolean} is_channel - Whether this is a channel
 * @property {boolean} is_group - Whether this is a group
 * @property {boolean} is_im - Whether this is a direct message
 * @property {boolean} is_mpim - Whether this is a multi-party direct message
 * @property {boolean} is_private - Whether the channel is private
 * @property {boolean} is_archived - Whether the channel is archived
 * @property {boolean} is_general - Whether this is the general channel
 * @property {string} creator - User ID of channel creator
 * @property {number} created - Channel creation timestamp
 * @property {string} [name_normalized] - Normalized channel name
 * @property {boolean} [is_shared] - Whether the channel is shared
 * @property {boolean} [is_member] - Whether the user is a member
 * @property {number} [num_members] - Number of channel members
 * @property {string[]} [members] - Array of member user IDs
 * @property {SlackTopic} [topic] - Channel topic
 * @property {SlackPurpose} [purpose] - Channel purpose
 * @property {SlackMessage} [latest] - Latest message in channel
 */

/**
 * Slack API user object
 * @typedef {Object} SlackUser
 * @property {string} id - User ID
 * @property {string} name - Username
 * @property {string} real_name - Real name
 * @property {string} [display_name] - Display name
 * @property {SlackProfile} [profile] - User profile
 * @property {boolean} is_admin - Whether user is admin
 * @property {boolean} [is_owner] - Whether user is owner
 * @property {boolean} [is_primary_owner] - Whether user is primary owner
 * @property {boolean} [is_restricted] - Whether user is restricted
 * @property {boolean} [is_ultra_restricted] - Whether user is ultra restricted
 * @property {boolean} is_bot - Whether user is a bot
 * @property {boolean} [is_app_user] - Whether user is an app user
 * @property {boolean} deleted - Whether user is deleted
 * @property {string} tz - User timezone
 * @property {string} tz_label - User timezone label
 * @property {number} tz_offset - User timezone offset
 * @property {number} [updated] - User last updated timestamp
 * @property {boolean} [has_2fa] - Whether user has 2FA enabled
 */

/**
 * Slack API profile object
 * @typedef {Object} SlackProfile
 * @property {string} [avatar_hash] - Avatar hash
 * @property {string} [status_text] - Status text
 * @property {string} [status_emoji] - Status emoji
 * @property {number} [status_expiration] - Status expiration timestamp
 * @property {string} [real_name] - Real name
 * @property {string} [display_name] - Display name
 * @property {string} [real_name_normalized] - Normalized real name
 * @property {string} [display_name_normalized] - Normalized display name
 * @property {string} [email] - Email address
 * @property {string} [title] - Job title
 * @property {string} [phone] - Phone number
 * @property {string} [skype] - Skype username
 * @property {string} [first_name] - First name
 * @property {string} [last_name] - Last name
 * @property {string} [image_24] - 24px profile image
 * @property {string} [image_32] - 32px profile image
 * @property {string} [image_48] - 48px profile image
 * @property {string} [image_72] - 72px profile image
 * @property {string} [image_192] - 192px profile image
 * @property {string} [image_512] - 512px profile image
 * @property {string} [image_1024] - 1024px profile image
 * @property {string} [image_original] - Original profile image
 * @property {string} [team] - Team ID
 */

/**
 * Slack API attachment object
 * @typedef {Object} SlackAttachment
 * @property {string} [id] - Attachment ID
 * @property {string} [fallback] - Fallback text
 * @property {string} [color] - Attachment color
 * @property {string} [pretext] - Pretext
 * @property {string} [author_name] - Author name
 * @property {string} [author_link] - Author link
 * @property {string} [author_icon] - Author icon
 * @property {string} [title] - Title
 * @property {string} [title_link] - Title link
 * @property {string} [text] - Text
 * @property {SlackField[]} [fields] - Fields
 * @property {string} [image_url] - Image URL
 * @property {string} [thumb_url] - Thumbnail URL
 * @property {string} [footer] - Footer
 * @property {string} [footer_icon] - Footer icon
 * @property {number} [ts] - Timestamp
 */

/**
 * Slack API field object
 * @typedef {Object} SlackField
 * @property {string} title - Field title
 * @property {string} value - Field value
 * @property {boolean} [short] - Whether field is short
 */

/**
 * Slack API block object
 * @typedef {Object} SlackBlock
 * @property {string} type - Block type
 * @property {string} [block_id] - Block ID
 * @property {Object} [text] - Text object
 * @property {SlackElement[]} [elements] - Block elements
 * @property {Object} [accessory] - Block accessory
 */

/**
 * Slack API element object
 * @typedef {Object} SlackElement
 * @property {string} type - Element type
 * @property {string} [action_id] - Action ID
 * @property {Object} [text] - Text object
 * @property {string} [url] - URL
 * @property {string} [value] - Value
 */

/**
 * Slack API topic object
 * @typedef {Object} SlackTopic
 * @property {string} value - Topic value
 * @property {string} creator - Creator user ID
 * @property {number} last_set - Last set timestamp
 */

/**
 * Slack API purpose object
 * @typedef {Object} SlackPurpose
 * @property {string} value - Purpose value
 * @property {string} creator - Creator user ID
 * @property {number} last_set - Last set timestamp
 */

/**
 * Slack API reaction object
 * @typedef {Object} SlackReaction
 * @property {string} name - Reaction emoji name
 * @property {number} count - Number of users who reacted
 * @property {string[]} users - Array of user IDs who reacted
 */

/**
 * Slack API file object
 * @typedef {Object} SlackFile
 * @property {string} id - File ID
 * @property {string} [name] - File name
 * @property {string} [title] - File title
 * @property {string} [mimetype] - MIME type
 * @property {string} [filetype] - File type
 * @property {string} [pretty_type] - Human-readable file type
 * @property {string} [user] - User ID who uploaded the file
 * @property {string} [mode] - File mode
 * @property {boolean} [editable] - Whether file is editable
 * @property {boolean} [is_external] - Whether file is external
 * @property {string} [external_type] - External file type
 * @property {number} [size] - File size in bytes
 * @property {string} [url_private] - Private URL
 * @property {string} [url_private_download] - Private download URL
 * @property {string} [thumb_64] - 64px thumbnail URL
 * @property {string} [thumb_80] - 80px thumbnail URL
 * @property {string} [thumb_160] - 160px thumbnail URL
 * @property {string} [thumb_360] - 360px thumbnail URL
 * @property {string} [thumb_480] - 480px thumbnail URL
 * @property {string} [thumb_720] - 720px thumbnail URL
 * @property {string} [thumb_800] - 800px thumbnail URL
 * @property {string} [thumb_960] - 960px thumbnail URL
 * @property {string} [thumb_1024] - 1024px thumbnail URL
 * @property {string} [permalink] - Permalink URL
 * @property {string} [permalink_public] - Public permalink URL
 * @property {number} [created] - Creation timestamp
 * @property {number} [timestamp] - Timestamp
 */

/**
 * Slack file upload result object
 * @typedef {Object} SlackFileUploadResult
 * @property {boolean} ok - Whether the upload was successful
 * @property {SlackFile} [file] - The uploaded file object
 * @property {string} [warning] - Warning message if any
 */

/**
 * Slack API error response structure
 * @typedef {Object} SlackApiError
 * @property {string} error - Error code
 * @property {string} [warning] - Warning message
 * @property {boolean} ok - Always false for errors
 */

/**
 * OAuth error analysis result
 * @typedef {Object} OAuthErrorAnalysis
 * @property {string} type - Error type
 * @property {boolean} requiresReauth - Whether re-authentication is required
 * @property {boolean} shouldRetry - Whether the operation should be retried
 * @property {string} userMessage - User-friendly error message
 * @property {string} logLevel - Log level for this error
 */

/**
 * Token metrics data structure
 * @typedef {Object} TokenMetrics
 * @property {number} refreshCount - Number of token refreshes
 * @property {number} successCount - Number of successful operations
 * @property {number} errorCount - Number of errors
 * @property {number} lastRefreshTime - Last refresh timestamp
 * @property {number} totalResponseTime - Total response time
 */

/**
 * MCP validation schema property
 * @typedef {Object} MCPSchemaProperty
 * @property {string} type - Property type
 * @property {string} [description] - Property description
 * @property {string[]} [enum] - Enum values
 * @property {number} [minLength] - Minimum length
 * @property {number} [maxLength] - Maximum length
 * @property {string} [pattern] - Regex pattern
 * @property {number} [minimum] - Minimum value
 * @property {number} [maximum] - Maximum value
 * @property {MCPSchemaProperty} [items] - Array item schema
 * @property {Object<string, MCPSchemaProperty>} [properties] - Object properties
 * @property {string[]} [required] - Required properties
 */

/**
 * MCP tool schema
 * @typedef {Object} MCPToolSchema
 * @property {string} name - Tool name
 * @property {string} description - Tool description
 * @property {MCPSchemaProperty} inputSchema - Input schema
 */

/**
 * MCP request/response structure
 * @typedef {Object} MCPStructure
 * @property {MCPToolSchema[]} tools - Available tools
 */

/**
 * Token information extracted from cache or database
 * @typedef {Object} TokenInfo
 * @property {string} [refreshToken] - The refresh token
 * @property {string} [accessToken] - The access token
 * @property {number} [tokenExpiresAt] - Token expiration timestamp
 * @property {string} [teamId] - Slack team ID
 */

/**
 * Result of token refresh operation
 * @typedef {Object} TokenRefreshResult
 * @property {boolean} success - Whether the refresh was successful
 * @property {string} [accessToken] - The new access token if successful
 * @property {string} [refreshToken] - The refresh token (new or existing)
 * @property {number} [expiresIn] - Token lifetime in seconds
 * @property {string} [scope] - Token scope
 * @property {string} [teamId] - Slack team ID
 * @property {TokenRefreshError} [error] - Error object if refresh failed
 * @property {string} method - Method used for refresh (oauth_service or direct_oauth)
 * @property {TokenRefreshMetadata} [metadata] - Additional metadata for successful refresh
 * @property {TokenRefreshErrorInfo} [errorInfo] - Error information for failed refresh
 */

/**
 * Token refresh error object
 * @typedef {Object} TokenRefreshError
 * @property {string} message - Error message
 * @property {string} [errorType] - Error type classification
 * @property {string} [originalError] - Original error message
 * @property {string} name - Error name for compatibility with Error interface
 */

/**
 * Metadata for successful token refresh
 * @typedef {Object} TokenRefreshMetadata
 * @property {number} expiresIn - Token lifetime in seconds
 * @property {string} [scope] - Token scope
 * @property {string} [teamId] - Slack team ID
 * @property {number} responseTime - Operation response time in milliseconds
 * @property {string} method - Method used for refresh
 */

/**
 * Error information for failed token refresh
 * @typedef {Object} TokenRefreshErrorInfo
 * @property {TokenRefreshError} error - The error object
 * @property {string} method - Method used for refresh
 * @property {number} responseTime - Operation response time in milliseconds
 * @property {string} originalError - Original error message
 * @property {string} userId - Associated user ID
 */

/**
 * Result of authentication error handling
 * @typedef {Object} AuthErrorResult
 * @property {boolean} requiresReauth - Whether re-authentication is required
 * @property {string} error - Error message
 * @property {string} [errorCode] - Error code
 * @property {string} instanceId - The instance ID
 */

/**
 * Result of instance validation
 * @typedef {Object} InstanceValidationResult
 * @property {boolean} isValid - Whether the instance is valid
 * @property {void} [errorResponse] - Error response object if validation fails
 */

/**
 * Metadata for audit log entries
 * @typedef {Object} AuditLogMetadata
 * @property {number} [expiresIn] - Token lifetime in seconds
 * @property {string} [scope] - Token scope
 * @property {string} [teamId] - Slack team ID
 * @property {number} [responseTime] - Operation response time in milliseconds
 * @property {string} [originalError] - Original error message
 * @property {boolean} [hasRefreshToken] - Whether refresh token was available
 * @property {boolean} [hasAccessToken] - Whether access token was available
 * @property {boolean|string} [tokenExpired] - Whether token was expired
 * @property {string} [tokenSource] - Source of the token (cache, database)
 * @property {string} [method] - Method used for the operation
 */

/**
 * Extended Express Request object with custom properties
 * @typedef {import('express').Request & {
 *   bearerToken?: string,
 *   instanceId?: string,
 *   userId?: string,
 *   teamId?: string
 * }} ExpressRequest
 */

/**
 * Express Response object  
 * @typedef {import('express').Response} ExpressResponse
 */

/**
 * Express Next function
 * @typedef {function(): void} ExpressNext
 */

/**
 * OAuth token refresh options
 * @typedef {Object} TokenRefreshOptions
 * @property {string} refreshToken - The refresh token
 * @property {string} clientId - OAuth client ID
 * @property {string} clientSecret - OAuth client secret
 */

/**
 * New OAuth tokens from refresh response
 * @typedef {Object} NewOAuthTokens
 * @property {string} access_token - The new access token
 * @property {string} [refresh_token] - The new refresh token (optional)
 * @property {number} expires_in - Token lifetime in seconds
 * @property {string} [scope] - Token scope
 * @property {string} [team_id] - Slack team ID
 */

/**
 * Slack API team object
 * @typedef {Object} SlackTeam
 * @property {string} id - Team ID
 * @property {string} name - Team name
 * @property {string} [domain] - Team domain
 * @property {string} [email_domain] - Team email domain
 * @property {Object} [icon] - Team icon object
 * @property {string} [enterprise_id] - Enterprise ID if part of enterprise
 * @property {string} [enterprise_name] - Enterprise name if part of enterprise
 * @property {string} [avatar_base_url] - Base URL for team avatars
 * @property {boolean} [is_verified] - Whether team is verified
 * @property {string} [discovery_setting] - Team discovery setting
 */

/**
 * Token audit log entry
 * @typedef {Object} TokenAuditLogEntry
 * @property {string} instanceId - The instance ID
 * @property {string} operation - Operation type (refresh, validate, etc.)
 * @property {string} status - Operation status (success, failure)
 * @property {string} method - Method used
 * @property {string} [errorType] - Error type if applicable
 * @property {string} [errorMessage] - Error message if applicable
 * @property {string} userId - The user ID
 * @property {AuditLogMetadata} metadata - Additional metadata
 */

// TypeScript declarations - no exports needed
// Export empty object to make this a valid module
module.exports = {};