/**
 * @fileoverview Type definitions for Dropbox MCP middleware
 * JSDoc type definitions for OAuth authentication and token management
 */

/**
 * OAuth token refresh options
 * @typedef {Object} TokenRefreshOptions
 * @property {string} refreshToken - The refresh token
 * @property {string} clientId - OAuth client ID
 * @property {string} clientSecret - OAuth client secret
 */

/**
 * New OAuth tokens received from refresh
 * @typedef {Object} NewOAuthTokens
 * @property {string} access_token - New access token
 * @property {string} [refresh_token] - New refresh token (if provided)
 * @property {number} expires_in - Token expiration in seconds
 * @property {string} [scope] - Token scope
 */

/**
 * Token refresh error information
 * @typedef {Object} TokenRefreshError
 * @property {string} message - Error message
 * @property {string} errorType - Error type classification
 * @property {string} originalError - Original error details
 * @property {string} name - Error name
 */

/**
 * Token refresh result
 * @typedef {Object} TokenRefreshResult
 * @property {boolean} success - Whether refresh was successful
 * @property {string} [accessToken] - New access token
 * @property {string} [refreshToken] - New refresh token
 * @property {number} [expiresIn] - Token expiration in seconds
 * @property {string} [scope] - Token scope
 * @property {TokenRefreshError} [error] - Error information if failed
 * @property {string} method - Method used for refresh ('oauth_service' | 'direct_oauth')
 * @property {TokenRefreshMetadata} [metadata] - Additional metadata for successful refresh
 * @property {TokenRefreshErrorInfo} [errorInfo] - Additional error info for failed refresh
 */

/**
 * Token refresh metadata for successful operations
 * @typedef {Object} TokenRefreshMetadata
 * @property {number} expiresIn - Token expiration in seconds
 * @property {string} scope - Token scope
 * @property {number} responseTime - Refresh operation duration in ms
 * @property {string} method - Method used for refresh
 */

/**
 * Token refresh error information for failed operations
 * @typedef {Object} TokenRefreshErrorInfo
 * @property {TokenRefreshError} error - The error that occurred
 * @property {string} method - Method used for refresh
 * @property {number} responseTime - Refresh operation duration in ms
 * @property {string} originalError - Original error message
 * @property {string} userId - User ID
 */

/**
 * Database instance record
 * @typedef {Object} DatabaseInstance
 * @property {string} instance_id - Instance ID
 * @property {string} user_id - User ID
 * @property {string} client_id - OAuth client ID
 * @property {string} client_secret - OAuth client secret
 * @property {string} [access_token] - Current access token
 * @property {string} [refresh_token] - Current refresh token
 * @property {Date} [token_expires_at] - Token expiration date
 * @property {string} [scope] - Token scope
 * @property {string} oauth_status - OAuth status ('pending' | 'completed' | 'failed')
 */

/**
 * Express request object with authentication data
 * @typedef {Object} ExpressRequest
 * @property {string} instanceId - Instance ID from middleware
 * @property {string} [bearerToken] - Bearer token from middleware
 * @property {string} [userId] - User ID from middleware
 * @property {Object} params - Express params
 * @property {Object} body - Express body
 * @property {Object} headers - Express headers
 */

/**
 * Authentication error result
 * @typedef {Object} AuthErrorResult
 * @property {boolean} requiresReauth - Whether re-authentication is required
 * @property {string} errorType - Error type classification
 * @property {string} message - Error message for user
 * @property {number} statusCode - HTTP status code to return
 */

/**
 * Cached credential entry
 * @typedef {Object} CachedCredential
 * @property {string} bearerToken - OAuth access token
 * @property {string} refreshToken - OAuth refresh token
 * @property {number} expiresAt - Token expiration timestamp
 * @property {string} user_id - Owner user ID
 * @property {number} last_used - Last access timestamp
 * @property {number} refresh_attempts - Failed refresh counter
 * @property {number} cached_at - Cache creation time
 * @property {number} last_modified - Last update time
 * @property {string} status - Instance status
 */

/**
 * Cache statistics
 * @typedef {Object} CacheStatistics
 * @property {number} totalEntries - Total cached entries
 * @property {number} validEntries - Valid (non-expired) entries
 * @property {number} expiredEntries - Expired entries
 * @property {number} hitRate - Cache hit rate percentage
 * @property {number} totalHits - Total cache hits
 * @property {number} totalMisses - Total cache misses
 * @property {string} lastCleanup - Last cleanup timestamp
 */

/**
 * Watcher statistics
 * @typedef {Object} WatcherStatistics
 * @property {boolean} isRunning - Whether watcher is running
 * @property {number} lastRun - Last run timestamp
 * @property {number} totalRuns - Total number of runs
 * @property {number} successfulRefreshes - Successful token refreshes
 * @property {number} failedRefreshes - Failed token refreshes
 * @property {number} cleanedUpEntries - Cleaned up invalid entries
 */

/**
 * Session statistics
 * @typedef {Object} SessionStatistics
 * @property {number} totalSessions - Total active sessions
 * @property {number} cleanupIntervalMs - Cleanup interval in milliseconds
 * @property {boolean} cleanupEnabled - Whether cleanup is enabled
 * @property {string} lastCleanup - Last cleanup timestamp
 */

module.exports = {}; // Make this a module