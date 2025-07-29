/**
 * OAuth validation and token management utilities for Slack
 * Handles OAuth 2.0 token exchange and refresh operations for Slack API
 */

/**
 * OAuth credentials for token exchange
 * @typedef {Object} OAuthCredentials
 * @property {string} clientId - OAuth Client ID
 * @property {string} clientSecret - OAuth Client Secret
 * @property {Array<string>} scopes - Required OAuth scopes
 */

/**
 * OAuth token response from Slack
 * @typedef {Object} TokenResponse
 * @property {string} access_token - Access token
 * @property {string} refresh_token - Refresh token
 * @property {number} expires_in - Token expiration in seconds
 * @property {string} token_type - Token type (usually 'Bearer')
 * @property {string} scope - Granted scopes
 * @property {string} team_id - Slack team ID
 */

/**
 * Slack auth.test API response
 * @typedef {Object} SlackAuthTestResponse
 * @property {boolean} ok - Whether the request was successful
 * @property {string} url - Team URL
 * @property {string} team - Team name
 * @property {string} user - User name
 * @property {string} team_id - Team ID
 * @property {string} user_id - User ID
 * @property {string} [bot_id] - Bot ID (if applicable)
 * @property {boolean} [is_admin] - Whether user is admin
 * @property {string} [error] - Error message if ok is false
 */

/**
 * Slack OAuth token response from oauth.v2.access
 * @typedef {Object} SlackOAuthTokenResponse
 * @property {boolean} ok - Whether the request was successful
 * @property {string} access_token - Access token
 * @property {string} [refresh_token] - Refresh token
 * @property {number} [expires_in] - Token expiration in seconds
 * @property {string} token_type - Token type (usually 'Bearer')
 * @property {string} scope - Granted scopes
 * @property {{id: string}} team - Team object with ID
 * @property {string} [error] - Error message if ok is false
 */

/**
 * Slack auth.revoke API response
 * @typedef {Object} SlackRevokeResponse
 * @property {boolean} ok - Whether the request was successful
 * @property {boolean} [revoked] - Whether token was revoked
 * @property {string} [error] - Error message if ok is false
 */

/**
 * Extended Error object with additional properties
 * @typedef {Error} ExtendedError
 * @property {string} [code] - Error code
 * @property {number} [status] - HTTP status code
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
    throw new Error('Centralized OAuth token exchange is deprecated. Slack service now handles OAuth directly through Slack\'s OAuth endpoints. Use the direct OAuth flow instead.');
}

/**
 * Refresh token data for Slack
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
    // delegate to the direct Slack OAuth refresh function
    console.log(`🔄 Using direct Slack OAuth token refresh (decentralized auth)`);
    return refreshBearerTokenDirect(refreshData);
}

/**
 * Token validation result for Slack
 * @typedef {Object} TokenValidationResult
 * @property {boolean} valid - Whether token is valid
 * @property {string} url - Team URL
 * @property {string} team - Team name
 * @property {string} user - User name
 * @property {string} team_id - Team ID
 * @property {string} user_id - User ID
 * @property {string} bot_id - Bot ID (if applicable)
 */

/**
 * Validate OAuth Bearer token with Slack
 * @param {string} bearerToken - Bearer token to validate
 * @returns {Promise<TokenValidationResult>} Token validation result
 */
