import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Service Registry
 * Automatically discovers and loads service configurations
 */
class ServiceRegistry {
	constructor() {
		this.services = new Map();
		this.loaded = false;
		this.servicesDir = join(__dirname, '../services');
	}

	/**
	 * Load a specific service configuration on demand
	 */
	async loadService(serviceName) {
		// Return if already loaded
		if (this.services.has(serviceName)) {
			return this.services.get(serviceName);
		}

		try {
			const configPath = join(this.servicesDir, serviceName, 'config.js');

			// Dynamic import for ES modules
			const serviceModule = await import(`file://${configPath}`);
			const serviceConfig = serviceModule.default;

			if (this.validateServiceConfig(serviceConfig, serviceName)) {
				// Convert to the legacy format for backward compatibility
				const legacyConfig = this.convertToLegacyFormat(serviceConfig);

				const service = {
					...legacyConfig,
					_original: serviceConfig,
					_metadata: {
						directory: serviceName,
						loaded: new Date(),
						category: serviceConfig.category || 'general',
					},
				};

				this.services.set(serviceName, service);
				console.log(`✅ Loaded service: ${serviceConfig.displayName || serviceName}`);
				return service;
			} else {
				console.warn(`⚠️  Invalid service config: ${serviceName}`);
				throw new Error(`Invalid service configuration for ${serviceName}`);
			}
		} catch (error) {
			console.error(`❌ Failed to load service ${serviceName}:`, error.message);
			throw error;
		}
	}

	/**
	 * Auto-discover and load all service configurations (deprecated - use loadService for better performance)
	 */
	async loadServices() {
		if (this.loaded) return;

		try {
			const files = await readdir(this.servicesDir, { withFileTypes: true });
			const serviceDirs = files.filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'));

			console.log(`🔍 Discovered ${serviceDirs.length} service directories`);

			for (const dir of serviceDirs) {
				await this.loadService(dir.name);
			}

			this.loaded = true;
			console.log(`🎉 Service registry loaded with ${this.services.size} services`);
		} catch (error) {
			console.error('❌ Failed to load service registry:', error.message);
			throw error;
		}
	}

	/**
	 * Validate service configuration structure
	 */
	validateServiceConfig(config, serviceName) {
		const required = ['name', 'api', 'auth', 'endpoints'];
		const missing = required.filter(field => !config[field]);

		if (missing.length > 0) {
			console.error(`❌ Service ${serviceName} missing required fields:`, missing);
			return false;
		}

		// Validate API config
		if (!config.api.baseURL) {
			console.error(`❌ Service ${serviceName} missing api.baseURL`);
			return false;
		}

		// Validate auth config
		if (!config.auth.type || !config.auth.field) {
			console.error(`❌ Service ${serviceName} missing auth configuration`);
			return false;
		}

		return true;
	}

	/**
	 * Convert new service config format to legacy format for compatibility
	 */
	convertToLegacyFormat(serviceConfig) {
		return {
			name: serviceConfig.displayName || serviceConfig.name,
			baseURL: serviceConfig.api.baseURL,
			authHeader: this.createAuthHeaderFunction(serviceConfig.auth),
			credentialField: serviceConfig.auth.field,
			endpoints: serviceConfig.endpoints,
			customHandlers: serviceConfig.customHandlers || {},

			// Enhanced metadata
			_enhanced: {
				description: serviceConfig.description,
				category: serviceConfig.category,
				iconUrl: serviceConfig.iconUrl,
				api: serviceConfig.api,
				auth: serviceConfig.auth,
				tools: serviceConfig.tools || [],
				resources: serviceConfig.resources || [],
				validation: serviceConfig.validation || {},
			},
		};
	}

	/**
	 * Create auth header function based on service config
	 */
	createAuthHeaderFunction(authConfig) {
		return token => {
			if (authConfig.headerFormat) {
				return { [authConfig.header]: authConfig.headerFormat(token) };
			} else {
				return { [authConfig.header]: token };
			}
		};
	}

