export default OAuthCoordinator;
export type AuthCredentials = import("../types/auth-types.js").AuthCredentials;
export type OAuthFlowResult = import("../types/auth-types.js").OAuthFlowResult;
export type OAuthCallbackResult = import("../types/auth-types.js").OAuthCallbackResult;
export type ServiceConfig = import("../types/auth-types.js").ServiceConfig;
export type OAuthStatusUpdate = import("../types/auth-types.js").OAuthStatusUpdate;
export type CredentialValidator = import("../types/auth-types.js").CredentialValidator;
export type OAuthHandler = import("../types/auth-types.js").OAuthHandler;
export type AuditLogMetadata = import("../types/auth-types.js").AuditLogMetadata;
export type ValidatorConstructor = Function;
/**
 * @typedef {import('../types/auth-types.js').AuthCredentials} AuthCredentials
 * @typedef {import('../types/auth-types.js').OAuthFlowResult} OAuthFlowResult
 * @typedef {import('../types/auth-types.js').OAuthCallbackResult} OAuthCallbackResult
 * @typedef {import('../types/auth-types.js').ServiceConfig} ServiceConfig
 * @typedef {import('../types/auth-types.js').OAuthStatusUpdate} OAuthStatusUpdate
 * @typedef {import('../types/auth-types.js').CredentialValidator} CredentialValidator
 * @typedef {import('../types/auth-types.js').OAuthHandler} OAuthHandler
 * @typedef {import('../types/auth-types.js').AuditLogMetadata} AuditLogMetadata
 * @typedef {function} ValidatorConstructor
 */
/**
 * OAuth Flow Coordinator Class
 * Manages OAuth authentication flows for registered services
 */
declare class OAuthCoordinator {
    /** @type {Map<string, ServiceConfig>} */
    services: Map<string, ServiceConfig>;
    /**
     * Registers a service with the OAuth coordinator
     * @param {ServiceConfig} serviceConfig - Service configuration
     * @returns {void}
     */
    registerService(serviceConfig: ServiceConfig): void;
    /**
     * Validates OAuth credentials for a service
     * @param {string} serviceName - Name of the service
     * @param {AuthCredentials} credentials - OAuth credentials to validate
     * @returns {Promise<import('../types/auth-types.js').ValidationResult>} Validation result
     */
    validateCredentials(serviceName: string, credentials: AuthCredentials): Promise<import("../types/auth-types.js").ValidationResult>;
    /**
     * Initiates OAuth flow for a service
     * @param {string} serviceName - Name of the service
     * @param {string} instanceId - MCP instance ID
     * @param {AuthCredentials} credentials - OAuth credentials
     * @returns {Promise<OAuthFlowResult>} OAuth flow result with auth URL
     */
    initiateOAuthFlow(serviceName: string, instanceId: string, credentials: AuthCredentials): Promise<OAuthFlowResult>;
    /**
     * Handles OAuth callback processing
     * @param {string} serviceName - Name of the service
     * @param {string} code - OAuth authorization code
     * @param {string} state - OAuth state parameter
     * @returns {Promise<OAuthCallbackResult>} Callback processing result
     */
    handleOAuthCallback(serviceName: string, code: string, state: string): Promise<OAuthCallbackResult>;
    /**
     * Updates OAuth status in database
     * @param {string} instanceId - MCP instance ID
     * @param {OAuthStatusUpdate} statusUpdate - Status update data
     * @returns {Promise<void>}
     */
    updateOAuthStatusInDatabase(instanceId: string, statusUpdate: OAuthStatusUpdate): Promise<void>;
    /**
     * Creates audit log entry
     * @param {string} instanceId - MCP instance ID
     * @param {string} operation - Operation type
     * @param {string} status - Operation status
     * @param {AuditLogMetadata} metadata - Additional metadata
     * @returns {Promise<void>}
     */
    createAuditLog(instanceId: string, operation: string, status: string, metadata?: AuditLogMetadata): Promise<void>;
    /**
     * Extracts instance ID from OAuth state parameter
     * @param {string} state - OAuth state parameter
     * @returns {string|null} Instance ID or null if invalid
     */
    extractInstanceIdFromState(state: string): string | null;
    /**
     * Gets list of registered OAuth services
     * @returns {Array<string>} Array of service names
     */
    getRegisteredServices(): Array<string>;
    /**
     * Checks if a service is registered
     * @param {string} serviceName - Name of the service
     * @returns {boolean} True if service is registered
     */
    hasService(serviceName: string): boolean;
}
//# sourceMappingURL=oauth-coordinator.d.ts.map