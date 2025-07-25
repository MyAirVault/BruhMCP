/**
 * OAuth validation and token management utilities for Dropbox
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
 * Dropbox account info response from API
 * @typedef {Object} DropboxAccountInfo
 * @property {string} account_id - Dropbox account ID
 * @property {string} email - User email address
 * @property {boolean} email_verified - Email verification status
 * @property {Object} name - User name object
 * @property {string} name.display_name - Display name
 * @property {string} name.given_name - Given name
 * @property {string} name.surname - Surname
 * @property {string} locale - User locale
 */

/**
 * Dropbox OAuth token response from API
 * @typedef {Object} DropboxTokenResponse
 * @property {string} access_token - Access token
 * @property {string} [refresh_token] - Refresh token (optional)
 * @property {number} [expires_in] - Token expiration in seconds
 * @property {string} [token_type] - Token type
 * @property {string} [scope] - Granted scopes
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
    throw new Error('Centralized OAuth token exchange is deprecated. Dropbox service now handles OAuth directly through Dropbox\'s OAuth endpoints. Use the direct OAuth flow instead.');
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
    // delegate to the direct Dropbox OAuth refresh function
    console.log(`🔄 Using direct Dropbox OAuth token refresh (decentralized auth)`);
    return refreshBearerTokenDirect(refreshData);
}

/**
 * Token validation result
 * @typedef {Object} TokenValidationResult
 * @property {boolean} valid - Whether token is valid
 * @property {string} accountId - Dropbox account ID
 * @property {string} scope - Token scope
 * @property {number} expiresIn - Seconds until expiration
 * @property {string} email - User email
 * @property {string} displayName - User display name
 */

/**
 * Validate OAuth Bearer token
 * @param {string} bearerToken - Bearer token to validate
 * @returns {Promise<TokenValidationResult>} Token validation result
 */
export async function validateBearerToken(bearerToken) {
    if (!bearerToken) {
        throw new Error('Bearer token is required for validation');
    }
    console.log(`🔍 Validating Bearer token`);
    try {
        // Use Dropbox's account info endpoint to validate the token
        const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Token validation failed: ${response.status} ${response.statusText}`);
        }
        
        const accountInfo = /** @type {DropboxAccountInfo} */ (await response.json());
        
        console.log(`✅ Bearer token validated successfully`);
        return {
            valid: true,
            accountId: accountInfo.account_id,
            scope: 'account_info.read files.metadata.write files.content.write sharing.write', // Default Dropbox scopes
            expiresIn: 14400, // Dropbox tokens typically expire in 4 hours
            email: accountInfo.email,
            displayName: accountInfo.name.display_name
        };
    }
    catch (error) {
        console.error('Bearer token validation failed:', error);
        throw new Error(`Token validation failed: ${/** @type {Error} */ (error).message}`);
    }
}

/**
 * Token expiration data
 * @typedef {Object} TokenData
 * @property {number} expiresAt - Token expiration timestamp
 */

/**
 * Check if Bearer token is expired or will expire soon
 * @param {TokenData} tokenData - Token data with expiration info
 * @param {number} [bufferMinutes=5] - Minutes before expiry to consider token as expired
 * @returns {boolean} True if token is expired or will expire soon
 */
export function isTokenExpired(tokenData, bufferMinutes = 5) {
    if (!tokenData || !tokenData.expiresAt) {
        return true;
    }
    const now = Date.now();
    const bufferMs = bufferMinutes * 60 * 1000;
    const expiresSoon = tokenData.expiresAt - now < bufferMs;
    if (expiresSoon) {
        const minutesLeft = Math.floor((tokenData.expiresAt - now) / 60000);
        console.log(`⏰ Token expires in ${minutesLeft} minutes (considering expired due to ${bufferMinutes}min buffer)`);
    }
    return expiresSoon;
}

/**
 * User information from token
 * @typedef {Object} UserInfo
 * @property {string} accountId - Dropbox account ID
 * @property {string} email - User email
 * @property {string} displayName - Display name
 * @property {string} givenName - Given name
 * @property {string} surname - Surname
 * @property {string} locale - User locale
 * @property {boolean} emailVerified - Email verification status
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
    console.log(`👤 Fetching user info from Bearer token`);
    try {
        const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
        }
        
        const userInfo = /** @type {DropboxAccountInfo} */ (await response.json());
        console.log(`✅ Retrieved user info for: ${userInfo.email}`);
        return {
            accountId: userInfo.account_id,
            email: userInfo.email,
            displayName: userInfo.name.display_name,
            givenName: userInfo.name.given_name,
            surname: userInfo.name.surname,
            locale: userInfo.locale,
            emailVerified: userInfo.email_verified
        };
    }
    catch (error) {
        console.error('Failed to get user info:', error);
        throw new Error(`User info retrieval failed: ${/** @type {Error} */ (error).message}`);
    }
}

/**
 * Direct Dropbox OAuth token refresh (bypass OAuth service)
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
    
    console.log(`🔄 Direct Dropbox OAuth token refresh (bypassing OAuth service)`);
    try {
        const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: clientId,
                client_secret: clientSecret
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Dropbox OAuth refresh failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const tokens = /** @type {DropboxTokenResponse} */ (await response.json());
        
        if (!tokens.access_token) {
            throw new Error('No access token received from Dropbox OAuth refresh');
        }

        console.log(`✅ Direct Dropbox OAuth token refresh successful`);
        
        return {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || refreshToken, // Dropbox may not always return new refresh token
            expires_in: tokens.expires_in || 14400, // Default to 4 hours if not provided
            token_type: tokens.token_type || 'Bearer',
            scope: tokens.scope || 'account_info.read files.metadata.write files.content.write sharing.write'
        };
    } catch (error) {
        console.error('Direct Dropbox OAuth token refresh failed:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Dropbox OAuth token refresh failed: ${errorMessage}`);
    }
}