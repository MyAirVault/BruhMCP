/**
 * @fileoverview Service Discovery Utility
 * Discovers and registers MCP services automatically
 */

import { readdir, access } from 'fs/promises';
import { join } from 'path';

/**
 * @typedef {import('../types/auth-types.js').ServiceConfig} ServiceConfig
 * @typedef {import('../types/auth-types.js').AuthRegistryConfig} AuthRegistryConfig
 * @typedef {import('../types/auth-types.js').OAuthHandler} OAuthHandler
 * @typedef {import('../types/auth-types.js').ValidatorType} ValidatorType
 */

/**
 * @typedef {Object} DiscoveredService
 * @property {string} name - Service name
 * @property {string} path - Service directory path
 * @property {'oauth'|'apikey'} type - Authentication type
 * @property {boolean} hasValidator - Whether service has validator
 * @property {boolean} hasOAuthHandler - Whether service has OAuth handler
 */

/**
 * Discovers all MCP services in the services directory
 * @param {string} servicesPath - Path to MCP services directory
 * @returns {Promise<Array<DiscoveredService>>} Array of discovered services
 */
async function discoverServices(servicesPath) {
    try {
        const serviceDirectories = await readdir(servicesPath, { withFileTypes: true });
        const discoveredServices = [];

        for (const dirent of serviceDirectories) {
            if (!dirent.isDirectory()) continue;

            const serviceName = dirent.name;
            const servicePath = join(servicesPath, serviceName);

            const serviceInfo = await analyzeService(serviceName, servicePath);
            if (serviceInfo) {
                discoveredServices.push(serviceInfo);
            }
        }

        console.log(`🔍 Discovered ${discoveredServices.length} MCP services`);
        return discoveredServices;
    } catch (error) {
        console.error('Failed to discover services:', error);
        throw error;
    }
}

/**
 * Analyzes a service directory to determine its capabilities
 * @param {string} serviceName - Name of the service
 * @param {string} servicePath - Path to service directory
 * @returns {Promise<DiscoveredService|null>} Service info or null if invalid
 */
async function analyzeService(serviceName, servicePath) {
    const validatorPath = join(servicePath, 'validation', 'credential-validator.js');
    const oauthHandlerPath = join(servicePath, 'oauth', 'oauth-handler.js');

    const hasValidator = await fileExists(validatorPath);
    const hasOAuthHandler = await fileExists(oauthHandlerPath);

    if (!hasValidator) {
        console.log(`⚠️  Service ${serviceName} has no validator, skipping`);
        return null;
    }

    const type = hasOAuthHandler ? 'oauth' : 'apikey';

    console.log(`✅ Service ${serviceName}: type=${type}, validator=${hasValidator}, oauth=${hasOAuthHandler}`);

    return {
        name: serviceName,
        path: servicePath,
        type,
        hasValidator,
        hasOAuthHandler
    };
}

/**
 * Loads a service module dynamically
 * @param {string} modulePath - Path to the module
 * @returns {Promise<Object|null>} Loaded module or null if failed
 */
async function loadServiceModule(modulePath) {
    try {
        // Use dynamic import for ES modules
        const module = await import(modulePath);

        return module.default || module;
    } catch (error) {
        console.error(`Failed to load module ${modulePath}:`, error);
        return null;
    }
}

/**
 * Registers a discovered service with the auth registry
 * @param {DiscoveredService} serviceInfo - Service information
 * @returns {Promise<ServiceConfig|null>} Service configuration or null if failed
 */
async function registerService(serviceInfo) {
    const { name, path, type, hasOAuthHandler } = serviceInfo;

    try {
        const validatorPath = join(path, 'validation', 'credential-validator.js');
        const validator = await loadServiceModule(validatorPath);

        if (!validator) {
            console.error(`❌ Failed to load validator for ${name}`);
            return null;
        }

        /** @type {import('../types/auth-types.js').OAuthHandler|undefined} */
        let oauthHandler = undefined;
        if (hasOAuthHandler) {
            const oauthHandlerPath = join(path, 'oauth', 'oauth-handler.js');
            const loadedHandler = await loadServiceModule(oauthHandlerPath);

            if (!loadedHandler) {
                console.error(`❌ Failed to load OAuth handler for ${name}`);
                return null;
            }
            oauthHandler = /** @type {import('../types/auth-types.js').OAuthHandler} */ (loadedHandler);
        }

        const requiredFields = determineRequiredFields(type);

        /** @type {ServiceConfig} */
        const serviceConfig = {
            name,
            type: /** @type {'oauth'|'apikey'} */ (type),
            validator: /** @type {import('../types/auth-types.js').ValidatorType} */ (validator),
            oauthHandler,
            requiredFields
        };

        console.log(`📝 Registered service: ${name} (${type})`);
        return serviceConfig;
    } catch (error) {
        console.error(`Failed to register service ${name}:`, error);
        return null;
    }
}

/**
 * Determines required credential fields based on service type
 * @param {'oauth'|'apikey'} type - Service authentication type
 * @returns {Array<string>} Required credential fields
 */
function determineRequiredFields(type) {
    switch (type) {
        case 'oauth':
            return ['client_id', 'client_secret'];
        case 'apikey':
            return ['api_token', 'api_key']; // Either api_token or api_key
        default:
            return [];
    }
}

/**
 * Checks if a file exists
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} True if file exists
 */
async function fileExists(filePath) {
    try {
        await access(filePath);
        return true;
    } catch {
        return false;
    }
}

export {
    discoverServices,
    analyzeService,
    loadServiceModule,
    registerService,
    determineRequiredFields,
    fileExists
};