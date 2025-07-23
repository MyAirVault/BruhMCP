/**
 * @fileoverview Service Loader System
 * Dynamically imports and manages service functions
 */

import { join } from 'path';

/**
 * @typedef {import('../types/service-types.js').ServiceType} ServiceType
 * @typedef {import('../types/service-types.js').ServiceFunctions} ServiceFunctions
 * @typedef {import('../types/service-types.js').ServiceError} ServiceError
 */


/**
 * Dynamically imports service functions
 * @param {string} servicePath - Path to service directory
 * @param {string} functionName - Name of the function file to import
 * @returns {Promise<Function|null>} Imported function or null if failed
 */
async function importServiceFunction(servicePath, functionName) {
	try {
		const functionPath = join(servicePath, 'auth', `${functionName}.js`);
		const module = await import(functionPath);
		
		// Look for named export matching function name or default export
		const exportedFunction = module[functionName] || module.default;
		
		if (typeof exportedFunction !== 'function') {
			console.error(`❌ ${functionName} is not a function in ${functionPath}`);
			return null;
		}

		return exportedFunction;
	} catch (error) {
		console.error(`Failed to import ${functionName} from ${servicePath}/auth:`, error);
		return null;
	}
}


/**
 * Loads all functions for a service based on its type
 * @param {string} servicePath - Path to service directory
 * @param {ServiceType} serviceType - Service type
 * @returns {Promise<ServiceFunctions>} Loaded functions
 */
async function loadServiceFunctions(servicePath, serviceType) {
	/** @type {ServiceFunctions} */
	const functions = {};
	const functionNames = getFunctionNamesForType(serviceType);

	for (const functionName of functionNames) {
		const loadedFunction = await importServiceFunction(servicePath, functionName);
		if (loadedFunction) {
			functions[functionName] = loadedFunction;
		}
	}

	return functions;
}


/**
 * Loads a specific function for a service
 * @param {string} servicePath - Path to service directory
 * @param {string} functionName - Function name to load
 * @returns {Promise<Function|null>} Loaded function or null if failed
 */
async function loadSpecificFunction(servicePath, functionName) {
	return await importServiceFunction(servicePath, functionName);
}


/**
 * Gets function names required for a service type
 * @param {ServiceType} serviceType - Service type
 * @returns {string[]} Array of function names
 */
function getFunctionNamesForType(serviceType) {
	const baseFunctions = ['validateCredentials'];

	switch (serviceType) {
		case 'apikey':
			return [...baseFunctions, 'createInstance', 'revokeInstance'];
		case 'oauth':
			return [...baseFunctions, 'initiateOAuth', 'oauthCallback', 'revokeInstance'];
		case 'hybrid':
			return [...baseFunctions, 'createInstance', 'initiateOAuth', 'oauthCallback', 'revokeInstance'];
		default:
			return baseFunctions;
	}
}


/**
 * Validates that a function has the expected signature
 * @param {Function} func - Function to validate
 * @param {string} functionName - Expected function name
 * @returns {boolean} True if function is valid
 */
function validateFunctionSignature(func, functionName) {
	if (typeof func !== 'function') {
		return false;
	}

	// Check minimum parameter count based on function type
	const expectedParams = getExpectedParameterCount(functionName);
	if (func.length < expectedParams) {
		console.warn(`⚠️  Function ${functionName} has ${func.length} parameters, expected at least ${expectedParams}`);
	}

	return true;
}


/**
 * Gets expected parameter count for a function
 * @param {string} functionName - Function name
 * @returns {number} Expected parameter count
 */
function getExpectedParameterCount(functionName) {
	switch (functionName) {
		case 'validateCredentials':
			return 2; // credentials, userId
		case 'createInstance':
			return 2; // instanceData, userId
		case 'initiateOAuth':
			return 2; // credentials, userId
		case 'oauthCallback':
			return 3; // code, state, userId
		case 'revokeInstance':
			return 2; // instanceId, userId
		default:
			return 1;
	}
}


/**
 * Creates a service error object
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {string} [serviceName] - Service name
 * @param {string} [functionName] - Function name
 * @param {Error} [originalError] - Original error
 * @returns {ServiceError} Service error object
 */
function createServiceError(code, message, serviceName, functionName, originalError) {
	return {
		code,
		message,
		serviceName,
		functionName,
		originalError
	};
}


/**
 * Safely calls a service function with error handling
 * @param {Function} func - Function to call
 * @param {string} serviceName - Service name
 * @param {string} functionName - Function name
 * @param {...*} args - Function arguments
 * @returns {Promise<*>} Function result or error object
 */
async function safeCallFunction(func, serviceName, functionName, ...args) {
	try {
		if (!validateFunctionSignature(func, functionName)) {
			return {
				success: false,
				message: `Invalid function signature for ${functionName}`,
				error: createServiceError('INVALID_FUNCTION', `Invalid function signature`, serviceName, functionName)
			};
		}

		const result = await func(...args);
		
		// Ensure result has expected structure
		if (typeof result !== 'object' || result === null) {
			return {
				success: false,
				message: `Function ${functionName} returned invalid result format`,
				error: createServiceError('INVALID_RESULT', 'Invalid result format', serviceName, functionName)
			};
		}

		return result;
	} catch (error) {
		console.error(`Error calling ${serviceName}.${functionName}:`, error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		return {
			success: false,
			message: `Function ${functionName} failed: ${errorMessage}`,
			error: createServiceError('FUNCTION_ERROR', errorMessage, serviceName, functionName, error instanceof Error ? error : undefined)
		};
	}
}


export {
	importServiceFunction,
	loadServiceFunctions,
	loadSpecificFunction,
	getFunctionNamesForType,
	validateFunctionSignature,
	getExpectedParameterCount,
	createServiceError,
	safeCallFunction
};