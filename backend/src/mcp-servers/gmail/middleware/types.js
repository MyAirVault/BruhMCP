/**
 * @fileoverview Type definitions for Gmail MCP middleware modules
 * All types are properly defined with JSDoc for TypeScript compatibility
 */

/**
 * Cached credential object stored in memory
 * @typedef {Object} CachedCredential
 * @property {string} bearerToken - The access token
 * @property {string} refreshToken - The refresh token
 * @property {number} expiresAt - Token expiration timestamp
 * @property {string} user_id - Associated user ID
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
 * Gmail API message header
 * @typedef {Object} GmailHeader
 * @property {string} name - Header name
 * @property {string} value - Header value
 */

/**
 * Gmail API message body
 * @typedef {Object} GmailMessageBody
 * @property {string} [attachmentId] - Attachment ID if this is an attachment
 * @property {number} [size] - Size in bytes
 * @property {string} [data] - Base64 encoded data
 */

/**
 * Gmail API message part
 * @typedef {Object} GmailMessagePart
 * @property {string} [partId] - Part ID
 * @property {string} [mimeType] - MIME type
 * @property {string} [filename] - Filename for attachments
 * @property {GmailHeader[]} [headers] - Headers
 * @property {GmailMessageBody} [body] - Body data
 * @property {GmailMessagePart[]} [parts] - Sub-parts for multipart messages
 */

/**
 * Gmail API message payload
 * @typedef {Object} GmailMessagePayload
 * @property {string} [partId] - Part ID
 * @property {string} [mimeType] - MIME type
 * @property {string} [filename] - Filename
 * @property {GmailHeader[]} [headers] - Headers
 * @property {GmailMessageBody} [body] - Body data
 * @property {GmailMessagePart[]} [parts] - Parts for multipart messages
 */

/**
 * Gmail API message object
 * @typedef {Object} GmailMessage
 * @property {string} id - Message ID
 * @property {string} threadId - Thread ID
 * @property {string[]} [labelIds] - Label IDs
 * @property {string} [snippet] - Message snippet
 * @property {string} [raw] - Raw message data
 * @property {number} [sizeEstimate] - Size estimate
 * @property {string} [internalDate] - Internal date
 * @property {GmailMessagePayload} [payload] - Message payload
 */

/**
 * Gmail API thread object
 * @typedef {Object} GmailThread
 * @property {string} id - Thread ID
 * @property {string} [snippet] - Thread snippet
 * @property {string} [historyId] - History ID
 * @property {GmailMessage[]} [messages] - Messages in thread
 */

/**
 * Gmail API draft object
 * @typedef {Object} GmailDraft
 * @property {string} id - Draft ID
 * @property {GmailMessage} message - Draft message
 */

/**
 * Gmail API attachment info
 * @typedef {Object} GmailAttachmentInfo
 * @property {string} filename - Attachment filename
 * @property {string} mimeType - MIME type
 * @property {number} size - Size in bytes
 * @property {string} attachmentId - Attachment ID
 * @property {string} partId - Part ID
 */

/**
 * Gmail API error response structure
 * @typedef {Object} GmailApiError
 * @property {string} code - Error code
 * @property {string} message - Error message
 * @property {string} [status] - HTTP status
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
 */

/**
 * Result of token refresh operation
 * @typedef {Object} TokenRefreshResult
 * @property {boolean} success - Whether the refresh was successful
 * @property {string} [accessToken] - The new access token if successful
 * @property {string} [refreshToken] - The refresh token (new or existing)
 * @property {number} [expiresIn] - Token lifetime in seconds
 * @property {string} [scope] - Token scope
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
 *   userId?: string
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

module.exports = {};