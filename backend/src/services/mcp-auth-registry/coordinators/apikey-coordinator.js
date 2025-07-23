/**
 * @fileoverview API Key Authentication Coordinator
 * Coordinates API key validation and instance creation for API-based services
 */

const { createMCPInstance } = require('../../../db/queries/mcpInstances/creation.js');
const { createTokenAuditLog } = require('../../../db/queries/mcpInstances/audit.js');

/**
 * @typedef {import('../types/auth-types.js').AuthCredentials} AuthCredentials
 * @typedef {import('../types/auth-types.js').ValidationResult} ValidationResult
 * @typedef {import('../types/auth-types.js').ServiceConfig} ServiceConfig
 * @typedef {import('../types/auth-types.js').InstanceCreationData} InstanceCreationData
 * @typedef {import('../types/auth-types.js').CredentialValidator} CredentialValidator
 * @typedef {import('../types/auth-types.js').AuditLogMetadata} AuditLogMetadata
 * @typedef {import('../types/auth-types.js').InstanceMetadata} InstanceMetadata
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
class ApiKeyCoordinator {
    constructor() {
        /** @type {Map<string, ServiceConfig>} */
        this.services = new Map();
    }

    /**
     * Registers a service with the API key coordinator
     * @param {ServiceConfig} serviceConfig - Service configuration
     * @returns {void}
     */
    registerService(serviceConfig) {
        if (serviceConfig.type !== 'apikey') {
            throw new Error(`Service ${serviceConfig.name} is not an API key service`);
        }

        this.services.set(serviceConfig.name, serviceConfig);
        console.log(`🔑 API key coordinator registered: ${serviceConfig.name}`);
    }

    /**
     * Validates API key credentials for a service
     * @param {string} serviceName - Name of the service
     * @param {AuthCredentials} credentials - API key credentials to validate
     * @returns {Promise<ValidationResult>} Validation result
     */
    async validateCredentials(serviceName, credentials) {
        const service = this.services.get(serviceName);
        if (!service) {
            return {
                isValid: false,
                error: `API key service ${serviceName} not found`
            };
        }

        try {
            console.log(`🔑 Validating API key credentials for ${serviceName}`);
            
            // Get validator instance
            /** @type {CredentialValidator} */
            let validator;
            
            if (typeof service.validator === 'function' && service.validator.prototype) {
                // Validator is a constructor function - use type assertion for dynamic constructor
                const ValidatorClass = /** @type {unknown} */ (service.validator);
                validator = /** @type {CredentialValidator} */ (new (/** @type {new() => CredentialValidator} */ (ValidatorClass))());
            } else {
                // Validator is already an instance or factory function
                validator = /** @type {CredentialValidator} */ (service.validator);
            }

            // Ensure validator has validateCredentials method
            if (!validator || typeof validator.validateCredentials !== 'function') {
                throw new Error(`Invalid validator for service ${serviceName}`);
            }

            // Call validation method
            const result = await validator.validateCredentials(credentials);
            
            console.log(`🔑 API key validation result for ${serviceName}: ${result.isValid ? 'valid' : 'invalid'}`);
            return result;
        } catch (error) {
            console.error(`API key validation error for ${serviceName}:`, error);
            return {
                isValid: false,
                error: `API key validation failed: ${error.message}`
            };
        }
    }

    /**
     * Validates credentials and creates MCP instance in one step
     * @param {string} serviceName - Name of the service
     * @param {InstanceCreationData} creationData - Instance creation data
     * @returns {Promise<ApiKeyCreationResult>} Creation result
     */
    async validateAndCreateInstance(serviceName, creationData) {
        const service = this.services.get(serviceName);
        if (!service) {
            return {
                success: false,
                error: `API key service ${serviceName} not found`
            };
        }

        try {
            console.log(`🏗️  Validating and creating instance for ${serviceName}`);

            // Step 1: Validate credentials
            const validationResult = await this.validateCredentials(serviceName, creationData.credentials);
            
            if (!validationResult.isValid) {
                console.error(`❌ Credential validation failed for ${serviceName}: ${validationResult.error}`);
                return {
                    success: false,
                    error: validationResult.error
                };
            }

            // Step 2: Create MCP instance
            /** @type {InstanceMetadata} */
            const metadata = {
                userInfo: validationResult.userInfo,
                authType: 'apikey',
                validatedAt: new Date().toISOString(),
                userEmail: creationData.metadata?.userEmail,
                createdVia: creationData.metadata?.createdVia || 'api'
            };

            const instanceData = {
                serviceName,
                userId: creationData.userId,
                credentials: creationData.credentials,
                metadata
            };

            const instance = await this.createInstance(instanceData);

            // Step 3: Create audit log
            await this.createAuditLog(instance.id, 'instance_creation', 'success', {
                service: serviceName,
                method: 'apikey_validation',
                authType: 'apikey'
            });

            console.log(`✅ Instance created successfully for ${serviceName}: ${instance.id}`);

            return {
                success: true,
                instanceId: instance.id,
                userInfo: validationResult.userInfo
            };
        } catch (error) {
            console.error(`Instance creation failed for ${serviceName}:`, error);

            // Create audit log for failure
            try {
                await this.createAuditLog('', 'instance_creation', 'failure', {
                    service: serviceName,
                    error: error instanceof Error ? error.message : String(error),
                    authType: 'apikey'
                });
            } catch (auditError) {
                console.error('Failed to create audit log for failed instance creation:', auditError);
            }

            return {
                success: false,
                error: `Instance creation failed: ${error.message}`
            };
        }
    }

    /**
     * Creates MCP instance in database
     * @param {InstanceCreationData} instanceData - Instance data
     * @returns {Promise<{id: string}>} Created instance
     */
    async createInstance(instanceData) {
        try {
            const createData = {
                service_name: instanceData.serviceName,
                user_id: instanceData.userId,
                credentials: instanceData.credentials,
                oauth_status: 'completed', // API key services are immediately authenticated
                status: 'active',
                metadata: instanceData.metadata,
                created_at: new Date(),
                updated_at: new Date()
            };

            const instance = await createMCPInstance(createData);
            console.log(`📝 Created MCP instance: ${instance.id} for service: ${instanceData.serviceName}`);
            
            return instance;
        } catch (error) {
            console.error('Failed to create MCP instance in database:', error);
            throw error;
        }
    }

    /**
     * Creates audit log entry
     * @param {string} instanceId - MCP instance ID (empty string for failures)
     * @param {string} operation - Operation type
     * @param {string} status - Operation status
     * @param {AuditLogMetadata} metadata - Additional metadata
     * @returns {Promise<void>}
     */
    async createAuditLog(instanceId, operation, status, metadata = {}) {
        try {
            await createTokenAuditLog({
                instanceId,
                operation,
                status,
                method: metadata.method || 'apikey_coordinator',
                service: metadata.service,
                error: metadata.error,
                authType: metadata.authType,
                timestamp: new Date()
            });
        } catch (error) {
            console.error(`Failed to create audit log for instance ${instanceId}:`, error);
            // Don't throw - audit logging shouldn't break the flow
        }
    }

    /**
     * Validates required fields for a service
     * @param {string} serviceName - Name of the service
     * @param {AuthCredentials} credentials - Credentials to validate
     * @returns {ValidationResult} Field validation result
     */
    validateRequiredFields(serviceName, credentials) {
        const service = this.services.get(serviceName);
        if (!service) {
            return {
                isValid: false,
                error: `Service ${serviceName} not found`
            };
        }

        const { requiredFields } = service;

        // Check if at least one required field is present
        const hasRequiredField = requiredFields.some(field => {
            const value = credentials[/** @type {keyof AuthCredentials} */ (field)];
            return value && typeof value === 'string' && value.trim().length > 0;
        });

        if (!hasRequiredField) {
            return {
                isValid: false,
                error: `Missing required fields. Provide one of: ${requiredFields.join(', ')}`
            };
        }

        // Additional field-specific validation
        for (const field of requiredFields) {
            const value = credentials[/** @type {keyof AuthCredentials} */ (field)];
            if (value) {
                const fieldValidation = this.validateCredentialField(field, String(value));
                if (!fieldValidation.isValid) {
                    return fieldValidation;
                }
            }
        }

        return { isValid: true };
    }

    /**
     * Validates individual credential field format
     * @param {string} fieldName - Name of the field
     * @param {string} fieldValue - Value to validate
     * @returns {ValidationResult} Field validation result
     */
    validateCredentialField(fieldName, fieldValue) {
        if (!fieldValue || typeof fieldValue !== 'string') {
            return {
                isValid: false,
                error: `${fieldName} must be a non-empty string`
            };
        }

        const trimmedValue = fieldValue.trim();
        if (trimmedValue.length === 0) {
            return {
                isValid: false,
                error: `${fieldName} cannot be empty`
            };
        }

        // Basic length validation
        if (trimmedValue.length < 10) {
            return {
                isValid: false,
                error: `${fieldName} appears too short to be valid`
            };
        }

        if (trimmedValue.length > 500) {
            return {
                isValid: false,
                error: `${fieldName} appears too long to be valid`
            };
        }

        return { isValid: true };
    }

    /**
     * Gets list of registered API key services
     * @returns {Array<string>} Array of service names
     */
    getRegisteredServices() {
        return Array.from(this.services.keys());
    }

    /**
     * Checks if a service is registered
     * @param {string} serviceName - Name of the service
     * @returns {boolean} True if service is registered
     */
    hasService(serviceName) {
        return this.services.has(serviceName);
    }

    /**
     * Gets service configuration
     * @param {string} serviceName - Name of the service
     * @returns {ServiceConfig|null} Service configuration or null if not found
     */
    getServiceConfig(serviceName) {
        return this.services.get(serviceName) || null;
    }
}

module.exports = ApiKeyCoordinator;