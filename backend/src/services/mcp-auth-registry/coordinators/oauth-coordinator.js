/**
 * @fileoverview OAuth Flow Coordinator
 * Coordinates OAuth authentication flows between services and database
 */

const { updateOAuthStatus } = require('../../../db/queries/mcpInstances/oauth.js');
const { createTokenAuditLog } = require('../../../db/queries/mcpInstances/audit.js');

/**
 * @typedef {import('../types/auth-types.js').AuthCredentials} AuthCredentials
 * @typedef {import('../types/auth-types.js').OAuthFlowResult} OAuthFlowResult
 * @typedef {import('../types/auth-types.js').OAuthCallbackResult} OAuthCallbackResult
 * @typedef {import('../types/auth-types.js').ServiceConfig} ServiceConfig
 * @typedef {import('../types/auth-types.js').OAuthStatusUpdate} OAuthStatusUpdate
 * @typedef {import('../types/auth-types.js').CredentialValidator} CredentialValidator
 * @typedef {import('../types/auth-types.js').OAuthHandler} OAuthHandler
 * @typedef {import('../types/auth-types.js').AuditLogMetadata} AuditLogMetadata
 */

/**
 * OAuth Flow Coordinator Class
 * Manages OAuth authentication flows for registered services
 */
class OAuthCoordinator {
    constructor() {
        /** @type {Map<string, ServiceConfig>} */
        this.services = new Map();
    }

    /**
     * Registers a service with the OAuth coordinator
     * @param {ServiceConfig} serviceConfig - Service configuration
     * @returns {void}
     */
    registerService(serviceConfig) {
        if (serviceConfig.type !== 'oauth') {
            throw new Error(`Service ${serviceConfig.name} is not an OAuth service`);
        }

        if (!serviceConfig.oauthHandler) {
            throw new Error(`OAuth service ${serviceConfig.name} missing OAuth handler`);
        }

        this.services.set(serviceConfig.name, serviceConfig);
        console.log(`🔐 OAuth coordinator registered: ${serviceConfig.name}`);
    }

