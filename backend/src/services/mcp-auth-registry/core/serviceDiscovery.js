/**
 * @fileoverview Service Discovery System
 * Discovers available MCP services and their capabilities automatically
 */

const { readdir, access } = require('fs/promises');
const { join } = require('path');

/**
 * @typedef {import('../types/serviceTypes.js').ServiceType} ServiceType
 * @typedef {import('../types/serviceTypes.js').ServiceRegistryMap} ServiceRegistryMap
 * @typedef {import('../types/serviceTypes.js').ServiceRegistryEntry} ServiceRegistryEntry
 */


/**
 * Discovers available MCP services and their capabilities
 * @param {string} servicesDir - Path to mcp-servers directory
 * @returns {Promise<ServiceRegistryMap>} Service registry mapping
 */
async function discoverServices(servicesDir) {
	try {
		const serviceDirectories = await readdir(servicesDir, { withFileTypes: true });
		/** @type {ServiceRegistryMap} */
		const serviceRegistry = {};

		for (const dirent of serviceDirectories) {
			if (!dirent.isDirectory()) continue;

			const serviceName = dirent.name;
			const servicePath = join(servicesDir, serviceName);

			const serviceEntry = await analyzeServiceDirectory(serviceName, servicePath);
			if (serviceEntry) {
				serviceRegistry[serviceName] = serviceEntry;
			}
		}

		console.log(`🔍 Discovered ${Object.keys(serviceRegistry).length} MCP services`);
		return serviceRegistry;
	} catch (error) {
		console.error('Failed to discover services:', error);
		throw error;
	}
}


/**
 * Analyzes a service directory to create registry entry
 * @param {string} serviceName - Name of the service
 * @param {string} servicePath - Path to service directory
 * @returns {Promise<ServiceRegistryEntry|null>} Service registry entry or null if invalid
 */
async function analyzeServiceDirectory(serviceName, servicePath) {
	try {
		const serviceType = await determineServiceType(servicePath);
		
		if (!serviceType) {
			console.log(`⚠️  Service ${serviceName} has no valid auth files, skipping`);
			return null;
		}

		const isActive = await checkServiceHealth(servicePath, serviceType);

		/** @type {ServiceRegistryEntry} */
		const serviceEntry = {
			type: serviceType,
			functions: {}, // Will be loaded dynamically when needed
			path: servicePath,
			isActive
		};

		console.log(`✅ Service ${serviceName}: type=${serviceType}, active=${isActive}`);
		return serviceEntry;
	} catch (error) {
		console.error(`Failed to analyze service ${serviceName}:`, error);
		return null;
	}
}


/**
 * Determines service type based on available files
 * @param {string} servicePath - Path to service directory
 * @returns {Promise<ServiceType|null>} Service type or null if invalid
 */
async function determineServiceType(servicePath) {
	const authPath = join(servicePath, 'auth');
	const hasValidateCredentials = await fileExists(join(authPath, 'validateCredentials.js'));
	const hasCreateInstance = await fileExists(join(authPath, 'createInstance.js'));
	const hasInitiateOAuth = await fileExists(join(authPath, 'initiateOAuth.js'));
	const hasOAuthCallback = await fileExists(join(authPath, 'oauthCallback.js'));

	if (!hasValidateCredentials) {
		return null; // Service must have credential validation
	}

	// Hybrid: supports both OAuth and API key authentication
	if (hasInitiateOAuth && hasOAuthCallback && hasCreateInstance) {
		return 'hybrid';
	}

	// OAuth: only supports OAuth authentication
	if (hasInitiateOAuth && hasOAuthCallback) {
		return 'oauth';
	}

	// API Key: only supports direct credential authentication
	if (hasCreateInstance) {
		return 'apikey';
	}

	return null; // Invalid service configuration
}


/**
 * Checks if service has all required files for its type
 * @param {string} servicePath - Path to service directory
 * @param {ServiceType} serviceType - Service type
 * @returns {Promise<boolean>} True if service is healthy
 */
async function checkServiceHealth(servicePath, serviceType) {
	const requiredFiles = getRequiredFiles(serviceType);
	const authPath = join(servicePath, 'auth');
	
	for (const file of requiredFiles) {
		const filePath = join(authPath, file);
		if (!(await fileExists(filePath))) {
			console.log(`❌ Service missing required file: auth/${file}`);
			return false;
		}
	}

	return true;
}


/**
 * Gets required files for a service type
 * @param {ServiceType} serviceType - Service type
 * @returns {string[]} Array of required file names
 */
function getRequiredFiles(serviceType) {
	const baseFiles = ['validateCredentials.js'];

	switch (serviceType) {
		case 'apikey':
			return [...baseFiles, 'createInstance.js'];
		case 'oauth':
			return [...baseFiles, 'initiateOAuth.js', 'oauthCallback.js'];
		case 'hybrid':
			return [...baseFiles, 'createInstance.js', 'initiateOAuth.js', 'oauthCallback.js'];
		default:
			return baseFiles;
	}
}


/**
 * Gets available service names from registry
 * @param {ServiceRegistryMap} registry - Service registry
 * @returns {string[]} Array of service names
 */
function getAvailableServices(registry) {
	return Object.keys(registry).filter(serviceName => 
		registry[serviceName].isActive
	);
}


/**
 * Gets services by type
 * @param {ServiceRegistryMap} registry - Service registry
 * @param {ServiceType} type - Service type to filter by
 * @returns {string[]} Array of service names matching type
 */
function getServicesByType(registry, type) {
	return Object.keys(registry).filter(serviceName => 
		registry[serviceName].type === type && registry[serviceName].isActive
	);
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


module.exports = {
	discoverServices,
	analyzeServiceDirectory,
	determineServiceType,
	checkServiceHealth,
	getRequiredFiles,
	getAvailableServices,
	getServicesByType,
	fileExists
};