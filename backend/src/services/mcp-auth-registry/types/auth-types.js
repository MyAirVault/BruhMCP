/**
 * @fileoverview Type definitions for MCP Auth Registry
 * @author MCP Auth Registry Team
 */

/**
 * @typedef {Object} AuthCredentials
 * @property {string} [client_id] - OAuth client ID (for OAuth services)
 * @property {string} [client_secret] - OAuth client secret (for OAuth services)
 * @property {string} [api_token] - API token (for API key services)
 * @property {string} [api_key] - API key (for API key services)
 * @property {Array<string>} [scopes] - OAuth scopes (for OAuth services)
 * @property {string} [key] - Generic credential key for flexible access
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether credentials are valid
 * @property {string} [error] - Error message if validation failed
 * @property {Object} [userInfo] - User information if validation successful
 * @property {string} [userInfo.id] - User ID
 * @property {string} [userInfo.email] - User email
 * @property {string} [userInfo.name] - User name
 * @property {string} [userInfo.handle] - User handle/username
 */

/**
 * @typedef {Object} OAuthFlowResult
 * @property {string} authUrl - OAuth authorization URL
 * @property {string} state - OAuth state parameter containing instanceId
 * @property {string} instanceId - MCP instance ID
 */

/**
 * @typedef {Object} OAuthCallbackResult
 * @property {boolean} success - Whether callback was successful
 * @property {string} [error] - Error message if callback failed
 * @property {Object} [tokens] - OAuth tokens if successful
 * @property {string} [tokens.access_token] - Access token
 * @property {string} [tokens.refresh_token] - Refresh token
 * @property {number} [tokens.expires_in] - Token expiration in seconds
 * @property {string} [tokens.scope] - Token scope
 */

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name - Service name
 * @property {'oauth'|'apikey'} type - Service authentication type
 * @property {Function} validator - Credential validator function
 * @property {Function} [oauthHandler] - OAuth handler (for OAuth services)
 * @property {Array<string>} requiredFields - Required credential fields
 */

/**
 * @typedef {Object} InstanceCreationData
 * @property {string} serviceName - Name of the service
 * @property {AuthCredentials} credentials - Service credentials
 * @property {string} userId - User ID creating the instance
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * @typedef {Object} OAuthStatusUpdate
 * @property {string} status - OAuth status ('pending'|'completed'|'failed'|'expired')
 * @property {string} [accessToken] - Access token (encrypted)
 * @property {string} [refreshToken] - Refresh token (encrypted)
 * @property {Date} [tokenExpiresAt] - Token expiration date
 * @property {string} [scope] - Token scope
 * @property {string} [error] - Error message if failed
 * @property {string} [errorMessage] - Detailed error message
 */

/**
 * @typedef {Object} AuthRegistryConfig
 * @property {string} servicesPath - Path to MCP services directory
 * @property {string} baseUrl - Base URL for callbacks
 * @property {boolean} autoDiscovery - Enable automatic service discovery
 * @property {number} [discoveryInterval] - Service discovery interval in ms
 */

module.exports = {
  // Export types for JSDoc usage - no runtime exports needed
};