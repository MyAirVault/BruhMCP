/**
 * @fileoverview Type definitions for Notion MCP middleware modules
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
 * @property {string} mcp_service_name - Service name
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
 * @property {string[]} [scopes] - OAuth scopes
 */

/**
 * Token refresh error object
 * @typedef {Object} TokenRefreshError
 * @property {string} message - Error message
 * @property {string} errorType - Error type classification
 * @property {string} originalError - Original error message
 * @property {string} name - Error name
 */

/**
 * Token refresh result object
 * @typedef {Object} TokenRefreshResult
 * @property {boolean} success - Whether refresh was successful
 * @property {Object} [metadata] - Success metadata
 * @property {string} [metadata.method] - Method used for refresh
 * @property {number} [metadata.duration] - Time taken in ms
 * @property {TokenRefreshError} [error] - Error information
 * @property {Object} [errorInfo] - Additional error context
 * @property {string} [errorInfo.method] - Method that failed
 */

/**
 * Express request with authentication data
 * @typedef {import('express').Request & {
 *   instanceId?: string,
 *   bearerToken?: string,
 *   userId?: string,
 *   params: { instanceId: string }
 * }} ExpressRequest
 */

/**
 * Express response object
 * @typedef {import('express').Response} ExpressResponse
 */

/**
 * Express next function
 * @typedef {import('express').NextFunction} ExpressNext
 */

/**
 * Instance validation result
 * @typedef {Object} InstanceValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {any} [errorResponse] - Error response if validation failed
 */

/**
 * New tokens from refresh operation
 * @typedef {Object} NewTokens
 * @property {string} access_token - New access token
 * @property {string} [refresh_token] - New refresh token
 * @property {number} expires_in - Token expiration in seconds
 */

/**
 * Error handling result
 * @typedef {Object} ErrorHandlingResult
 * @property {boolean} requiresReauth - Whether re-authentication is required
 * @property {string} message - Error message
 * @property {string} [redirectUrl] - OAuth redirect URL if re-auth needed
 */

export {};