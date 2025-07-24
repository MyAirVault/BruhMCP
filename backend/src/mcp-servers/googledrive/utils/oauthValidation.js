/**
 * OAuth validation and token management utilities for Google Drive
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
    throw new Error('Centralized OAuth token exchange is deprecated. Google Drive service now handles OAuth directly through Google\'s OAuth endpoints. Use the direct OAuth flow instead.');
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
    // delegate to the direct Google OAuth refresh function
    console.log(`🔄 Using direct Google OAuth token refresh (decentralized auth)`);
    return refreshBearerTokenDirect(refreshData);
}

/**
 * Token validation result
 * @typedef {Object} TokenValidationResult
 * @property {boolean} valid - Whether token is valid
 * @property {string} audience - Token audience
 * @property {string} scope - Token scope
 * @property {number} expiresIn - Seconds until expiration
 * @property {string} userId - User ID
 * @property {string} email - User email
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
        // Use Google's tokeninfo endpoint to validate the token
        const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${bearerToken}`);
        if (!response.ok) {
            throw new Error(`Token validation failed: ${response.status} ${response.statusText}`);
        }
        const tokenInfo = /** @type {{scope?: string, audience: string, expires_in: string, user_id: string, email: string}} */ (await response.json());
        // Check if token has required scopes for Google Drive
        const requiredScopes = [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/userinfo.email'
        ];
        const tokenScopes = tokenInfo.scope ? tokenInfo.scope.split(' ') : [];
        const hasRequiredScopes = requiredScopes.some(scope => tokenScopes.includes(scope));
        if (!hasRequiredScopes) {
            throw new Error(`Token missing required Google Drive scopes. Required: ${requiredScopes.join(', ')}`);
        }
        console.log(`✅ Bearer token validated successfully`);
        return {
            valid: true,
            audience: tokenInfo.audience,
            scope: tokenInfo.scope || '',
            expiresIn: parseInt(tokenInfo.expires_in),
            userId: tokenInfo.user_id,
            email: tokenInfo.email
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
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} name - Full name
 * @property {string} givenName - Given name
 * @property {string} familyName - Family name
 * @property {string} picture - Profile picture URL
 * @property {string} locale - User locale
 * @property {boolean} verifiedEmail - Email verification status
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
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${bearerToken}`
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
        }
        const userInfo = /** @type {{id: string, email: string, name: string, given_name: string, family_name: string, picture: string, locale: string, verified_email: boolean}} */ (await response.json());
        console.log(`✅ Retrieved user info for: ${userInfo.email}`);
        return {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            givenName: userInfo.given_name,
            familyName: userInfo.family_name,
            picture: userInfo.picture,
            locale: userInfo.locale,
            verifiedEmail: userInfo.verified_email
        };
    }
    catch (error) {
        console.error('Failed to get user info:', error);
        throw new Error(`User info retrieval failed: ${/** @type {Error} */ (error).message}`);
    }
}

/**
 * Direct Google OAuth token refresh (bypass OAuth service)
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
    console.log(`🔄 Direct Google OAuth token refresh (bypassing OAuth service)`);
    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
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
            const errorData = await response.text();
            let errorMessage = `Direct token refresh failed: ${response.status} ${response.statusText}`;
            let errorCode = null;
            try {
                const errorJson = JSON.parse(errorData);
                if (errorJson.error_description) {
                    errorMessage = `Direct token refresh failed: ${errorJson.error_description}`;
                    errorCode = errorJson.error;
                }
                else if (errorJson.error) {
                    errorMessage = `Direct token refresh failed: ${errorJson.error}`;
                    errorCode = errorJson.error;
                }
            }
            catch (parseError) {
                // Use the default error message
            }
            const error = /** @type {Error & {code?: string, status?: number}} */ (new Error(errorMessage));
            error.code = errorCode;
            error.status = response.status;
            throw error;
        }
        const tokens = /** @type {{access_token: string, refresh_token?: string, expires_in?: number, token_type?: string, scope?: string}} */ (await response.json());
        // Validate response contains required fields
        if (!tokens.access_token) {
            throw new Error('Invalid token response: missing access_token');
        }
        console.log(`✅ Direct Google OAuth token refresh successful (expires in ${tokens.expires_in} seconds)`);
        return {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || refreshToken, // Google may not return new refresh token
            expires_in: tokens.expires_in || 3600,
            token_type: tokens.token_type || 'Bearer',
            scope: tokens.scope || ''
        };
    }
    catch (error) {
        const err = /** @type {Error & {code?: string}} */ (error);
        console.error('Direct Google OAuth token refresh failed:', error);
        // Enhanced error handling for common OAuth errors
        if (err.code === 'invalid_grant') {
            throw new Error('invalid_grant: Invalid refresh token - user may need to re-authorize');
        }
        else if (err.code === 'invalid_client') {
            throw new Error('invalid_client: Invalid OAuth client credentials');
        }
        else if (err.code === 'invalid_request') {
            throw new Error('invalid_request: Invalid token refresh request format');
        }
        throw error;
    }
}

/**
 * Revoke OAuth token
 * @param {string} token - Token to revoke (access or refresh token)
 * @returns {Promise<boolean>} True if revocation was successful
 */
export async function revokeToken(token) {
    if (!token) {
        throw new Error('Token is required for revocation');
    }
    console.log(`🔒 Revoking OAuth token`);
    try {
        const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error(`Token revocation failed: ${response.status} ${response.statusText}`);
        }
        console.log(`✅ Token revoked successfully`);
        return true;
    }
    catch (error) {
        console.error('Token revocation failed:', error);
        throw new Error(`Token revocation failed: ${/** @type {Error} */ (error).message}`);
    }
}