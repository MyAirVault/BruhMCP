export default ApiKeyCoordinator;
export type AuthCredentials = import("../types/auth-types.js").AuthCredentials;
export type ValidationResult = import("../types/auth-types.js").ValidationResult;
export type ServiceConfig = import("../types/auth-types.js").ServiceConfig;
export type InstanceCreationData = import("../types/auth-types.js").InstanceCreationData;
export type CredentialValidator = import("../types/auth-types.js").CredentialValidator;
export type AuditLogMetadata = import("../types/auth-types.js").AuditLogMetadata;
export type InstanceMetadata = import("../types/auth-types.js").InstanceMetadata;
export type ValidatorConstructor = Function;
export type ApiKeyCreationResult = {
    /**
     * - Whether instance creation was successful
     */
    success: boolean;
    /**
     * - Created instance ID if successful
     */
    instanceId?: string | undefined;
    /**
     * - Error message if creation failed
     */
    error?: string | undefined;
    /**
     * - User information from validation
     */
    userInfo?: Object | undefined;
};
/**
 * @typedef {import('../types/auth-types.js').AuthCredentials} AuthCredentials
 * @typedef {import('../types/auth-types.js').ValidationResult} ValidationResult
 * @typedef {import('../types/auth-types.js').ServiceConfig} ServiceConfig
 * @typedef {import('../types/auth-types.js').InstanceCreationData} InstanceCreationData
 * @typedef {import('../types/auth-types.js').CredentialValidator} CredentialValidator
 * @typedef {import('../types/auth-types.js').AuditLogMetadata} AuditLogMetadata
 * @typedef {import('../types/auth-types.js').InstanceMetadata} InstanceMetadata
 * @typedef {function} ValidatorConstructor
 */
/**
 * @typedef {Object} ApiKeyCreationResult
 * @property {boolean} success - Whether instance creation was successful
 * @property {string} [instanceId] - Created instance ID if successful
 * @property {string} [error] - Error message if creation failed
 * @property {Object} [userInfo] - User information from validation
 */
/**
 * API Key Coordinator Class
 * Manages API key validation and instance creation for non-OAuth services
 */
declare class ApiKeyCoordinator {
    /** @type {Map<string, ServiceConfig>} */
    services: Map<string, ServiceConfig>;
    /**
     * Registers a service with the API key coordinator
     * @param {ServiceConfig} serviceConfig - Service configuration
     * @returns {void}
     */
    registerService(serviceConfig: ServiceConfig): void;
    /**
     * Validates API key credentials for a service
     * @param {string} serviceName - Name of the service
     * @param {AuthCredentials} credentials - API key credentials to validate
     * @returns {Promise<ValidationResult>} Validation result
     */
    validateCredentials(serviceName: string, credentials: AuthCredentials): Promise<ValidationResult>;
    /**
     * Validates credentials and creates MCP instance in one step
     * @param {string} serviceName - Name of the service
     * @param {InstanceCreationData} creationData - Instance creation data
     * @returns {Promise<ApiKeyCreationResult>} Creation result
     */
    validateAndCreateInstance(serviceName: string, creationData: InstanceCreationData): Promise<ApiKeyCreationResult>;
    /**
     * Creates MCP instance in database
     * @param {InstanceCreationData} instanceData - Instance data
     * @returns {Promise<{id: string}>} Created instance
     */
    createInstance(instanceData: InstanceCreationData): Promise<{
        id: string;
    }>;
    /**
     * Creates audit log entry
     * @param {string} instanceId - MCP instance ID (empty string for failures)
     * @param {string} operation - Operation type
     * @param {string} status - Operation status
     * @param {AuditLogMetadata} metadata - Additional metadata
     * @returns {Promise<void>}
     */
    createAuditLog(instanceId: string, operation: string, status: string, metadata?: AuditLogMetadata): Promise<void>;
    /**
     * Validates required fields for a service
     * @param {string} serviceName - Name of the service
     * @param {AuthCredentials} credentials - Credentials to validate
     * @returns {ValidationResult} Field validation result
     */
    validateRequiredFields(serviceName: string, credentials: AuthCredentials): ValidationResult;
    /**
     * Validates individual credential field format
     * @param {string} fieldName - Name of the field
     * @param {string} fieldValue - Value to validate
     * @returns {ValidationResult} Field validation result
     */
    validateCredentialField(fieldName: string, fieldValue: string): ValidationResult;
    /**
     * Gets list of registered API key services
     * @returns {Array<string>} Array of service names
     */
    getRegisteredServices(): Array<string>;
    /**
     * Checks if a service is registered
     * @param {string} serviceName - Name of the service
     * @returns {boolean} True if service is registered
     */
    hasService(serviceName: string): boolean;
    /**
     * Gets service configuration
     * @param {string} serviceName - Name of the service
     * @returns {ServiceConfig|null} Service configuration or null if not found
     */
    getServiceConfig(serviceName: string): ServiceConfig | null;
}
//# sourceMappingURL=apikey-coordinator.d.ts.map