/**
 * @fileoverview Reddit OAuth Validation Utilities
 * Utilities for validating and processing Reddit OAuth tokens and operations
 */

/**
 * @typedef {import('../middleware/types.js').TokenInfo} TokenInfo
 * @typedef {import('../middleware/types.js').TokenRefreshResult} TokenRefreshResult
 */

/**
 * Validates OAuth token format
 * @param {string} token - Token to validate
 * @returns {boolean} Whether the token format is valid
 */
function validateTokenFormat(token) {
	if (!token || typeof token !== 'string') {
		return false;
	}

	// Reddit OAuth tokens are typically 30-50 characters long
	if (token.length < 20 || token.length > 100) {
		return false;
	}

	// Check for valid token characters (alphanumeric, dashes, underscores)
	const tokenRegex = /^[a-zA-Z0-9_-]+$/;
	return tokenRegex.test(token);
}

/**
 * Validates OAuth scope format
 * @param {string} scope - Scope string to validate
 * @returns {boolean} Whether the scope format is valid
 */
function validateScopeFormat(scope) {
	if (!scope || typeof scope !== 'string') {
		return false;
	}

	// Reddit scopes are space-separated
	const scopes = scope.split(' ');
	const validScopes = ['identity', 'read', 'vote', 'submit', 'flair', 'edit', 'privatemessages', 'modposts', 'modconfig'];
	
	return scopes.every(s => validScopes.includes(s));
}

/**
 * Checks if a token is expired
 * @param {number} expiresAt - Token expiration timestamp
 * @param {number} [bufferMinutes=5] - Buffer time in minutes before considering expired
 * @returns {boolean} Whether the token is expired
 */
function isTokenExpired(expiresAt, bufferMinutes = 5) {
	if (!expiresAt || typeof expiresAt !== 'number') {
		return true;
	}

	const bufferMs = bufferMinutes * 60 * 1000;
	return Date.now() >= (expiresAt - bufferMs);
}

/**
 * Validates client ID format for Reddit
 * @param {string} clientId - Client ID to validate
 * @returns {boolean} Whether the client ID format is valid
 */
function validateClientIdFormat(clientId) {
	if (!clientId || typeof clientId !== 'string') {
		return false;
	}

	// Reddit client IDs are typically 20-22 characters
	if (clientId.length < 15 || clientId.length > 30) {
		return false;
	}

	// Check for valid characters
	const clientIdRegex = /^[a-zA-Z0-9_-]+$/;
	return clientIdRegex.test(clientId);
}

/**
 * Validates client secret format for Reddit
 * @param {string} clientSecret - Client secret to validate
 * @returns {boolean} Whether the client secret format is valid
 */
function validateClientSecretFormat(clientSecret) {
	if (!clientSecret || typeof clientSecret !== 'string') {
		return false;
	}

	// Reddit client secrets are typically 25-30 characters
	if (clientSecret.length < 20 || clientSecret.length > 40) {
		return false;
	}

	// Check for valid characters
	const clientSecretRegex = /^[a-zA-Z0-9_-]+$/;
	return clientSecretRegex.test(clientSecret);
}

/**
 * Extracts token information from various formats
 * @param {Object} tokenData - Token data in various formats
 * @returns {TokenInfo} Normalized token information
 */
function extractTokenInfo(tokenData) {
	if (!tokenData || typeof tokenData !== 'object') {
		return {};
	}

	return {
		accessToken: /** @type {{access_token?: string, accessToken?: string, bearerToken?: string}} */ (tokenData).access_token || /** @type {{accessToken?: string}} */ (tokenData).accessToken || /** @type {{bearerToken?: string}} */ (tokenData).bearerToken,
		refreshToken: /** @type {{refresh_token?: string, refreshToken?: string}} */ (tokenData).refresh_token || /** @type {{refreshToken?: string}} */ (tokenData).refreshToken,
		tokenExpiresAt: /** @type {{expires_at?: number, expiresAt?: number}} */ (tokenData).expires_at || /** @type {{expiresAt?: number}} */ (tokenData).expiresAt || 
			(/** @type {{expires_in?: number}} */ (tokenData).expires_in ? Date.now() + (/** @type {{expires_in: number}} */ (tokenData).expires_in * 1000) : undefined)
	};
}

/**
 * Validates OAuth credentials object
 * @param {Object} credentials - Credentials object to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
function validateOAuthCredentials(credentials) {
	if (!credentials || typeof credentials !== 'object') {
		return { valid: false, error: 'Credentials must be an object' };
	}

	const clientId = /** @type {{client_id?: string, clientId?: string}} */ (credentials).client_id || /** @type {{clientId?: string}} */ (credentials).clientId;
	const clientSecret = /** @type {{client_secret?: string, clientSecret?: string}} */ (credentials).client_secret || /** @type {{clientSecret?: string}} */ (credentials).clientSecret;

	if (!clientId) {
		return { valid: false, error: 'Client ID is required' };
	}

	if (!clientSecret) {
		return { valid: false, error: 'Client secret is required' };
	}

	if (!validateClientIdFormat(clientId)) {
		return { valid: false, error: 'Invalid client ID format' };
	}

	if (!validateClientSecretFormat(clientSecret)) {
		return { valid: false, error: 'Invalid client secret format' };
	}

	return { valid: true };
}

/**
 * Sanitizes token for logging (removes sensitive parts)
 * @param {string} token - Token to sanitize
 * @returns {string} Sanitized token
 */
