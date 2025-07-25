/**
 * @fileoverview Type definitions for MCP Auth Registry service functions and responses
 */


/**
 * @typedef {Object} ValidationResult
 * @property {boolean} success - Whether validation succeeded
 * @property {string} message - Human readable message
 * @property {Object} [data] - Optional additional data
 */


/**
 * @typedef {Object} InstanceResult  
 * @property {boolean} success - Whether instance creation succeeded
 * @property {string} [instanceId] - Created instance ID
 * @property {string} message - Human readable message
 * @property {Object} [data] - Optional instance data
 */


/**
 * @typedef {Object} OAuthResult
 * @property {boolean} success - Whether OAuth initiation succeeded
 * @property {string} [authUrl] - OAuth authorization URL
 * @property {string} [state] - OAuth state parameter
 * @property {string} [instanceId] - Instance ID for the OAuth flow
 * @property {string} [userId] - User ID for the OAuth flow
 * @property {string} message - Human readable message
 */


/**
 * @typedef {Object} RevokeResult
 * @property {boolean} success - Whether revocation succeeded
 * @property {string} message - Human readable message
 */


/**
 * @typedef {'apikey' | 'oauth' | 'hybrid'} ServiceType
 */


/**
 * @typedef {Object.<string, Function>} ServiceFunctions - Dynamic collection of service functions
 */


/**
 * @typedef {Object} ServiceRegistryEntry
 * @property {ServiceType} type - Service authentication type
 * @property {ServiceFunctions} functions - Available service functions
 * @property {string} path - Service directory path
 * @property {boolean} isActive - Whether service is available
 */


/**
 * @typedef {Object.<string, ServiceRegistryEntry>} ServiceRegistryMap
 */


/**
 * @typedef {Object} CredentialsData
 * @property {string} [apiKey] - API key for API key services
 * @property {string} [apiToken] - API token for token-based services
 * @property {string} [clientId] - OAuth client ID
 * @property {string} [clientSecret] - OAuth client secret
 * @property {Object} [additionalData] - Additional service-specific data
 */


/**
 * @typedef {Object} InstanceData
 * @property {CredentialsData} credentials - Service credentials
 * @property {string} [customName] - Custom instance name
 * @property {Object} [metadata] - Additional instance metadata
 */


/**
 * @typedef {Object} ServiceError
 * @property {string} code - Error code
 * @property {string} message - Error message
 * @property {string} [serviceName] - Service that caused the error
 * @property {string} [functionName] - Function that caused the error
 * @property {Error} [originalError] - Original error object
 */


// Export an empty object to make this a proper ES module
export {};