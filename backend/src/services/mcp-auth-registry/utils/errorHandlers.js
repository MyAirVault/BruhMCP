/**
 * @fileoverview Error Handling Utilities
 * Centralized error handling for the MCP Auth Registry
 */

/**
 * @typedef {import('../types/serviceTypes.js').ServiceError} ServiceError
 */


/**
 * Standard error codes for the auth registry
 */
const ERROR_CODES = {
	SERVICE_NOT_FOUND: 'SERVICE_NOT_FOUND',
	SERVICE_INACTIVE: 'SERVICE_INACTIVE',
	FUNCTION_NOT_FOUND: 'FUNCTION_NOT_FOUND',
	INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
	AUTH_REQUIRED: 'AUTH_REQUIRED',
	INVALID_SERVICE_TYPE: 'INVALID_SERVICE_TYPE',
	REGISTRY_NOT_INITIALIZED: 'REGISTRY_NOT_INITIALIZED',
	FUNCTION_EXECUTION_ERROR: 'FUNCTION_EXECUTION_ERROR',
	VALIDATION_ERROR: 'VALIDATION_ERROR',
	OAUTH_ERROR: 'OAUTH_ERROR',
	INSTANCE_CREATION_ERROR: 'INSTANCE_CREATION_ERROR',
	INSTANCE_REVOCATION_ERROR: 'INSTANCE_REVOCATION_ERROR'
};


/**
 * Creates a standardized error response
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Object} [details] - Additional error details
 * @returns {Object} Standardized error response
 */
function createErrorResponse(code, message, details = {}) {
	return {
		success: false,
		error: {
			code,
			message,
			...details
		},
		message
	};
}


/**
 * Creates a standardized success response
 * @param {string} message - Success message
 * @param {Object} [data] - Response data
 * @returns {Object} Standardized success response
 */
function createSuccessResponse(message, data = {}) {
	return {
		success: true,
		message,
		...data
	};
}


/**
 * Handles service not found errors
 * @param {string} serviceName - Service name
 * @returns {Object} Error response
 */
function handleServiceNotFound(serviceName) {
	return createErrorResponse(
		ERROR_CODES.SERVICE_NOT_FOUND,
		`Service '${serviceName}' not found or not active`,
		{ serviceName }
	);
}


/**
 * Handles function not found errors
 * @param {string} serviceName - Service name
 * @param {string} functionName - Function name
 * @returns {Object} Error response
 */
function handleFunctionNotFound(serviceName, functionName) {
	return createErrorResponse(
		ERROR_CODES.FUNCTION_NOT_FOUND,
		`Function '${functionName}' not found for service '${serviceName}'`,
		{ serviceName, functionName }
	);
}


/**
 * Handles authentication required errors
 * @returns {Object} Error response
 */
function handleAuthRequired() {
	return createErrorResponse(
		ERROR_CODES.AUTH_REQUIRED,
		'User authentication required'
	);
}


/**
 * Handles invalid service type errors
 * @param {string} serviceName - Service name
 * @param {string} expectedType - Expected service type
 * @param {string} actualType - Actual service type
 * @returns {Object} Error response
 */
function handleInvalidServiceType(serviceName, expectedType, actualType) {
	return createErrorResponse(
		ERROR_CODES.INVALID_SERVICE_TYPE,
		`Service '${serviceName}' is of type '${actualType}', expected '${expectedType}'`,
		{ serviceName, expectedType, actualType }
	);
}


/**
 * Handles registry not initialized errors
 * @returns {Object} Error response
 */
function handleRegistryNotInitialized() {
	return createErrorResponse(
		ERROR_CODES.REGISTRY_NOT_INITIALIZED,
		'Registry not initialized. Call initialize() first.'
	);
}


/**
 * Handles function execution errors
 * @param {string} serviceName - Service name
 * @param {string} functionName - Function name
 * @param {Error} error - Original error
 * @returns {Object} Error response
 */
function handleFunctionExecutionError(serviceName, functionName, error) {
	return createErrorResponse(
		ERROR_CODES.FUNCTION_EXECUTION_ERROR,
		`Failed to execute ${functionName} for service ${serviceName}: ${error.message}`,
		{ serviceName, functionName, originalError: error.message }
	);
}


/**
 * Handles validation errors
 * @param {string} field - Field that failed validation
 * @param {string} reason - Validation failure reason
 * @returns {Object} Error response
 */