async function validateBearerToken(bearerToken) {
    if (!bearerToken) {
        throw new Error('Bearer token is required for validation');
    }
    
    console.log(`🔍 Validating Slack Bearer token`);
    
    try {
        // Use Slack's auth.test endpoint to validate the token
        const response = await fetch('https://slack.com/api/auth.test', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Token validation failed: ${response.status} ${response.statusText}`);
        }
        
        /** @type {SlackAuthTestResponse} */
        const authResult = /** @type {SlackAuthTestResponse} */ (await response.json());
        
        if (!authResult.ok) {
            throw new Error(`Slack auth test failed: ${authResult.error}`);
        }
        
        console.log(`✅ Slack Bearer token validated successfully for team: ${authResult.team}`);
        
        return {
            valid: true,
            url: authResult.url,
            team: authResult.team,
            user: authResult.user,
            team_id: authResult.team_id,
            user_id: authResult.user_id,
            bot_id: authResult.bot_id || ''
        };
    } catch (error) {
        console.error('Slack Bearer token validation failed:', error);
        throw new Error(`Token validation failed: ${/** @type {Error} */(error).message}`);
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
function isTokenExpired(tokenData, bufferMinutes = 5) {
    if (!tokenData || !tokenData.expiresAt) {
        return true;
    }
    
    const now = Date.now();
    const bufferMs = bufferMinutes * 60 * 1000;
    const expiresSoon = tokenData.expiresAt - now < bufferMs;
    
    if (expiresSoon) {
        const minutesLeft = Math.floor((tokenData.expiresAt - now) / 60000);
        console.log(`⏰ Slack token expires in ${minutesLeft} minutes (considering expired due to ${bufferMinutes}min buffer)`);
    }
    
    return expiresSoon;
}

/**
 * User information from Slack token
 * @typedef {Object} UserInfo
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} team_id - Team ID
 * @property {string} team - Team name
 * @property {string} url - Team URL
 * @property {boolean} is_admin - Whether user is admin
 * @property {boolean} is_bot - Whether this is a bot token
 */

/**
 * Extract user information from Bearer token
 * @param {string} bearerToken - Bearer token
 * @returns {Promise<UserInfo>} User information
 */
async function getUserInfoFromToken(bearerToken) {
    if (!bearerToken) {
        throw new Error('Bearer token is required');
    }
    
    console.log(`👤 Fetching Slack user info from Bearer token`);
    
    try {
        const response = await fetch('https://slack.com/api/auth.test', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
        }
        
        /** @type {SlackAuthTestResponse} */
        const authResult = /** @type {SlackAuthTestResponse} */ (await response.json());
        
        if (!authResult.ok) {
            throw new Error(`Slack auth test failed: ${authResult.error}`);
        }
        
        console.log(`✅ Retrieved Slack user info for: ${authResult.user} in team: ${authResult.team}`);
        
        return {
            id: authResult.user_id,
            name: authResult.user,
            team_id: authResult.team_id,
            team: authResult.team,
            url: authResult.url,
            is_admin: authResult.is_admin || false,
            is_bot: !!authResult.bot_id
        };
    } catch (error) {
        console.error('Failed to get Slack user info:', error);
        throw new Error(`User info retrieval failed: ${/** @type {Error} */(error).message}`);
    }
}

/**
 * Direct Slack OAuth token refresh (bypass OAuth service)
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
    
    console.log(`🔄 Direct Slack OAuth token refresh (bypassing OAuth service)`);
    
    try {
        const response = await fetch('https://slack.com/api/oauth.v2.access', {
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
                if (errorJson.error) {
                    errorMessage = `Direct token refresh failed: ${errorJson.error}`;
                    errorCode = errorJson.error;
                }
            } catch (parseError) {
                // Use the default error message
            }
            
            const error = new Error(errorMessage);
            /** @type {ExtendedError} */
            const extendedError = Object.assign(error, {
                code: errorCode || undefined,
                status: response.status
            });
            throw extendedError;
        }
        
        /** @type {SlackOAuthTokenResponse} */
        const tokenResponse = /** @type {SlackOAuthTokenResponse} */ (await response.json());
        
        if (!tokenResponse.ok) {
            throw new Error(`Slack OAuth refresh failed: ${tokenResponse.error}`);
        }
        
        // Validate response contains required fields
        if (!tokenResponse.access_token) {
            throw new Error('Invalid token response: missing access_token');
        }
        
        console.log(`✅ Direct Slack OAuth token refresh successful (expires in ${tokenResponse.expires_in || 43200} seconds)`);
        
        return {
            access_token: tokenResponse.access_token,
            refresh_token: tokenResponse.refresh_token || refreshToken, // Slack may not return new refresh token
            expires_in: tokenResponse.expires_in || 43200, // Default 12 hours for Slack
            token_type: tokenResponse.token_type || 'Bearer',
            scope: tokenResponse.scope || '',
            team_id: tokenResponse.team.id
        };
    } catch (error) {
        console.error('Direct Slack OAuth token refresh failed:', error);
        
        // Enhanced error handling for common OAuth errors
        let errorCode;
        if (error && typeof error === 'object' && 'code' in error) {
            errorCode = /** @type {string | undefined} */ (/** @type {Record<string, unknown>} */(error).code);
        }
        
        if (errorCode === 'invalid_grant') {
            throw new Error('invalid_grant: Invalid refresh token - user may need to re-authorize');
        } else if (errorCode === 'invalid_client') {
            throw new Error('invalid_client: Invalid OAuth client credentials');
        } else if (errorCode === 'invalid_request') {
            throw new Error('invalid_request: Invalid token refresh request format');
        }
        
        throw error;
    }
}

/**
 * Revoke OAuth token with Slack
 * @param {string} token - Token to revoke (access token)
 * @returns {Promise<boolean>} True if revocation was successful
 */
async function revokeToken(token) {
    if (!token) {
        throw new Error('Token is required for revocation');
    }
    
    console.log(`🔒 Revoking Slack OAuth token`);
    
    try {
        const response = await fetch('https://slack.com/api/auth.revoke', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Token revocation failed: ${response.status} ${response.statusText}`);
        }
        
        /** @type {SlackRevokeResponse} */
        const result = /** @type {SlackRevokeResponse} */ (await response.json());
        
        if (!result.ok) {
            throw new Error(`Slack token revocation failed: ${result.error}`);
        }
        
        console.log(`✅ Slack token revoked successfully`);
        return true;
    } catch (error) {
        console.error('Slack token revocation failed:', error);
        throw new Error(`Token revocation failed: ${/** @type {Error} */(error).message}`);
    }
}
module.exports = {
  exchangeOAuthForBearer,
  refreshBearerToken,
  validateBearerToken,
  getUserInfoFromToken,
  refreshBearerTokenDirect,
  revokeToken
};