    /**
     * Validates OAuth credentials for a service
     * @param {string} serviceName - Name of the service
     * @param {AuthCredentials} credentials - OAuth credentials to validate
     * @returns {Promise<import('../types/auth-types.js').ValidationResult>} Validation result
     */
    async validateCredentials(serviceName, credentials) {
        const service = this.services.get(serviceName);
        if (!service) {
            return {
                isValid: false,
                error: `OAuth service ${serviceName} not found`
            };
        }

        try {
            console.log(`🔐 Validating OAuth credentials for ${serviceName}`);
            
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
            
            console.log(`🔐 OAuth validation result for ${serviceName}: ${result.isValid ? 'valid' : 'invalid'}`);
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`OAuth validation error for ${serviceName}:`, error);
            return {
                isValid: false,
                error: `OAuth validation failed: ${errorMessage}`
            };
        }
    }

    /**
     * Initiates OAuth flow for a service
     * @param {string} serviceName - Name of the service
     * @param {string} instanceId - MCP instance ID
     * @param {AuthCredentials} credentials - OAuth credentials
     * @returns {Promise<OAuthFlowResult>} OAuth flow result with auth URL
     */
    async initiateOAuthFlow(serviceName, instanceId, credentials) {
        const service = this.services.get(serviceName);
        if (!service) {
            throw new Error(`OAuth service ${serviceName} not found`);
        }

        try {
            console.log(`🚀 Initiating OAuth flow for ${serviceName}, instance: ${instanceId}`);

            // Update database to pending status
            await this.updateOAuthStatusInDatabase(instanceId, {
                status: 'pending'
            });

            // Create audit log
            await this.createAuditLog(instanceId, 'oauth_initiation', 'success', {
                service: serviceName,
                method: 'oauth_flow_start'
            });

            // Call service OAuth handler
            const oauthHandler = /** @type {OAuthHandler} */ (service.oauthHandler);
            if (!oauthHandler || typeof oauthHandler.initiateFlow !== 'function') {
                throw new Error(`Invalid OAuth handler for service ${serviceName}`);
            }
            const result = await oauthHandler.initiateFlow(instanceId, credentials);

            console.log(`✅ OAuth flow initiated for ${serviceName}: ${result.authUrl}`);
            return result;
        } catch (error) {
            console.error(`OAuth flow initiation failed for ${serviceName}:`, error);

            // Update status to failed
            await this.updateOAuthStatusInDatabase(instanceId, {
                status: 'failed',
                error: 'oauth_initiation_failed',
                errorMessage: error.message
            });

            // Create audit log
            await this.createAuditLog(instanceId, 'oauth_initiation', 'failure', {
                service: serviceName,
                error: error.message
            });

            throw error;
        }
    }

    /**
     * Handles OAuth callback processing
     * @param {string} serviceName - Name of the service
     * @param {string} code - OAuth authorization code
     * @param {string} state - OAuth state parameter
     * @returns {Promise<OAuthCallbackResult>} Callback processing result
     */
    async handleOAuthCallback(serviceName, code, state) {
        const service = this.services.get(serviceName);
        if (!service) {
            throw new Error(`OAuth service ${serviceName} not found`);
        }

        try {
            console.log(`🔄 Processing OAuth callback for ${serviceName}`);

            // Extract instance ID from state
            const instanceId = this.extractInstanceIdFromState(state);
            if (!instanceId) {
                throw new Error('Invalid OAuth state: missing instance ID');
            }

            // Call service OAuth handler
            const oauthHandler = /** @type {OAuthHandler} */ (service.oauthHandler);
            if (!oauthHandler || typeof oauthHandler.handleCallback !== 'function') {
                throw new Error(`Invalid OAuth handler for service ${serviceName}`);
            }
            const result = await oauthHandler.handleCallback(code, state);

            if (result.success && result.tokens) {
                // Update database with tokens
                await this.updateOAuthStatusInDatabase(instanceId, {
                    status: 'completed',
                    accessToken: result.tokens.access_token,
                    refreshToken: result.tokens.refresh_token,
                    tokenExpiresAt: new Date(Date.now() + (result.tokens.expires_in * 1000)),
                    scope: result.tokens.scope
                });

                // Create audit log
                await this.createAuditLog(instanceId, 'oauth_completion', 'success', {
                    service: serviceName,
                    method: 'oauth_callback',
                    scope: result.tokens.scope
                });

                console.log(`✅ OAuth callback completed for ${serviceName}, instance: ${instanceId}`);
            } else {
                // Update status to failed
                await this.updateOAuthStatusInDatabase(instanceId, {
                    status: 'failed',
                    error: 'oauth_callback_failed',
                    errorMessage: result.error || 'Unknown callback error'
                });

                // Create audit log
                await this.createAuditLog(instanceId, 'oauth_completion', 'failure', {
                    service: serviceName,
                    error: result.error
                });

                console.error(`❌ OAuth callback failed for ${serviceName}: ${result.error}`);
            }

            return result;
        } catch (error) {
            console.error(`OAuth callback processing failed for ${serviceName}:`, error);

            // Try to extract instance ID for error logging
            try {
                const instanceId = this.extractInstanceIdFromState(state);
                if (instanceId) {
                    await this.updateOAuthStatusInDatabase(instanceId, {
                        status: 'failed',
                        error: 'oauth_callback_error',
                        errorMessage: error.message
                    });

                    await this.createAuditLog(instanceId, 'oauth_completion', 'failure', {
                        service: serviceName,
                        error: error.message
                    });
                }
            } catch (auditError) {
                console.error('Failed to log OAuth callback error:', auditError);
            }

            throw error;
        }
    }

    /**
     * Updates OAuth status in database
     * @param {string} instanceId - MCP instance ID
     * @param {OAuthStatusUpdate} statusUpdate - Status update data
     * @returns {Promise<void>}
     */
    async updateOAuthStatusInDatabase(instanceId, statusUpdate) {
        try {
            await updateOAuthStatus(instanceId, statusUpdate);
            console.log(`📝 Updated OAuth status for instance ${instanceId}: ${statusUpdate.status}`);
        } catch (error) {
            console.error(`Failed to update OAuth status for instance ${instanceId}:`, error);
            throw error;
        }
    }

    /**
     * Creates audit log entry
     * @param {string} instanceId - MCP instance ID
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
                method: metadata.method || 'oauth_coordinator',
                service: metadata.service,
                error: metadata.error,
                scope: metadata.scope,
                timestamp: new Date()
            });
        } catch (error) {
            console.error(`Failed to create audit log for instance ${instanceId}:`, error);
            // Don't throw - audit logging shouldn't break the flow
        }
    }

    /**
     * Extracts instance ID from OAuth state parameter
     * @param {string} state - OAuth state parameter
     * @returns {string|null} Instance ID or null if invalid
     */
    extractInstanceIdFromState(state) {
        try {
            const decodedState = Buffer.from(state, 'base64').toString('utf-8');
            const stateData = JSON.parse(decodedState);
            return stateData.instanceId || null;
        } catch (error) {
            console.error('Failed to extract instance ID from OAuth state:', error);
            return null;
        }
    }

    /**
     * Gets list of registered OAuth services
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
}

module.exports = OAuthCoordinator;