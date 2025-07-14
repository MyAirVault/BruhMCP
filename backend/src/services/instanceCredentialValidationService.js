import { testAPICredentials } from './credentialValidationService.js';
import { getMCPTypeByName } from '../db/queries/mcpTypesQueries.js';

/**
 * Enhanced credential validation service for instance updates
 * Builds on existing credentialValidationService with instance-specific logic
 */

/**
 * Validate credentials for a specific service instance
 * @param {string} serviceName - Service name (figma, github, etc.)
 * @param {Object} credentials - Credentials to validate
 * @returns {Promise<Object>} Validation result with detailed feedback
 */
export async function validateCredentialsForService(serviceName, credentials) {
	try {
		// Get MCP type ID for the service
		const mcpType = await getMCPTypeByName(serviceName);
		if (!mcpType) {
			return {
				isValid: false,
				error: `Unknown service: ${serviceName}`,
				errorCode: 'UNKNOWN_SERVICE',
				details: {
					serviceName,
					suggestion: 'Please verify the service name is correct'
				}
			};
		}

		// Use existing validation service
		const validationResult = await testAPICredentials(mcpType.mcp_service_id, credentials);

		// Transform result to standardized format
		if (validationResult.valid) {
			return {
				isValid: true,
				message: `Successfully validated ${serviceName} credentials`,
				service: serviceName,
				userInfo: validationResult.api_info,
				testEndpoint: getTestEndpointForService(serviceName),
				validatedAt: new Date().toISOString()
			};
		} else {
			return {
				isValid: false,
				error: validationResult.error_message || 'Credential validation failed',
				errorCode: validationResult.error_code || 'VALIDATION_FAILED',
				service: serviceName,
				details: {
					...validationResult.details,
					testEndpoint: getTestEndpointForService(serviceName),
					suggestion: getSuggestionForService(serviceName, validationResult.error_code)
				}
			};
		}

	} catch (error) {
		console.error(`Error validating ${serviceName} credentials:`, error);
		return {
			isValid: false,
			error: 'Failed to validate credentials due to system error',
			errorCode: 'SYSTEM_ERROR',
			service: serviceName,
			details: {
				systemError: error instanceof Error ? error.message : String(error),
				suggestion: 'Please try again or contact support if the problem persists'
			}
		};
	}
}

/**
 * Validate Figma credentials specifically
 * @param {string} apiKey - Figma Personal Access Token
 * @returns {Promise<Object>} Validation result
 */
export async function validateFigmaCredentials(apiKey) {
	return validateCredentialsForService('figma', { api_key: apiKey });
}

/**
 * Validate GitHub credentials specifically
 * @param {string} apiKey - GitHub Personal Access Token
 * @returns {Promise<Object>} Validation result
 */
export async function validateGithubCredentials(apiKey) {
	return validateCredentialsForService('github', { api_key: apiKey });
}

/**
 * Validate credentials with format checking
 * @param {string} serviceName - Service name
 * @param {Object} credentials - Credentials to validate
 * @returns {Promise<Object>} Validation result with format validation
 */
export async function validateCredentialsWithFormat(serviceName, credentials) {
	// Pre-validation format checks
	const formatValidation = validateCredentialFormat(serviceName, credentials);
	if (!formatValidation.isValid) {
		return formatValidation;
	}

	// Proceed with API validation
	return validateCredentialsForService(serviceName, credentials);
}

/**
 * Validate credential format before API testing
 * @param {string} serviceName - Service name
 * @param {Object} credentials - Credentials to validate
 * @returns {Object} Format validation result
 */
function validateCredentialFormat(serviceName, credentials) {
	if (!credentials || typeof credentials !== 'object') {
		return {
			isValid: false,
			error: 'Credentials must be a valid object',
			errorCode: 'INVALID_FORMAT',
			service: serviceName
		};
	}

	switch (serviceName) {
		case 'figma':
			return validateFigmaCredentialFormat(credentials);
		
		case 'github':
			return validateGithubCredentialFormat(credentials);
		
		default:
			// For unknown services, just check if api_key exists
			if (!credentials.api_key) {
				return {
					isValid: false,
					error: 'API key is required',
					errorCode: 'MISSING_API_KEY',
					service: serviceName
				};
			}
			return { isValid: true };
	}
}

/**
 * Validate Figma credential format
 * @param {Object} credentials - Credentials object
 * @returns {Object} Format validation result
 */
