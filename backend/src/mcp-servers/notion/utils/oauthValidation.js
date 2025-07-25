/**
 * OAuth validation and token management utilities for Notion
 * Handles OAuth 2.0 token exchange and refresh operations
 */

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
export async function exchangeOAuthForBearer(credentials) {
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
    throw new Error('Centralized OAuth token exchange is deprecated. Notion service now handles OAuth directly through Notion\'s OAuth endpoints. Use the direct OAuth flow instead.');
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
export async function refreshBearerToken(refreshData) {
    const { refreshToken, clientId, clientSecret } = refreshData;
    
    // Validate required data
    if (!refreshToken) {
        throw new Error('Refresh token is required');
    }
    if (!clientId || !clientSecret) {
        throw new Error('OAuth Client ID and Client Secret are required');
    }
    
    // Since OAuth service manager was removed for decentralized auth,
    // delegate to the direct Notion OAuth refresh function
    console.log(`🔄 Using direct Notion OAuth token refresh (decentralized auth)`);
    return refreshBearerTokenDirect(refreshData);
}

/**
 * Token validation result
 * @typedef {Object} TokenValidationResult
 * @property {boolean} valid - Whether token is valid
 * @property {string} scope - Token scope
 * @property {number} expiresIn - Seconds until expiration (Notion tokens don't expire)
 * @property {string} userId - User ID
 * @property {string} workspaceName - Workspace name
 */

/**
 * Validate OAuth Bearer token with Notion
 * @param {string} bearerToken - Bearer token to validate
 * @returns {Promise<TokenValidationResult>} Token validation result
 */
export async function validateBearerToken(bearerToken) {
    if (!bearerToken) {
        throw new Error('Bearer token is required for validation');
    }
    
    console.log(`🔍 Validating Notion Bearer token`);
    
    try {
        // Use Notion's /users/me endpoint to validate the token
        const response = await fetch('https://api.notion.com/v1/users/me', {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Notion-Version': '2022-06-28'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Token validation failed: ${response.status} ${response.statusText}`);
        }
        
        const userInfo = /** @type {NotionUserResponse} */ (await response.json());
        
        console.log(`✅ Notion Bearer token validated successfully`);
        
        return {
            valid: true,
            scope: 'read_content,insert_content,update_content', // Notion doesn't return scopes in validation
            expiresIn: -1, // Notion tokens don't expire
            userId: userInfo.id,
            workspaceName: userInfo.name || 'Unknown Workspace'
        };
    } catch (error) {
        console.error('Notion Bearer token validation failed:', error);
        throw new Error(`Token validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Token expiration data
 * @typedef {Object} TokenData
 * @property {number} expiresAt - Token expiration timestamp
 */

/**
 * Check if Bearer token is expired or will expire soon
 * Note: Notion tokens don't expire, so this always returns false
 * @param {TokenData} tokenData - Token data with expiration info
 * @param {number} [bufferMinutes=5] - Minutes before expiry to consider token as expired
 * @returns {boolean} True if token is expired or will expire soon
 */
export function isTokenExpired(tokenData, bufferMinutes = 5) {
    // Notion tokens don't expire
    // Parameters are kept for API compatibility but not used
    void tokenData;
    void bufferMinutes;
    return false;
}

/**
 * Notion API user response
 * @typedef {Object} NotionUserResponse
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} type - User type
 * @property {string} avatar_url - Avatar URL
 */

/**
 * User information from token
 * @typedef {Object} UserInfo
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} type - User type
 * @property {string} avatarUrl - Avatar URL
 */

/**
 * Notion OAuth token API response
 * @typedef {Object} NotionTokenResponse
 * @property {string} access_token - Access token
 * @property {string} [refresh_token] - Refresh token (optional)
 * @property {number} [expires_in] - Token expiration in seconds
 * @property {string} [token_type] - Token type
 * @property {string} [scope] - Token scope
 */

/**
 * Extract user information from Bearer token
 * @param {string} bearerToken - Bearer token
 * @returns {Promise<UserInfo>} User information
 */
export async function getUserInfoFromToken(bearerToken) {
    if (!bearerToken) {
        throw new Error('Bearer token is required');
    }
    
    console.log(`👤 Fetching user info from Notion Bearer token`);
    
    try {
        const response = await fetch('https://api.notion.com/v1/users/me', {
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Notion-Version': '2022-06-28'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
        }
        
        const userInfo = /** @type {NotionUserResponse} */ (await response.json());
        
        console.log(`✅ Retrieved Notion user info for: ${userInfo.name}`);
        
        return {
            id: userInfo.id,
            name: userInfo.name,
            type: userInfo.type,
            avatarUrl: userInfo.avatar_url
        };
    } catch (error) {
        console.error('Failed to get Notion user info:', error);
        throw new Error(`User info retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Direct Notion OAuth token refresh (bypass OAuth service)
 * @param {RefreshData} refreshData - Refresh token data
 * @returns {Promise<TokenResponse>} New token response
 */
export async function refreshBearerTokenDirect(refreshData) {
    const { refreshToken, clientId, clientSecret } = refreshData;
    
    // Validate required data
    if (!refreshToken) {
        throw new Error('Refresh token is required');
    }
    if (!clientId || !clientSecret) {
        throw new Error('OAuth Client ID and Client Secret are required');
    }
    
    console.log(`🔄 Direct Notion OAuth token refresh (bypassing OAuth service)`);
    
    try {
        const response = await fetch('https://api.notion.com/v1/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = `Direct token refresh failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`;
            const error = new Error(errorMessage);
            /** @type {Error & {status: number}} */
            const errorWithStatus = Object.assign(error, { status: response.status });
            throw errorWithStatus;
        }
        
        const tokens = /** @type {NotionTokenResponse} */ (await response.json());
        
        // Validate response contains required fields
        if (!tokens.access_token) {
            throw new Error('Invalid token response: missing access_token');
        }
        
        console.log(`✅ Direct Notion OAuth token refresh successful`);
        
        return {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || refreshToken,
            expires_in: tokens.expires_in || 3600, // Notion tokens don't expire, but provide default
            token_type: tokens.token_type || 'Bearer',
            scope: tokens.scope || 'read_content insert_content update_content'
        };
    } catch (error) {
        console.error('Direct Notion OAuth token refresh failed:', error);
        
        // Enhanced error handling for common OAuth errors
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('invalid_grant')) {
            throw new Error('invalid_grant: Invalid refresh token - user may need to re-authorize');
        } else if (errorMessage.includes('invalid_client')) {
            throw new Error('invalid_client: Invalid OAuth client credentials');
        } else if (errorMessage.includes('invalid_request')) {
            throw new Error('invalid_request: Invalid token refresh request format');
        }
        
        throw error;
    }
}

/**
 * Revoke OAuth token
 * Note: Notion doesn't provide a token revocation endpoint
 * @param {string} token - Token to revoke (access or refresh token)
 * @returns {Promise<boolean>} True if revocation was successful
 */
export async function revokeToken(token) {
    if (!token) {
        throw new Error('Token is required for revocation');
    }
    
    console.log(`🔒 Notion token revocation (not supported by Notion API)`);
    
    // Notion doesn't provide a token revocation endpoint
    // Tokens can only be revoked by the user in their Notion settings
    console.log(`⚠️  Notion does not support programmatic token revocation`);
    
    return true; // Return true since there's no error, just not supported
}

export default {
    exchangeOAuthForBearer,
    refreshBearerToken,
    validateBearerToken,
    isTokenExpired,
    getUserInfoFromToken,
    refreshBearerTokenDirect,
    revokeToken
};