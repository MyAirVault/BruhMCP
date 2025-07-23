/**
 * @fileoverview Main Service Registry
 * Core registry class that manages service discovery and function calling
 */

import { join } from 'path';
import { discoverServices } from './service-discovery.js';
import { loadServiceFunctions, loadSpecificFunction, safeCallFunction } from './service-loader.js';

/**
 * @typedef {import('../types/service-types.js').ServiceRegistry} ServiceRegistry
 * @typedef {import('../types/service-types.js').ServiceRegistryEntry} ServiceRegistryEntry
 * @typedef {import('../types/service-types.js').ServiceError} ServiceError
 */


/**
 * Main service registry class
 */
class ServiceRegistry {
	/**
	 * @private
	 * @type {ServiceRegistry}
	 */
	#services = {};

	/**
	 * @private
	 * @type {string}
	 */
	#servicesPath = '';

	/**
	 * @private
	 * @type {boolean}
	 */
	#initialized = false;


	/**
	 * Initialize the registry
	 * @param {string} servicesPath - Path to mcp-servers directory
	 * @returns {Promise<void>}
	 */
	async initialize(servicesPath) {
		try {
			this.#servicesPath = servicesPath;
			console.log('🚀 Initializing Service Registry...');

			// Discover all available services
			this.#services = await discoverServices(servicesPath);

			// Load functions for all discovered services
			await this.#loadAllServiceFunctions();

			this.#initialized = true;
			console.log(`✅ Service Registry initialized with ${Object.keys(this.#services).length} services`);
		} catch (error) {
			console.error('❌ Failed to initialize Service Registry:', error);
			throw error;
		}
	}


	/**
	 * Load functions for all discovered services
	 * @private
	 * @returns {Promise<void>}
	 */
	async #loadAllServiceFunctions() {
		for (const [serviceName, serviceEntry] of Object.entries(this.#services)) {
			if (serviceEntry.isActive) {
				console.log(`📦 Loading functions for ${serviceName}...`);
				serviceEntry.functions = await loadServiceFunctions(
					serviceEntry.path,
					serviceEntry.type
				);

				const functionCount = Object.keys(serviceEntry.functions).length;
				console.log(`✅ Loaded ${functionCount} functions for ${serviceName}`);
			}
		}
	}


	/**
	 * Get service by name
	 * @param {string} serviceName - Service name
	 * @returns {ServiceRegistryEntry | null} Service entry or null if not found
	 */
	getService(serviceName) {
		if (!this.#initialized) {
			throw new Error('Registry not initialized. Call initialize() first.');
		}

		return this.#services[serviceName] || null;
	}


	/**
	 * Check if service exists and is active
	 * @param {string} serviceName - Service name
	 * @returns {boolean} True if service exists and is active
	 */
	hasService(serviceName) {
		const service = this.getService(serviceName);
		return service !== null && service.isActive;
	}


	/**
	 * Get all available service names
	 * @returns {string[]} Array of available service names
	 */
	getAvailableServices() {
		if (!this.#initialized) {
			throw new Error('Registry not initialized. Call initialize() first.');
		}

		return Object.keys(this.#services).filter(serviceName => 
			this.#services[serviceName].isActive
		);
	}


	/**
	 * Get services by type
	 * @param {import('../types/service-types.js').ServiceType} type - Service type
	 * @returns {string[]} Array of service names matching type
	 */
	getServicesByType(type) {
		if (!this.#initialized) {
			throw new Error('Registry not initialized. Call initialize() first.');
		}

		return Object.keys(this.#services).filter(serviceName => {
			const service = this.#services[serviceName];
			return service.isActive && service.type === type;
		});
	}


	/**
	 * Call service function
	 * @param {string} serviceName - Service name  
	 * @param {string} functionName - Function name
	 * @param {...*} args - Function arguments
	 * @returns {Promise<*>} Function result
	 */
	async callServiceFunction(serviceName, functionName, ...args) {
		if (!this.#initialized) {
			throw new Error('Registry not initialized. Call initialize() first.');
		}

		// Check if service exists and is active
		const service = this.getService(serviceName);
		if (!service) {
			return {
				success: false,
				message: `Service '${serviceName}' not found`
			};
		}

		if (!service.isActive) {
			return {
				success: false,
				message: `Service '${serviceName}' is not active`
			};
		}

		// Check if function exists
		const func = service.functions[functionName];
		if (!func) {
			// Try to load the function dynamically if not already loaded
			const loadedFunction = await loadSpecificFunction(service.path, functionName);
			if (loadedFunction) {
				service.functions[functionName] = loadedFunction;
				return await safeCallFunction(loadedFunction, serviceName, functionName, ...args);
			}

			return {
				success: false,
				message: `Function '${functionName}' not found for service '${serviceName}'`
			};
		}

		// Call the function safely
		return await safeCallFunction(func, serviceName, functionName, ...args);
	}


	/**
	 * Check if service has a specific function
	 * @param {string} serviceName - Service name
	 * @param {string} functionName - Function name
	 * @returns {boolean} True if service has the function
	 */
	hasServiceFunction(serviceName, functionName) {
		const service = this.getService(serviceName);
		if (!service || !service.isActive) {
			return false;
		}

		return typeof service.functions[functionName] === 'function';
	}


	/**
	 * Reload a specific service
	 * @param {string} serviceName - Service name to reload
	 * @returns {Promise<boolean>} True if reload successful
	 */
	async reloadService(serviceName) {
		try {
			if (!this.#services[serviceName]) {
				console.log(`Service ${serviceName} not found, cannot reload`);
				return false;
			}

			const servicePath = join(this.#servicesPath, serviceName);
			const serviceEntry = this.#services[serviceName];

			console.log(`🔄 Reloading service ${serviceName}...`);

			// Reload functions
			serviceEntry.functions = await loadServiceFunctions(
				servicePath,
				serviceEntry.type
			);

			console.log(`✅ Reloaded service ${serviceName}`);
			return true;
		} catch (error) {
			console.error(`❌ Failed to reload service ${serviceName}:`, error);
			return false;
		}
	}


	/**
	 * Get registry statistics
	 * @returns {Object} Registry statistics
	 */
	getStats() {
		if (!this.#initialized) {
			return {
				initialized: false,
				totalServices: 0,
				activeServices: 0,
				servicesByType: {}
			};
		}

		const totalServices = Object.keys(this.#services).length;
		const activeServices = this.getAvailableServices().length;
		const servicesByType = {};

		for (const [serviceName, service] of Object.entries(this.#services)) {
			if (service.isActive) {
				servicesByType[service.type] = (servicesByType[service.type] || 0) + 1;
			}
		}

		return {
			initialized: this.#initialized,
			totalServices,
			activeServices,
			servicesByType,
			services: Object.keys(this.#services)
		};
	}
}


export { ServiceRegistry };