function sanitizeTokenForLogging(token) {
	if (!token || typeof token !== 'string') {
		return '[invalid_token]';
	}

	if (token.length <= 8) {
		return '[short_token]';
	}

	// Show first 4 and last 4 characters
	return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
}

/**
 * Creates a standardized error for OAuth validation failures
 * @param {string} message - Error message
 * @param {string} field - Field that failed validation
 * @returns {Error} Standardized error
 */
function createOAuthValidationError(message, field) {
	const error = new Error(message);
	error.name = 'OAuthValidationError';
	// @ts-ignore
	error.field = field;
	return error;
}

/**
 * OAuth credentials for token exchange
 * @typedef {Object} OAuthCredentials
 * @property {string} clientId - OAuth Client ID
 * @property {string} clientSecret - OAuth Client Secret
 * @property {Array<string>} scopes - Required OAuth scopes
 */

/**
 * OAuth token response
 * @typedef {Object} TokenResponse
 * @property {string} access_token - Access token
 * @property {string} refresh_token - Refresh token
 * @property {number} expires_in - Token expiration in seconds
 * @property {string} token_type - Token type (usually 'Bearer')
 * @property {string} scope - Granted scopes
 */

/**
 * Exchange OAuth credentials for Bearer token via OAuth service
 * @param {OAuthCredentials} credentials - OAuth credentials
 * @returns {Promise<TokenResponse>} Token response with access_token and refresh_token
 */
async function exchangeOAuthForBearer(credentials) {
    const { clientId, clientSecret, scopes } = credentials;
    // Validate required credentials
    if (!clientId || !clientSecret) {
        throw new Error('OAuth Client ID and Client Secret are required');
    }
    if (!scopes || scopes.length === 0) {
        throw new Error('OAuth scopes are required');
    }
    
    // Since OAuth service manager was removed for decentralized auth,
    // this function should not be used for new implementations.
    // Each service now handles its own OAuth flow.
    throw new Error('Centralized OAuth token exchange is deprecated. Reddit service now handles OAuth directly through Reddit\'s OAuth endpoints. Use the direct OAuth flow instead.');
}

/**
 * Refresh token data
 * @typedef {Object} RefreshData
 * @property {string} refreshToken - OAuth refresh token
 * @property {string} clientId - OAuth Client ID
 * @property {string} clientSecret - OAuth Client Secret
 */

/**
 * Refresh an expired Bearer token using refresh token
 * @param {RefreshData} refreshData - Refresh token data
 * @returns {Promise<TokenResponse>} New token response
 */
async function refreshBearerToken(refreshData) {
    const { refreshToken, clientId, clientSecret } = refreshData;
    // Validate required data
    if (!refreshToken) {
        throw new Error('Refresh token is required');
    }
    if (!clientId || !clientSecret) {
        throw new Error('OAuth Client ID and Client Secret are required');
    }
    
    // Since OAuth service manager was removed for decentralized auth,
    // delegate to the direct Reddit OAuth refresh function
    console.log(`🔄 Using direct Reddit OAuth token refresh (decentralized auth)`);
    return refreshBearerTokenDirect(refreshData);
}

/**
 * Direct Reddit OAuth token refresh (bypass OAuth service)
 * @param {RefreshData} refreshData - Refresh token data
 * @returns {Promise<TokenResponse>} New token response
 */
async function refreshBearerTokenDirect(refreshData) {
    const { refreshToken, clientId, clientSecret } = refreshData;
    // Validate required data
    if (!refreshToken) {
        throw new Error('Refresh token is required');
    }
    if (!clientId || !clientSecret) {
        throw new Error('OAuth Client ID and Client Secret are required');
    }
    
    console.log(`🔄 Direct Reddit OAuth token refresh (bypassing OAuth service)`);
    try {
        const response = await fetch('https://www.reddit.com/api/v1/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
                'User-Agent': 'MCP Reddit Service/1.0'
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Reddit OAuth refresh failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const tokens = /** @type {{access_token?: string, refresh_token?: string, expires_in?: number, token_type?: string, scope?: string}} */ (await response.json());
        
        if (!tokens.access_token) {
            throw new Error('No access token received from Reddit OAuth refresh');
        }

        console.log(`✅ Direct Reddit OAuth token refresh successful`);
        
        return {
            access_token: /** @type {{access_token: string}} */ (tokens).access_token,
            refresh_token: /** @type {{refresh_token?: string}} */ (tokens).refresh_token || refreshToken, // Reddit may not always return new refresh token
            expires_in: /** @type {{expires_in?: number}} */ (tokens).expires_in || 3600, // Default to 1 hour if not provided
            token_type: /** @type {{token_type?: string}} */ (tokens).token_type || 'Bearer',
            scope: /** @type {{scope?: string}} */ (tokens).scope || 'identity read vote submit flair edit privatemessages'
        };
    } catch (error) {
        console.error('Direct Reddit OAuth token refresh failed:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Reddit OAuth token refresh failed: ${errorMessage}`);
    }
}

export {
	validateTokenFormat,
	validateScopeFormat,
	isTokenExpired,
	validateClientIdFormat,
	validateClientSecretFormat,
	extractTokenInfo,
	validateOAuthCredentials,
	sanitizeTokenForLogging,
	createOAuthValidationError,
	exchangeOAuthForBearer,
	refreshBearerToken,
	refreshBearerTokenDirect
};