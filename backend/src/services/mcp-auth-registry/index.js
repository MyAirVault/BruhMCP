/**
 * @fileoverview MCP Auth Registry Main Entry Point
 * Central authentication registry using Service Registry pattern
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ServiceRegistry } from './core/registry.js';
import { createAuthRoutes } from './routes/auth-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @typedef {Object} AuthRegistryConfig
 * @property {string} servicesPath - Path to MCP services directory
 * @property {string} baseUrl - Base URL for callbacks
 * @property {boolean} autoDiscovery - Enable automatic service discovery
 * @property {number} [discoveryInterval] - Service discovery interval in ms
 */


/**
 * MCP Authentication Registry Class
 * Manages service discovery and provides unified API for all MCP services
 */
class MCPAuthRegistry {
	constructor() {
		/** @type {ServiceRegistry} */
		this.serviceRegistry = new ServiceRegistry();
		
		/** @type {boolean} */
		this.initialized = false;
		
		/** @type {import('express').Router|null} */
		this.router = null;
		
		/** @type {NodeJS.Timeout|null} */
		this.discoveryInterval = null;
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

			// Initialize service registry
			await this.serviceRegistry.initialize(finalConfig.servicesPath);

			// Create Express routes
			this.router = createAuthRoutes(this.serviceRegistry);

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
	 * Gets the Express router for the auth registry
	 * @returns {import('express').Router|null} Express router or null if not initialized
	 */
	getRouter() {
		if (!this.initialized) {
			console.warn('⚠️  Auth registry not initialized. Call initialize() first.');
			return null;
		}
		return this.router;
	}


	/**
	 * Gets list of all available services
	 * @returns {string[]} Array of service names
	 */
	getAvailableServices() {
		if (!this.initialized) {
			return [];
		}
		return this.serviceRegistry.getAvailableServices();
	}


	/**
	 * Checks if a service is available
	 * @param {string} serviceName - Name of the service
	 * @returns {boolean} True if service is available
	 */
	hasService(serviceName) {
		if (!this.initialized) {
			return false;
		}
		return this.serviceRegistry.hasService(serviceName);
	}


	/**
	 * Gets service information by name
	 * @param {string} serviceName - Name of the service
	 * @returns {import('./types/service-types.js').ServiceRegistryEntry|null} Service entry or null if not found
	 */
	getService(serviceName) {
		if (!this.initialized) {
			return null;
		}
		return this.serviceRegistry.getService(serviceName);
	}


	/**
	 * Gets services by type
	 * @param {import('./types/service-types.js').ServiceType} type - Service type
	 * @returns {string[]} Array of service names matching type
	 */
	getServicesByType(type) {
		if (!this.initialized) {
			return [];
		}
		return this.serviceRegistry.getServicesByType(type);
	}


	/**
	 * Gets registry statistics
	 * @returns {Object} Registry statistics
	 */
	getStatistics() {
		if (!this.initialized) {
			return {
				initialized: false,
				totalServices: 0,
				activeServices: 0,
				servicesByType: {}
			};
		}
		return this.serviceRegistry.getStats();
	}


	/**
	 * Logs registry summary
	 * @returns {void}
	 */
	logRegistrySummary() {
		const stats = this.getStatistics();
		
		console.log('📊 MCP Auth Registry Summary:');
		console.log(`   Initialized: ${stats.initialized}`);
		console.log(`   Total Services: ${stats.totalServices}`);
		console.log(`   Active Services: ${stats.activeServices}`);
		console.log('   Services by Type:');
		
		for (const [type, count] of Object.entries(stats.servicesByType)) {
			const services = this.getServicesByType(/** @type {import('./types/service-types.js').ServiceType} */ (type));
			console.log(`     ${type}: ${count} (${services.join(', ')})`);
		}
	}


	/**
	 * Starts automatic service discovery at regular intervals
	 * @param {string} servicesPath - Path to MCP services directory
	 * @param {number} interval - Discovery interval in milliseconds
	 * @returns {void}
	 */
	startAutoDiscovery(servicesPath, interval) {
		console.log(`🔄 Starting auto-discovery every ${interval/1000} seconds`);
		
		this.discoveryInterval = setInterval(async () => {
			try {
				console.log('🔍 Running periodic service discovery...');
				await this.serviceRegistry.initialize(servicesPath);
				this.logRegistrySummary();
			} catch (error) {
				console.error('Periodic service discovery failed:', error);
			}
		}, interval);
	}


	/**
	 * Stops automatic service discovery
	 * @returns {void}
	 */
	stopAutoDiscovery() {
		if (this.discoveryInterval) {
			clearInterval(this.discoveryInterval);
			this.discoveryInterval = null;
			console.log('🛑 Stopped auto-discovery');
		}
	}


	/**
	 * Reloads a specific service
	 * @param {string} serviceName - Service name to reload
	 * @returns {Promise<boolean>} True if reload successful
	 */
	async reloadService(serviceName) {
		if (!this.initialized) {
			console.warn('⚠️  Auth registry not initialized');
			return false;
		}
		return await this.serviceRegistry.reloadService(serviceName);
	}


	/**
	 * Calls a service function
	 * @param {string} serviceName - Service name
	 * @param {string} functionName - Function name
	 * @param {...*} args - Function arguments
	 * @returns {Promise<*>} Function result
	 */
	async callServiceFunction(serviceName, functionName, ...args) {
		if (!this.initialized) {
			return {
				success: false,
				message: 'Auth registry not initialized'
			};
		}
		return await this.serviceRegistry.callServiceFunction(serviceName, functionName, ...args);
	}


	/**
	 * Shuts down the auth registry
	 * @returns {void}
	 */
	shutdown() {
		console.log('🛑 Shutting down MCP Auth Registry...');
		
		this.stopAutoDiscovery();
		this.initialized = false;
		this.router = null;
		
		console.log('✅ MCP Auth Registry shut down');
	}
}


// Create singleton instance
const authRegistry = new MCPAuthRegistry();


export { MCPAuthRegistry, authRegistry };