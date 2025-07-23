/**
 * @fileoverview MCP Auth Registry Main Entry Point
 * Central authentication registry that coordinates auth flows for all MCP services
 */

import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { discoverServices, registerService } from './utils/service-discovery.js';
import OAuthCoordinator from './coordinators/oauth-coordinator.js';
import ApiKeyCoordinator from './coordinators/apikey-coordinator.js';
import { createAuthRoutes } from './routes/auth-routes.js';

/**
 * @typedef {Object} ServiceConfig
 * @property {string} name - Service name
 * @property {'oauth'|'apikey'} type - Service authentication type
 * @property {any} validator - Credential validator
 * @property {any} [oauthHandler] - OAuth handler (for OAuth services)
 * @property {Array<string>} requiredFields - Required credential fields
 */

/**
 * @typedef {Object} AuthRegistryConfig
 * @property {string} servicesPath - Path to MCP services directory
 * @property {string} baseUrl - Base URL for callbacks
 * @property {boolean} autoDiscovery - Enable automatic service discovery
 * @property {number} [discoveryInterval] - Service discovery interval in ms
 */


/**
 * @typedef {Object} RegistryStatistics
 * @property {number} totalServices - Total number of services
 * @property {number} oauthServices - Number of OAuth services
 * @property {number} apiKeyServices - Number of API key services
 * @property {Object} servicesByType - Services grouped by type
 * @property {Array<string>} servicesByType.oauth - OAuth service names
 * @property {Array<string>} servicesByType.apikey - API key service names
 * @property {boolean} initialized - Whether registry is initialized
 */

/**
 * MCP Authentication Registry Class
 * Manages authentication flows for all registered MCP services
 */
class AuthRegistryImpl {
    constructor() {
        /** @type {OAuthCoordinator} */
        this.oauthCoordinator = new OAuthCoordinator();
        
        /** @type {ApiKeyCoordinator} */
        this.apiKeyCoordinator = new ApiKeyCoordinator();
        
        /** @type {Map<string, ServiceConfig>} */
        this.registeredServices = new Map();
        
        /** @type {boolean} */
        this.initialized = false;
        
        /** @type {express.Router|null} */
        this.router = null;
    }

    /**
     * Initializes the auth registry with automatic service discovery
     * @param {Partial<AuthRegistryConfig>} [config] - Registry configuration
     * @returns {Promise<void>}
     */
    async initialize(config = {}) {
        if (this.initialized) {
            console.log('🔄 Auth registry already initialized');
            return;
        }

        /** @type {AuthRegistryConfig} */
        const defaultConfig = {
            servicesPath: join(__dirname, '../../mcp-servers'),
            baseUrl: process.env.BASE_URL || 'http://localhost:3000',
            autoDiscovery: true,
            discoveryInterval: 30000 // 30 seconds
        };

        /** @type {AuthRegistryConfig} */
        const finalConfig = { 
            servicesPath: config.servicesPath || defaultConfig.servicesPath,
            baseUrl: config.baseUrl || defaultConfig.baseUrl,
            autoDiscovery: config.autoDiscovery !== undefined ? config.autoDiscovery : defaultConfig.autoDiscovery,
            discoveryInterval: config.discoveryInterval || defaultConfig.discoveryInterval
        };

        try {
            console.log('🚀 Initializing MCP Auth Registry...');

            // Discover and register services
            await this.discoverAndRegisterServices(finalConfig.servicesPath);

            // Create Express routes
            this.router = this.createRoutes();

            this.initialized = true;
            console.log('✅ MCP Auth Registry initialized successfully');
            
            // Log summary
            this.logRegistrySummary();

            // Set up auto-discovery if enabled
            if (finalConfig.autoDiscovery && finalConfig.discoveryInterval && finalConfig.discoveryInterval > 0) {
                this.startAutoDiscovery(finalConfig.servicesPath, finalConfig.discoveryInterval);
            }
        } catch (error) {
            console.error('❌ Failed to initialize MCP Auth Registry:', error);
            throw error;
        }
    }

    /**
     * Discovers and registers all available MCP services
     * @param {string} servicesPath - Path to MCP services directory
     * @returns {Promise<void>}
     */
    async discoverAndRegisterServices(servicesPath) {
        try {
            const discoveredServices = await discoverServices(servicesPath);
            
            for (const serviceInfo of discoveredServices) {
                await this.registerDiscoveredService(serviceInfo);
            }

            console.log(`📝 Registered ${this.registeredServices.size} services total`);
        } catch (error) {
            console.error('Failed to discover and register services:', error);
            throw error;
        }
    }

