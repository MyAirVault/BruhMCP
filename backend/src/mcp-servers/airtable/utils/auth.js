/**
 * Authentication Utilities
 * Authentication helpers for Airtable API operations
 */

const { createLogger  } = require('./logger.js');
const { validateApiToken  } = require('./validation.js');
const { AirtableErrorHandler, AuthenticationError  } = require('./errorHandler.js');

const logger = createLogger('AuthUtils');

/**
 * Token cache for validation results
 */
const tokenCache = new Map();
const CACHE_DURATION = 300000; // 5 minutes

/**
 * Token types
 */
const TOKEN_TYPES = {
	PERSONAL_ACCESS_TOKEN: 'personal_access_token',
	LEGACY_API_KEY: 'legacy_api_key'
};

/**
 * @typedef {Object} TokenValidationResult
 * @property {boolean} valid - Whether token is valid
 * @property {string} type - Token type
 * @property {string | null} expiresAt - Expiration time
 * @property {Array<string>} scopes - Token scopes
 * @property {string} userId - User ID
 */

/**
 * Validate API token
 * @param {string} token - Token to validate
 * @returns {Promise<TokenValidationResult>} Validation result
 */
async function validateToken(token) {
	if (!token) {
		throw new AuthenticationError('API token is required');
	}

	// Check cache first
	const cacheKey = `validate_${token.substring(0, 10)}`;
	const cached = tokenCache.get(cacheKey);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		logger.debug('Token validation cache hit');
		return cached.result;
	}

	try {
		// Basic format validation
		validateApiToken(token);

		// Determine token type
		const tokenType = getTokenType(token);
		
		// Test token by making a simple API call
		const response = await fetch('https://api.airtable.com/v0/meta/bases', {
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			if (response.status === 401) {
				throw new AuthenticationError('Invalid API token');
			}
			throw new Error(`Token validation failed: ${response.status} ${response.statusText}`);
		}

		const result = {
			valid: true,
			type: tokenType,
			expiresAt: null, // Airtable tokens don't expire
			scopes: await extractTokenScopes(response),
			userId: await extractUserId(response)
		};

		// Cache the result
		tokenCache.set(cacheKey, {
			result,
			timestamp: Date.now()
		});

		logger.info('Token validated successfully', {
			type: tokenType,
			userId: result.userId,
			scopes: result.scopes
		});

		return result;
	} catch (error) {
		const authError = error instanceof AuthenticationError ? error : 
			new AuthenticationError(`Token validation failed: ${error instanceof Error ? error.message : String(error)}`);
		
		logger.error('Token validation failed', { error: authError.message });
		throw authError;
	}
}

/**
 * Get token type from token string
 * @param {string} token - Token string
 * @returns {string} Token type
 */
function getTokenType(token) {
	if (token.startsWith('pat')) {
		return TOKEN_TYPES.PERSONAL_ACCESS_TOKEN;
	} else if (token.startsWith('key')) {
		return TOKEN_TYPES.LEGACY_API_KEY;
	}
	
	throw new AuthenticationError('Unknown token type');
}

/**
 * Extract token scopes from API response
 * @param {Response} _response - API response (currently unused)
 * @returns {Promise<Array<string>>} Token scopes
 */
async function extractTokenScopes(_response) {
	try {
		// For now, assume full access for validated tokens
		// In the future, this could be extracted from response headers or a dedicated endpoint
		return ['bases:read', 'bases:write', 'schema:read'];
	} catch (error) {
		logger.warn('Failed to extract token scopes', { error: error instanceof Error ? error.message : String(error) });
		return [];
	}
}

/**
 * Extract user ID from API response
 * @param {Response} _response - API response (currently unused)
 * @returns {Promise<string>} User ID
 */
async function extractUserId(_response) {
	try {
		// This would typically come from a user info endpoint
		// For now, return a placeholder
		return 'unknown';
	} catch (error) {
		logger.warn('Failed to extract user ID', { error: error instanceof Error ? error.message : String(error) });
		return 'unknown';
	}
}

/**
 * Check if token has specific scope
 * @param {string} token - Token to check
 * @param {string} scope - Required scope
 * @returns {Promise<boolean>} True if token has scope
 */
async function hasScope(token, scope) {
	try {
		const validation = await validateToken(token);
		return validation.scopes.includes(scope);
	} catch (error) {
		logger.error('Scope check failed', { scope, error: error instanceof Error ? error.message : String(error) });
		return false;
	}
}

/**
 * @typedef {Object} AuthHeader
 * @property {string} Authorization - Bearer token
 */

/**
 * Create authorization header
 * @param {string} token - API token
 * @returns {AuthHeader} Authorization header
 */
function createAuthHeader(token) {
	if (!token) {
		throw new AuthenticationError('Token is required for authorization header');
	}

	return {
		'Authorization': `Bearer ${token}`
	};
}

/**
 * @typedef {Object} AuthMiddlewareOptions
 * @property {string} [tokenHeader] - Header containing token
 * @property {string} [tokenPrefix] - Token prefix
 * @property {boolean} [validateToken] - Whether to validate token
 * @property {boolean} [cacheValidation] - Whether to cache validation
 */

/**
 * Create authentication middleware
 * @param {AuthMiddlewareOptions} [options] - Middleware options
 * @returns {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<void>} Express middleware
 */