function validateFigmaCredentialFormat(credentials) {
	if (!credentials.api_key) {
		return {
			isValid: false,
			error: 'Figma API key is required',
			errorCode: 'MISSING_API_KEY',
			service: 'figma',
			details: {
				suggestion: 'Please provide your Figma Personal Access Token'
			}
		};
	}

	if (typeof credentials.api_key !== 'string') {
		return {
			isValid: false,
			error: 'Figma API key must be a string',
			errorCode: 'INVALID_FORMAT',
			service: 'figma'
		};
	}

	if (!credentials.api_key.startsWith('figd_')) {
		return {
			isValid: false,
			error: 'Figma API key must start with "figd_"',
			errorCode: 'INVALID_FORMAT',
			service: 'figma',
			details: {
				suggestion: 'Please check your Figma Personal Access Token format'
			}
		};
	}

	if (credentials.api_key.length < 10) {
		return {
			isValid: false,
			error: 'Figma API key appears to be too short',
			errorCode: 'INVALID_FORMAT',
			service: 'figma',
			details: {
				suggestion: 'Please verify you copied the complete API key'
			}
		};
	}

	return { isValid: true };
}

/**
 * Validate GitHub credential format
 * @param {Object} credentials - Credentials object
 * @returns {Object} Format validation result
 */
function validateGithubCredentialFormat(credentials) {
	if (!credentials.api_key) {
		return {
			isValid: false,
			error: 'GitHub Personal Access Token is required',
			errorCode: 'MISSING_API_KEY',
			service: 'github',
			details: {
				suggestion: 'Please provide your GitHub Personal Access Token'
			}
		};
	}

	if (typeof credentials.api_key !== 'string') {
		return {
			isValid: false,
			error: 'GitHub token must be a string',
			errorCode: 'INVALID_FORMAT',
			service: 'github'
		};
	}

	// GitHub classic tokens start with 'ghp_', fine-grained tokens start with 'github_pat_'
	if (!credentials.api_key.startsWith('ghp_') && !credentials.api_key.startsWith('github_pat_')) {
		return {
			isValid: false,
			error: 'GitHub token must start with "ghp_" or "github_pat_"',
			errorCode: 'INVALID_FORMAT',
			service: 'github',
			details: {
				suggestion: 'Please check your GitHub Personal Access Token format'
			}
		};
	}

	return { isValid: true };
}

/**
 * Get test endpoint for a service
 * @param {string} serviceName - Service name
 * @returns {string} Test endpoint URL
 */
function getTestEndpointForService(serviceName) {
	const endpoints = {
		figma: 'https://api.figma.com/v1/me',
		github: 'https://api.github.com/user',
		slack: 'https://slack.com/api/auth.test'
	};
	
	return endpoints[serviceName] || 'Unknown endpoint';
}

/**
 * Get suggestion message for service validation errors
 * @param {string} serviceName - Service name
 * @param {string} errorCode - Error code from validation
 * @returns {string} Helpful suggestion message
 */
function getSuggestionForService(serviceName, errorCode) {
	const suggestions = {
		figma: {
			'INVALID_CREDENTIALS': 'Please verify your Figma Personal Access Token in your Figma Account Settings',
			'API_ERROR': 'Please check your internet connection and try again',
			'INVALID_FORMAT': 'Figma API keys should start with "figd_" and be at least 10 characters long'
		},
		github: {
			'INVALID_CREDENTIALS': 'Please verify your GitHub Personal Access Token has the required permissions',
			'API_ERROR': 'Please check your internet connection and GitHub API status',
			'INVALID_FORMAT': 'GitHub tokens should start with "ghp_" or "github_pat_"'
		}
	};

	const servicesSuggestions = suggestions[serviceName];
	if (servicesSuggestions && servicesSuggestions[errorCode]) {
		return servicesSuggestions[errorCode];
	}

	return 'Please verify your credentials and try again';
}

/**
 * Test credential connectivity without full validation
 * Useful for quick health checks
 * @param {string} serviceName - Service name
 * @param {Object} credentials - Credentials to test
 * @returns {Promise<Object>} Basic connectivity result
 */
export async function testCredentialConnectivity(serviceName, credentials) {
	try {
		const result = await validateCredentialsForService(serviceName, credentials);
		return {
			connected: result.isValid,
			service: serviceName,
			message: result.isValid ? 'Connection successful' : 'Connection failed',
			error: result.isValid ? null : result.error
		};
	} catch (error) {
		return {
			connected: false,
			service: serviceName,
			message: 'Connection test failed',
			error: error instanceof Error ? error.message : String(error)
		};
	}
}