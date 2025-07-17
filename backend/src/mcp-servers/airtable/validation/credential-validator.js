/**
 * Credential Validator
 * Validates and manages Airtable API credentials
 */

import { createLogger } from '../utils/logger.js';
import { validateApiToken, validateAirtableId } from '../utils/validation.js';
import { validateToken, getTokenType } from '../utils/auth.js';
import { AirtableErrorHandler, ValidationError, AuthenticationError } from '../utils/error-handler.js';

const logger = createLogger('CredentialValidator');

export class CredentialValidator {
	constructor() {
		this.validationCache = new Map();
		this.cacheTimeout = 300000; // 5 minutes
		this.validationRules = {
			enforceTokenFormat: true,
			requireActiveToken: true,
			checkTokenScopes: true,
			validateBaseAccess: false, // Optional: validate access to specific bases
			maxTokenAge: null, // Optional: maximum token age in milliseconds
			allowedTokenTypes: ['personal_access_token', 'legacy_api_key']
		};
	}

	/**
	 * Set validation rules
	 * @param {Object} rules - Validation rules
	 */
	setValidationRules(rules) {
		this.validationRules = { ...this.validationRules, ...rules };
		logger.debug('Validation rules updated', { rules: this.validationRules });
	}

	/**
	 * Validate credentials
	 * @param {Object} credentials - Credentials to validate
	 * @param {Object} options - Validation options
	 * @returns {Promise<Object>} Validation result
	 */
	async validateCredentials(credentials, options = {}) {
		const { useCache = true, skipTokenValidation = false } = options;

		try {
			// Basic structure validation
			const structureValidation = this.validateCredentialStructure(credentials);
			if (!structureValidation.valid) {
				throw new ValidationError('Invalid credential structure', structureValidation.errors);
			}

			const { apiKey, instanceId } = credentials;

			// Check cache first
			const cacheKey = `${instanceId}_${apiKey.substring(0, 10)}`;
			if (useCache) {
				const cached = this.validationCache.get(cacheKey);
				if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
					logger.debug('Credential validation cache hit', { instanceId });
					return cached.result;
				}
			}

			// Validate API key format
			if (this.validationRules.enforceTokenFormat) {
				validateApiToken(apiKey);
			}

			// Validate instance ID format
			if (instanceId && !this.isValidInstanceId(instanceId)) {
				throw new ValidationError('Invalid instance ID format');
			}

			// Get token type
			const tokenType = getTokenType(apiKey);
			if (!this.validationRules.allowedTokenTypes.includes(tokenType)) {
				throw new ValidationError(`Token type '${tokenType}' is not allowed`);
			}

			let tokenValidation = null;
			
			// Validate token with Airtable API
			if (!skipTokenValidation) {
				tokenValidation = await this.validateTokenWithAPI(apiKey);
			}

			// Additional validations
			const additionalValidations = await this.performAdditionalValidations(credentials, tokenValidation);

			const result = {
				valid: true,
				credentials: {
					instanceId,
					tokenType,
					scopes: tokenValidation?.scopes || [],
					userId: tokenValidation?.userId || 'unknown'
				},
				validation: {
					structure: structureValidation,
					token: tokenValidation,
					additional: additionalValidations
				},
				timestamp: Date.now()
			};

			// Cache the result
			if (useCache) {
				this.validationCache.set(cacheKey, {
					result,
					timestamp: Date.now()
				});
			}

			logger.info('Credentials validated successfully', {
				instanceId,
				tokenType,
				scopes: tokenValidation?.scopes || []
			});

			return result;
		} catch (error) {
			const validationError = AirtableErrorHandler.handle(error, {
				operation: 'validateCredentials',
				instanceId: credentials.instanceId
			});
			throw validationError;
		}
	}

	/**
	 * Validate credential structure
	 * @param {Object} credentials - Credentials to validate
	 * @returns {Object} Structure validation result
	 */
	validateCredentialStructure(credentials) {
		const errors = [];

		// Check required fields
		if (!credentials) {
			errors.push('Credentials object is required');
		} else {
			if (!credentials.apiKey) {
				errors.push('API key is required');
			} else if (typeof credentials.apiKey !== 'string') {
				errors.push('API key must be a string');
			}

			if (credentials.instanceId && typeof credentials.instanceId !== 'string') {
				errors.push('Instance ID must be a string');
			}
		}

		return {
			valid: errors.length === 0,
			errors
		};
	}

	/**
	 * Validate token with Airtable API
	 * @param {string} apiKey - API key to validate
	 * @returns {Promise<Object>} Token validation result
	 */
	async validateTokenWithAPI(apiKey) {
		try {
			const validation = await validateToken(apiKey);
			
			// Check if token is active
			if (this.validationRules.requireActiveToken && !validation.valid) {
				throw new AuthenticationError('Token is not active');
			}

			// Check token scopes if required
			if (this.validationRules.checkTokenScopes && (!validation.scopes || validation.scopes.length === 0)) {
				throw new AuthenticationError('Token has no valid scopes');
			}

			return validation;
		} catch (error) {
			if (error instanceof AuthenticationError) {
				throw error;
			}
			throw new AuthenticationError(`Token validation failed: ${error.message}`);
		}
	}

	/**
	 * Perform additional validations
	 * @param {Object} credentials - Credentials
	 * @param {Object} tokenValidation - Token validation result
	 * @returns {Promise<Object>} Additional validation results
	 */
	async performAdditionalValidations(credentials, tokenValidation) {
		const validations = {};

		// Validate base access if required
		if (this.validationRules.validateBaseAccess && credentials.baseId) {
			validations.baseAccess = await this.validateBaseAccess(credentials.apiKey, credentials.baseId);
		}

		// Check token age if required
		if (this.validationRules.maxTokenAge && tokenValidation) {
			validations.tokenAge = this.validateTokenAge(tokenValidation);
		}

		// Check required scopes
		if (this.validationRules.requiredScopes && tokenValidation) {
			validations.scopes = this.validateRequiredScopes(tokenValidation.scopes);
		}

		return validations;
	}

	/**
	 * Validate base access
	 * @param {string} apiKey - API key
	 * @param {string} baseId - Base ID
	 * @returns {Promise<Object>} Base access validation result
	 */
	async validateBaseAccess(apiKey, baseId) {
		try {
			validateAirtableId(baseId, 'base');

			const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
				headers: {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				}
			});

			if (response.status === 404) {
				return {
					valid: false,
					error: 'Base not found or access denied'
				};
			}

			if (!response.ok) {
				return {
					valid: false,
					error: `Base access validation failed: ${response.status} ${response.statusText}`
				};
			}

			return {
				valid: true,
				baseId,
				hasAccess: true
			};
		} catch (error) {
			return {
				valid: false,
				error: error.message
			};
		}
	}

	/**
	 * Validate token age
	 * @param {Object} tokenValidation - Token validation result
	 * @returns {Object} Token age validation result
	 */
	validateTokenAge(tokenValidation) {
		// For now, Airtable tokens don't have creation timestamps
		// This is a placeholder for future implementation
		return {
			valid: true,
			age: null,
			maxAge: this.validationRules.maxTokenAge
		};
	}

	/**
	 * Validate required scopes
	 * @param {Array} tokenScopes - Token scopes
	 * @returns {Object} Scope validation result
	 */
	validateRequiredScopes(tokenScopes) {
		const requiredScopes = this.validationRules.requiredScopes || [];
		const missingScopes = requiredScopes.filter(scope => !tokenScopes.includes(scope));

		return {
			valid: missingScopes.length === 0,
			required: requiredScopes,
			available: tokenScopes,
			missing: missingScopes
		};
	}

	/**
	 * Validate instance ID format
	 * @param {string} instanceId - Instance ID
	 * @returns {boolean} True if valid
	 */
	isValidInstanceId(instanceId) {
		// Basic validation - alphanumeric, hyphens, underscores
		return /^[a-zA-Z0-9_-]+$/.test(instanceId) && instanceId.length > 0 && instanceId.length <= 100;
	}

	/**
	 * Validate multiple credentials
	 * @param {Array} credentialsList - Array of credentials
	 * @param {Object} options - Validation options
	 * @returns {Promise<Array>} Array of validation results
	 */
	async validateMultipleCredentials(credentialsList, options = {}) {
		const results = [];

		for (const credentials of credentialsList) {
			try {
				const result = await this.validateCredentials(credentials, options);
				results.push(result);
			} catch (error) {
				results.push({
					valid: false,
					error: error.message,
					credentials: credentials.instanceId || 'unknown'
				});
			}
		}

		logger.info('Multiple credentials validated', {
			total: credentialsList.length,
			valid: results.filter(r => r.valid).length,
			invalid: results.filter(r => !r.valid).length
		});

		return results;
	}

	/**
	 * Refresh credential validation
	 * @param {Object} credentials - Credentials to refresh
	 * @returns {Promise<Object>} Refreshed validation result
	 */
	async refreshCredentialValidation(credentials) {
		const cacheKey = `${credentials.instanceId}_${credentials.apiKey.substring(0, 10)}`;
		this.validationCache.delete(cacheKey);

		return await this.validateCredentials(credentials, { useCache: false });
	}

	/**
	 * Get validation rules
	 * @returns {Object} Current validation rules
	 */
	getValidationRules() {
		return { ...this.validationRules };
	}

	/**
	 * Clear validation cache
	 */
	clearValidationCache() {
		this.validationCache.clear();
		logger.debug('Validation cache cleared');
	}

	/**
	 * Get validation cache statistics
	 * @returns {Object} Cache statistics
	 */
	getValidationCacheStats() {
		const now = Date.now();
		let validEntries = 0;
		let expiredEntries = 0;

		for (const [key, cached] of this.validationCache) {
			if (now - cached.timestamp < this.cacheTimeout) {
				validEntries++;
			} else {
				expiredEntries++;
			}
		}

		return {
			totalEntries: this.validationCache.size,
			validEntries,
			expiredEntries,
			cacheTimeout: this.cacheTimeout
		};
	}

	/**
	 * Cleanup expired cache entries
	 */
	cleanupExpiredEntries() {
		const now = Date.now();
		let cleanedCount = 0;

		for (const [key, cached] of this.validationCache) {
			if (now - cached.timestamp >= this.cacheTimeout) {
				this.validationCache.delete(key);
				cleanedCount++;
			}
		}

		if (cleanedCount > 0) {
			logger.debug('Expired validation cache entries cleaned', { cleanedCount });
		}

		return cleanedCount;
	}

	/**
	 * Create validation report
	 * @param {Object} validationResult - Validation result
	 * @returns {Object} Validation report
	 */
	createValidationReport(validationResult) {
		return {
			summary: {
				valid: validationResult.valid,
				instanceId: validationResult.credentials?.instanceId,
				tokenType: validationResult.credentials?.tokenType,
				timestamp: validationResult.timestamp
			},
			details: {
				structure: validationResult.validation?.structure,
				token: validationResult.validation?.token,
				additional: validationResult.validation?.additional
			},
			recommendations: this.generateRecommendations(validationResult)
		};
	}

	/**
	 * Generate recommendations based on validation result
	 * @param {Object} validationResult - Validation result
	 * @returns {Array} Array of recommendations
	 */
	generateRecommendations(validationResult) {
		const recommendations = [];

		if (!validationResult.valid) {
			recommendations.push('Fix validation errors before proceeding');
		}

		if (validationResult.credentials?.tokenType === 'legacy_api_key') {
			recommendations.push('Consider upgrading to Personal Access Token for better security');
		}

		const scopes = validationResult.credentials?.scopes || [];
		if (scopes.length === 0) {
			recommendations.push('Token has no scopes - verify token permissions');
		}

		return recommendations;
	}
}