    /**
     * Registers a discovered service with appropriate coordinator
     * @param {import('./utils/service-discovery.js').DiscoveredService} serviceInfo - Service information
     * @returns {Promise<void>}
     */
    async registerDiscoveredService(serviceInfo) {
        try {
            const serviceConfig = await registerService(serviceInfo);
            
            if (!serviceConfig) {
                console.warn(`⚠️  Failed to register service: ${serviceInfo.name}`);
                return;
            }

            // Register with appropriate coordinator
            if (serviceConfig.type === 'oauth') {
                this.oauthCoordinator.registerService(serviceConfig);
            } else if (serviceConfig.type === 'apikey') {
                this.apiKeyCoordinator.registerService(serviceConfig);
            }

            // Store in registry
            this.registeredServices.set(serviceConfig.name, serviceConfig);
            
            console.log(`✅ Registered ${serviceConfig.name} as ${serviceConfig.type} service`);
        } catch (error) {
            console.error(`Failed to register service ${serviceInfo.name}:`, error);
            // Continue with other services
        }
    }

    /**
     * Creates Express routes for the auth registry
     * @returns {express.Router} Express router
     */
    createRoutes() {
        const coordinators = {
            oauthCoordinator: this.oauthCoordinator,
            apiKeyCoordinator: this.apiKeyCoordinator
        };

        return createAuthRoutes(coordinators);
    }

    /**
     * Gets the Express router for the auth registry
     * @returns {express.Router|null} Express router or null if not initialized
     */
    getRouter() {
        if (!this.initialized) {
            console.warn('⚠️  Auth registry not initialized. Call initialize() first.');
            return null;
        }
        return this.router;
    }

    /**
     * Gets list of all registered services
     * @returns {Array<ServiceConfig>} Array of service configurations
     */
    getRegisteredServices() {
        return Array.from(this.registeredServices.values());
    }

    /**
     * Gets service configuration by name
     * @param {string} serviceName - Name of the service
     * @returns {ServiceConfig|null} Service configuration or null if not found
     */
    getServiceConfig(serviceName) {
        return this.registeredServices.get(serviceName) || null;
    }

    /**
     * Checks if a service is registered
     * @param {string} serviceName - Name of the service
     * @returns {boolean} True if service is registered
     */
    hasService(serviceName) {
        return this.registeredServices.has(serviceName);
    }

    /**
     * Gets registry statistics
     * @returns {RegistryStatistics} Registry statistics
     */
    getStatistics() {
        const oauthServices = this.oauthCoordinator.getRegisteredServices();
        const apiKeyServices = this.apiKeyCoordinator.getRegisteredServices();
        
        return {
            totalServices: this.registeredServices.size,
            oauthServices: oauthServices.length,
            apiKeyServices: apiKeyServices.length,
            servicesByType: {
                oauth: oauthServices,
                apikey: apiKeyServices
            },
            initialized: this.initialized
        };
    }

    /**
     * Logs registry summary
     * @returns {void}
     */
    logRegistrySummary() {
        const stats = this.getStatistics();
        
        console.log('📊 MCP Auth Registry Summary:');
        console.log(`   Total Services: ${stats.totalServices}`);
        console.log(`   OAuth Services: ${stats.oauthServices} (${stats.servicesByType.oauth.join(', ')})`);
        console.log(`   API Key Services: ${stats.apiKeyServices} (${stats.servicesByType.apikey.join(', ')})`);
    }

    /**
     * Starts automatic service discovery at regular intervals
     * @param {string} servicesPath - Path to MCP services directory
     * @param {number} interval - Discovery interval in milliseconds
     * @returns {void}
     */
    startAutoDiscovery(servicesPath, interval) {
        console.log(`🔄 Starting auto-discovery every ${interval/1000} seconds`);
        
        setInterval(async () => {
            try {
                console.log('🔍 Running periodic service discovery...');
                await this.discoverAndRegisterServices(servicesPath);
            } catch (error) {
                console.error('Periodic service discovery failed:', error);
            }
        }, interval);
    }

    /**
     * Manually registers a service (for testing or custom services)
     * @param {ServiceConfig} serviceConfig - Service configuration
     * @returns {void}
     */
    manuallyRegisterService(serviceConfig) {
        if (serviceConfig.type === 'oauth') {
            this.oauthCoordinator.registerService(serviceConfig);
        } else if (serviceConfig.type === 'apikey') {
            this.apiKeyCoordinator.registerService(serviceConfig);
        } else {
            throw new Error(`Invalid service type: ${serviceConfig.type}`);
        }

        this.registeredServices.set(serviceConfig.name, serviceConfig);
        console.log(`✅ Manually registered service: ${serviceConfig.name} (${serviceConfig.type})`);
    }

    /**
     * Shuts down the auth registry
     * @returns {void}
     */
    shutdown() {
        console.log('🛑 Shutting down MCP Auth Registry...');
        this.initialized = false;
        this.registeredServices.clear();
        console.log('✅ MCP Auth Registry shut down');
    }
}

// Create singleton instance
const authRegistry = new AuthRegistryImpl();

export { AuthRegistryImpl as MCPAuthRegistry, authRegistry };