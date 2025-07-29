/**
 * @fileoverview Type definitions for Google Drive OAuth middleware
 */

/**
 * @typedef {Object} OAuthTokens
 * @property {string} access_token - OAuth access token
 * @property {string} [refresh_token] - OAuth refresh token
 * @property {number} expires_in - Token expiration time in seconds
 * @property {string} [scope] - OAuth scopes
 */

/**
 * @typedef {Object} CachedCredential
 * @property {string} bearerToken - OAuth access token
 * @property {string} [refreshToken] - OAuth refresh token  
 * @property {number} expiresAt - Unix timestamp when token expires
 * @property {string} user_id - UUID of the user
 * @property {number} last_used - Unix timestamp of last use
 * @property {number} refresh_attempts - Number of refresh attempts
 * @property {number} cached_at - Unix timestamp when cached
 * @property {number} last_modified - Unix timestamp of last modification
 * @property {string} status - Instance status
 */

/**
 * @typedef {Object} DatabaseInstance
 * @property {string} instance_id - UUID of the instance
 * @property {string} user_id - UUID of the user
 * @property {string} service_name - Service name (googledrive)
 * @property {string} client_id - OAuth client ID
 * @property {string} client_secret - OAuth client secret
 * @property {string} [bearer_token] - OAuth access token
 * @property {string} [refresh_token] - OAuth refresh token
 * @property {number} [bearer_token_expires_at] - Unix timestamp when bearer token expires
 * @property {string} status - Instance status (active/inactive)
 * @property {string} oauth_status - OAuth status (pending/completed)
 * @property {boolean} service_active - Whether service is active
 * @property {string} [instance_name] - Instance display name
 * @property {Date} last_accessed - Last access timestamp
 * @property {number} [expires_at] - Token expiration timestamp
 */

/**
 * @typedef {Object} TokenRefreshResult
 * @property {boolean} success - Whether refresh was successful
 * @property {OAuthTokens} [tokens] - New tokens if successful
 * @property {string} [error] - Error message if failed
 * @property {boolean} [requiresReauth] - Whether re-authentication is required
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {any} [errorResponse] - Error response if validation failed
 */

/**
 * @typedef {import('express').Request & {
 *   instanceId?: string,
 *   userId?: string,
 *   bearerToken?: string,
 *   params: { instanceId?: string }
 * }} ExpressRequest
 */

/**
 * @typedef {import('express').Response} ExpressResponse
 */

/**
 * @typedef {import('express').NextFunction} ExpressNext
 */

// TypeScript declarations - no exports needed
module.exports = {};