function createAuthMiddleware(options = {}) {
	const {
		tokenHeader = 'authorization',
		tokenPrefix = 'Bearer ',
		validateToken: shouldValidate = true
	} = options;

	return async (req, res, next) => {
		try {
			// Extract token from header
			const authHeaderValue = req.headers[tokenHeader.toLowerCase()];
			if (!authHeaderValue) {
				throw new AuthenticationError('Authorization header is required');
			}

			// Handle case where header might be an array
			const authHeader = Array.isArray(authHeaderValue) ? authHeaderValue[0] : authHeaderValue;
			if (!authHeader) {
				throw new AuthenticationError('Authorization header is required');
			}

			let token;
			if (authHeader.startsWith(tokenPrefix)) {
				token = authHeader.substring(tokenPrefix.length);
			} else {
				token = authHeader;
			}

			// Validate token if requested
			if (shouldValidate) {
				const validation = await validateToken(token);
				/** @type {import('express').Request & {tokenValidation?: TokenValidationResult}} */ (req).tokenValidation = validation;
			}

			// Attach token to request
			/** @type {import('express').Request & {apiToken?: string}} */ (req).apiToken = token;
			/** @type {import('express').Request & {authHeader?: AuthHeader}} */ (req).authHeader = createAuthHeader(token);

			next();
		} catch (error) {
			const authError = AirtableErrorHandler.handle(error instanceof Error ? error : new Error(String(error)), {
				middleware: 'auth',
				method: req.method,
				url: req.url
			});

			res.status(authError.statusCode || 401).json({
				error: {
					type: authError.name,
					message: authError.message,
					code: authError.code
				}
			});
		}
	};
}

/**
 * Generate API key (for testing purposes)
 * @param {string} type - Token type
 * @returns {string} Generated token
 */
function generateTestToken(type = TOKEN_TYPES.PERSONAL_ACCESS_TOKEN) {
	const randomString = () => Math.random().toString(36).substring(2, 15);
	
	switch (type) {
		case TOKEN_TYPES.PERSONAL_ACCESS_TOKEN:
			return `pat${randomString()}.${randomString()}${randomString()}`;
		case TOKEN_TYPES.LEGACY_API_KEY:
			return `key${randomString()}`;
		default:
			throw new Error(`Unknown token type: ${type}`);
	}
}

/**
 * Refresh token validation cache
 * @param {string} token - Token to refresh
 * @returns {Promise<Object>} Validation result
 */
async function refreshTokenValidation(token) {
	const cacheKey = `validate_${token.substring(0, 10)}`;
	tokenCache.delete(cacheKey);
	
	return await validateToken(token);
}

/**
 * Clear token cache
 */
function clearTokenCache() {
	tokenCache.clear();
	logger.debug('Token cache cleared');
}

/**
 * Get token cache statistics
 * @returns {Object} Cache statistics
 */
function getTokenCacheStats() {
	return {
		size: tokenCache.size,
		keys: Array.from(tokenCache.keys()).map(key => key.substring(0, 20) + '...'),
		oldestEntry: Math.min(...Array.from(tokenCache.values()).map(v => v.timestamp)),
		newestEntry: Math.max(...Array.from(tokenCache.values()).map(v => v.timestamp))
	};
}

/**
 * Check if token is expired (placeholder for future use)
 * @param {TokenValidationResult} tokenValidation - Token validation result
 * @returns {boolean} True if expired
 */
function isTokenExpired(tokenValidation) {
	if (!tokenValidation.expiresAt) {
		return false; // Airtable tokens don't expire
	}
	
	// Convert to number if it's a string
	const expiresAt = typeof tokenValidation.expiresAt === 'string' 
		? parseInt(tokenValidation.expiresAt, 10) 
		: tokenValidation.expiresAt;
	
	return Date.now() > expiresAt;
}

/**
 * @typedef {Object} TokenInfo
 * @property {string} type - Token type
 * @property {string} prefix - Token prefix
 * @property {number} length - Token length
 * @property {number} created - Creation timestamp
 */

/**
 * Create token info object
 * @param {string} token - API token
 * @returns {TokenInfo} Token info
 */
function createTokenInfo(token) {
	return {
		type: getTokenType(token),
		prefix: token.substring(0, 6) + '...',
		length: token.length,
		created: Date.now()
	};
}

/**
 * @typedef {Object} TokenValidationResultWithInfo
 * @property {TokenInfo} token - Token info
 * @property {TokenValidationResult} [validation] - Validation result
 * @property {string} [error] - Error message
 */

/**
 * Validate multiple tokens
 * @param {Array<string>} tokens - Array of tokens
 * @returns {Promise<Array<TokenValidationResultWithInfo>>} Validation results
 */
async function validateMultipleTokens(tokens) {
	const results = [];
	
	for (const token of tokens) {
		try {
			const validation = await validateToken(token);
			results.push({ token: createTokenInfo(token), validation });
		} catch (error) {
			results.push({ 
				token: createTokenInfo(token), 
				error: error instanceof Error ? error.message : String(error)
			});
		}
	}
	
	return results;
}

/**
 * Create secure token display
 * @param {string} token - Token to display
 * @returns {string} Secure display string
 */
function createSecureTokenDisplay(token) {
	if (!token || token.length < 10) {
		return '[INVALID_TOKEN]';
	}
	
	const prefix = token.substring(0, 6);
	const suffix = token.substring(token.length - 4);
	const middle = '*'.repeat(Math.max(0, token.length - 10));
	
	return `${prefix}${middle}${suffix}`;
}

/**
 * Default export
 */

module.exports = {
	TOKEN_TYPES,
	getTokenType,
	createAuthHeader,
	createAuthMiddleware,
	generateTestToken,
	clearTokenCache,
	getTokenCacheStats,
	isTokenExpired,
	createTokenInfo,
	createSecureTokenDisplay,
	validateToken,
	hasScope,
	refreshTokenValidation,
	validateMultipleTokens
};