function handleValidationError(field, reason) {
	return createErrorResponse(
		ERROR_CODES.VALIDATION_ERROR,
		`Validation failed for field '${field}': ${reason}`,
		{ field, reason }
	);
}


/**
 * Handles OAuth errors
 * @param {string} serviceName - Service name
 * @param {string} reason - OAuth error reason
 * @returns {Object} Error response
 */
function handleOAuthError(serviceName, reason) {
	return createErrorResponse(
		ERROR_CODES.OAUTH_ERROR,
		`OAuth error for service ${serviceName}: ${reason}`,
		{ serviceName, reason }
	);
}


/**
 * Validates request parameters
 * @param {Record<string, any>} params - Parameters to validate
 * @param {string[]} requiredFields - Required field names
 * @returns {Object|null} Error response or null if valid
 */
function validateRequestParams(params, requiredFields) {
	for (const field of requiredFields) {
		if (!params || params[field] === undefined || params[field] === null) {
			return handleValidationError(field, 'Required field is missing');
		}
		
		if (typeof params[field] === 'string' && params[field].trim() === '') {
			return handleValidationError(field, 'Required field is empty');
		}
	}
	
	return null; // No validation errors
}


/**
 * Validates service credentials based on service type
 * @param {import('../types/serviceTypes.js').CredentialsData} credentials - Credentials to validate
 * @param {import('../types/serviceTypes.js').ServiceType} serviceType - Service type
 * @returns {Object|null} Error response or null if valid
 */
function validateCredentials(credentials, serviceType) {
	if (!credentials || typeof credentials !== 'object') {
		return handleValidationError('credentials', 'Credentials must be an object');
	}

	switch (serviceType) {
		case 'apikey':
			if (!credentials.apiKey && !credentials.apiToken) {
				return handleValidationError('credentials', 'API key or token is required for API key services');
			}
			break;
			
		case 'oauth':
			if (!credentials.clientId || !credentials.clientSecret) {
				return handleValidationError('credentials', 'Client ID and secret are required for OAuth services');
			}
			break;
			
		case 'hybrid':
			// Hybrid services can accept either type
			if ((!credentials.apiKey && !credentials.apiToken) && 
			    (!credentials.clientId || !credentials.clientSecret)) {
				return handleValidationError('credentials', 'Either API key/token or OAuth credentials are required for hybrid services');
			}
			break;
			
		default:
			return handleValidationError('serviceType', `Unknown service type: ${serviceType}`);
	}

	return null; // No validation errors
}


/**
 * Logs error with context
 * @param {string} context - Error context
 * @param {Error|string} error - Error to log
 * @param {Object} [metadata] - Additional metadata
 * @returns {void}
 */
function logError(context, error, metadata = {}) {
	const errorMessage = error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : '';
	
	console.error(`❌ [${context}] ${errorMessage}`);
	
	if (Object.keys(metadata).length > 0) {
		console.error('   Metadata:', JSON.stringify(metadata, null, 2));
	}
	
	if (stack) {
		console.error('   Stack:', stack);
	}
}


/**
 * Logs warning with context
 * @param {string} context - Warning context
 * @param {string} message - Warning message
 * @param {Object} [metadata] - Additional metadata
 * @returns {void}
 */
function logWarning(context, message, metadata = {}) {
	console.warn(`⚠️  [${context}] ${message}`);
	
	if (Object.keys(metadata).length > 0) {
		console.warn('   Metadata:', JSON.stringify(metadata, null, 2));
	}
}


/**
 * Safely executes an async function with error handling
 * @param {Function} fn - Function to execute
 * @param {string} context - Execution context for logging
 * @param {*} defaultValue - Default value to return on error
 * @returns {Promise<*>} Function result or default value
 */
async function safeExecute(fn, context, defaultValue = null) {
	try {
		return await fn();
	} catch (error) {
		logError(context, error instanceof Error ? error : String(error));
		return defaultValue;
	}
}


module.exports = {
	ERROR_CODES,
	createErrorResponse,
	createSuccessResponse,
	handleServiceNotFound,
	handleFunctionNotFound,
	handleAuthRequired,
	handleInvalidServiceType,
	handleRegistryNotInitialized,
	handleFunctionExecutionError,
	handleValidationError,
	handleOAuthError,
	validateRequestParams,
	validateCredentials,
	logError,
	logWarning,
	safeExecute
};