// @ts-check
/**
 * @fileoverview Type definitions for Google Sheets middleware
 * Provides JSDoc type definitions for middleware components
 */

/**
 * @typedef {import('express').Request} ExpressRequest
 * @typedef {import('express').Response} ExpressResponse
 * @typedef {import('express').NextFunction} ExpressNext
 */

/**
 * @typedef {Object} DatabaseInstance
 * @property {string} instance_id - Instance UUID
 * @property {string} user_id - User UUID
 * @property {string} mcp_service_name - Service name
 * @property {string} auth_type - Authentication type (oauth)
 * @property {string} [client_id] - OAuth client ID
 * @property {string} [client_secret] - OAuth client secret
 * @property {string} [access_token] - OAuth access token
 * @property {string} [refresh_token] - OAuth refresh token
 * @property {Date|string|null} [token_expires_at] - Token expiration date
 * @property {string} oauth_status - OAuth status (pending, completed, failed)
 * @property {string} status - Instance status (active, inactive, expired)
 * @property {Date|string|null} [expires_at] - Instance expiration date
 * @property {boolean} service_active - Whether service is active
 * @property {string} [scope] - OAuth scopes
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Update timestamp
 */

/**
 * @typedef {Object} CachedCredential
 * @property {string} bearerToken - OAuth access token
 * @property {string} [refreshToken] - OAuth refresh token
 * @property {number} expiresAt - Token expiration timestamp
 * @property {string} user_id - User UUID
 * @property {Date} [last_used] - Last used timestamp
 * @property {number} [refresh_attempts] - Number of refresh attempts
 * @property {Date} [cached_at] - Cache creation timestamp
 * @property {Date} [last_modified] - Last modification timestamp
 * @property {string} [status] - Instance status
 */

/**
 * @typedef {Object} TokenInfo
 * @property {string|undefined} refreshToken - Refresh token
 * @property {string|undefined} accessToken - Access token
 * @property {number|null} tokenExpiresAt - Token expiration timestamp
 */

/**
 * @typedef {Object} RefreshResult
 * @property {boolean} success - Whether refresh was successful
 * @property {string} [method] - Method used (oauth_service or direct_oauth)
 * @property {Object} [error] - Error details if failed
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {import('../types/index.js').ErrorResponse} [errorResponse] - Error response if validation failed
 */

/**
 * @typedef {Object} OAuthTokens
 * @property {string} access_token - New access token
 * @property {string} [refresh_token] - New refresh token (optional)
 * @property {number} expires_in - Token lifetime in seconds
 * @property {string} [scope] - Token scopes
 */

export {};