	/**
	 * Get service configuration by name (with lazy loading)
	 */
	async getService(serviceName) {
		// Check if already loaded
		if (this.services.has(serviceName)) {
			return this.services.get(serviceName);
		}

		// Load service on demand
		try {
			return await this.loadService(serviceName);
		} catch (error) {
			console.error(`❌ Service ${serviceName} not found or failed to load:`, error.message);
			return null;
		}
	}

	/**
	 * Get service configuration by name (synchronous - only returns if already loaded)
	 */
	getServiceSync(serviceName) {
		return this.services.get(serviceName) || null;
	}

	/**
	 * Get all available services
	 */
	getAllServices() {
		if (!this.loaded) {
			throw new Error('Service registry not loaded. Call loadServices() first.');
		}
		return Object.fromEntries(this.services);
	}

	/**
	 * Get services by category
	 */
	getServicesByCategory(category) {
		if (!this.loaded) {
			throw new Error('Service registry not loaded. Call loadServices() first.');
		}

		const result = {};
		for (const [name, config] of this.services) {
			if (config._metadata?.category === category) {
				result[name] = config;
			}
		}
		return result;
	}

	/**
	 * Get service metadata
	 */
	getServiceMetadata(serviceName) {
		const service = this.getService(serviceName);
		return service
			? {
					name: service._original?.name,
					displayName: service._original?.displayName,
					description: service._original?.description,
					category: service._original?.category,
					iconUrl: service._original?.iconUrl,
					api: service._original?.api,
					tools: service._original?.tools?.length || 0,
					resources: service._original?.resources?.length || 0,
					loadedAt: service._metadata?.loaded,
				}
			: null;
	}

	/**
	 * Validate service credentials
	 */
	async validateCredentials(serviceName, credentials) {
		const service = await this.getService(serviceName);
		if (!service) {
			throw new Error(`Service ${serviceName} not found`);
		}

		const originalConfig = service._original;
		if (originalConfig.validation && originalConfig.validation.credentials) {
			return await originalConfig.validation.credentials(originalConfig, credentials);
		}

		// Fallback validation - just check if required field exists
		const requiredField = originalConfig.auth.field;
		if (!credentials[requiredField]) {
			throw new Error(`Missing required credential: ${requiredField}`);
		}

		return { valid: true };
	}

	/**
	 * Get available tools for a service
	 */
	async getServiceTools(serviceName) {
		const service = await this.getService(serviceName);
		return service?._original?.tools || [];
	}

	/**
	 * Get available resources for a service
	 */
	async getServiceResources(serviceName) {
		const service = await this.getService(serviceName);
		return service?._original?.resources || [];
	}

	/**
	 * List all available service names
	 */
	getServiceNames() {
		if (!this.loaded) {
			throw new Error('Service registry not loaded. Call loadServices() first.');
		}
		return Array.from(this.services.keys());
	}

	/**
	 * Reload services (useful for development)
	 */
	async reloadServices() {
		this.services.clear();
		this.loaded = false;
		await this.loadServices();
	}

	/**
	 * Get registry statistics
	 */
	getStats() {
		if (!this.loaded) {
			return { loaded: false, total: 0, categories: {} };
		}

		const categories = {};
		for (const [, config] of this.services) {
			const category = config._metadata?.category || 'general';
			categories[category] = (categories[category] || 0) + 1;
		}

		return {
			loaded: true,
			total: this.services.size,
			categories,
			services: this.getServiceNames(),
		};
	}
}

// Create singleton instance
export const serviceRegistry = new ServiceRegistry();

// Convenience functions
export const loadServices = () => serviceRegistry.loadServices();
export const loadService = name => serviceRegistry.loadService(name);
export const getService = name => serviceRegistry.getService(name);
export const getServiceSync = name => serviceRegistry.getServiceSync(name);
export const getAllServices = () => serviceRegistry.getAllServices();
export const getServiceMetadata = name => serviceRegistry.getServiceMetadata(name);
export const validateCredentials = (name, creds) => serviceRegistry.validateCredentials(name, creds);
export const getServiceTools = name => serviceRegistry.getServiceTools(name);
export const getServiceResources = name => serviceRegistry.getServiceResources(name);
export const getRegistryStats = () => serviceRegistry.getStats();

export default serviceRegistry;
