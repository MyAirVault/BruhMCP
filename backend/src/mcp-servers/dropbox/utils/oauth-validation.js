/**
 * OAuth validation and token management utilities for Dropbox
 * Handles OAuth 2.0 token exchange and refresh operations
 */

import oauthServiceManager from '../../../services/oauth-service-manager.js';

/**
 * Exchange OAuth credentials for Bearer token via OAuth service
 * @param {Object} credentials - OAuth credentials
 * @param {string} credentials.clientId - OAuth Client ID
 * @param {string} credentials.clientSecret - OAuth Client Secret
 * @param {Array} credentials.scopes - Required OAuth scopes
 * @returns {Object} Token response with access_token and refresh_token
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

  console.log(`🔐 Calling OAuth service for token exchange`);
  
  try {
    // Ensure OAuth service is running
    const serviceStarted = await oauthServiceManager.ensureServiceRunning();
    if (!serviceStarted) {
      throw new Error('Failed to start OAuth service');
    }

    const oauthServiceUrl = oauthServiceManager.getServiceUrl();
    
    const response = await fetch(`${oauthServiceUrl}/exchange-credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: 'dropbox',
        client_id: clientId,
        client_secret: clientSecret,
        scopes
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OAuth service error: ${errorData.error || 'Token exchange failed'}`);
    }

    const tokenData = await response.json();
    
    console.log(`✅ OAuth tokens obtained successfully from OAuth service`);
    
    return {
      access_token: tokenData.tokens.access_token,
      refresh_token: tokenData.tokens.refresh_token,
      expires_in: tokenData.tokens.expires_in,
      token_type: tokenData.tokens.token_type,
      scope: tokenData.tokens.scope
    };

  } catch (error) {
    console.error('OAuth service token exchange failed:', error);
    throw new Error(`OAuth token exchange failed: ${error.message}`);
  }
}

/**
 * Refresh an expired Bearer token using refresh token
 * @param {Object} refreshData - Refresh token data
 * @param {string} refreshData.refreshToken - OAuth refresh token
 * @param {string} refreshData.clientId - OAuth Client ID
 * @param {string} refreshData.clientSecret - OAuth Client Secret
 * @returns {Object} New token response
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

  console.log(`🔄 Refreshing Bearer token using refresh token`);

  try {
    // Ensure OAuth service is running
    const serviceStarted = await oauthServiceManager.ensureServiceRunning();
    if (!serviceStarted) {
      throw new Error('Failed to start OAuth service');
    }

    const oauthServiceUrl = oauthServiceManager.getServiceUrl();
    
    const response = await fetch(`${oauthServiceUrl}/exchange-refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: 'dropbox',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OAuth service error: ${errorData.error || 'Token refresh failed'}`);
    }

    const tokenData = await response.json();
    
    // Validate response contains required fields
    if (!tokenData.tokens || !tokenData.tokens.access_token) {
      throw new Error('Invalid token response: missing access_token');
    }

    console.log(`✅ Bearer token refreshed successfully via OAuth service`);

    return {
      access_token: tokenData.tokens.access_token,
      refresh_token: tokenData.tokens.refresh_token || refreshToken,
      expires_in: tokenData.tokens.expires_in || 14400, // Dropbox default is 4 hours
      token_type: tokenData.tokens.token_type || 'Bearer',
      scope: tokenData.tokens.scope
    };

  } catch (error) {
    console.error('Bearer token refresh failed:', error);
    
    // Enhanced error handling for common OAuth errors
    if (error.message.includes('invalid_grant')) {
      throw new Error('Invalid refresh token - user may need to re-authorize');
    } else if (error.message.includes('invalid_client')) {
      throw new Error('Invalid OAuth client credentials');
    } else if (error.message.includes('invalid_request')) {
      throw new Error('Invalid token refresh request format');
    }
    
    throw error;
  }
}

/**
 * Validate OAuth Bearer token
 * @param {string} bearerToken - Bearer token to validate
 * @returns {Object} Token validation result
 */
export async function validateBearerToken(bearerToken) {
  if (!bearerToken) {
    throw new Error('Bearer token is required for validation');
  }

  console.log(`🔍 Validating Bearer token`);

  try {
    // Use Dropbox's check_user endpoint to validate the token
    const response = await fetch('https://api.dropboxapi.com/2/check/user', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: 'test' })
    });

    if (!response.ok) {
      throw new Error(`Token validation failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    console.log(`✅ Bearer token validated successfully`);

    return {
      valid: true,
      result: result
    };

  } catch (error) {
    console.error('Bearer token validation failed:', error);
    throw new Error(`Token validation failed: ${error.message}`);
  }
}

/**
 * Check if Bearer token is expired or will expire soon
 * @param {Object} tokenData - Token data with expiration info
 * @param {number} tokenData.expiresAt - Token expiration timestamp
 * @param {number} bufferMinutes - Minutes before expiry to consider token as expired
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
 * Extract user information from Bearer token
 * @param {string} bearerToken - Bearer token
 * @returns {Object} User information
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

    const userInfo = await response.json();

    console.log(`✅ Retrieved user info for: ${userInfo.email}`);

    return {
      id: userInfo.account_id,
      email: userInfo.email,
      name: userInfo.name.display_name,
      givenName: userInfo.name.given_name,
      familyName: userInfo.name.surname,
      emailVerified: userInfo.email_verified,
      disabled: userInfo.disabled,
      country: userInfo.country,
      locale: userInfo.locale,
      referralLink: userInfo.referral_link,
      isPaired: userInfo.is_paired,
      accountType: userInfo.account_type['.tag'],
      profilePhotoUrl: userInfo.profile_photo_url
    };

  } catch (error) {
    console.error('Failed to get user info:', error);
    throw new Error(`User info retrieval failed: ${error.message}`);
  }
}

/**
 * Direct Dropbox OAuth token refresh (bypass OAuth service)
 * @param {Object} refreshData - Refresh token data
 * @param {string} refreshData.refreshToken - OAuth refresh token
 * @param {string} refreshData.clientId - OAuth Client ID
 * @param {string} refreshData.clientSecret - OAuth Client Secret
 * @returns {Object} New token response
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
      const errorData = await response.text();
      let errorMessage = `Direct token refresh failed: ${response.status} ${response.statusText}`;
      let errorCode = null;
      
      try {
        const errorJson = JSON.parse(errorData);
        if (errorJson.error_description) {
          errorMessage = `Direct token refresh failed: ${errorJson.error_description}`;
          errorCode = errorJson.error;
        } else if (errorJson.error) {
          errorMessage = `Direct token refresh failed: ${errorJson.error}`;
          errorCode = errorJson.error;
        }
      } catch (parseError) {
        // Use the default error message
      }
      
      const error = new Error(errorMessage);
      error.code = errorCode;
      error.status = response.status;
      throw error;
    }

    const tokens = await response.json();
    
    // Validate response contains required fields
    if (!tokens.access_token) {
      throw new Error('Invalid token response: missing access_token');
    }

    console.log(`✅ Direct Dropbox OAuth token refresh successful (expires in ${tokens.expires_in} seconds)`);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || refreshToken,
      expires_in: tokens.expires_in || 14400, // Dropbox default is 4 hours
      token_type: tokens.token_type || 'Bearer',
      scope: tokens.scope
    };

  } catch (error) {
    console.error('Direct Dropbox OAuth token refresh failed:', error);
    
    // Enhanced error handling for common OAuth errors
    if (error.code === 'invalid_grant') {
      throw new Error('invalid_grant: Invalid refresh token - user may need to re-authorize');
    } else if (error.code === 'invalid_client') {
      throw new Error('invalid_client: Invalid OAuth client credentials');
    } else if (error.code === 'invalid_request') {
      throw new Error('invalid_request: Invalid token refresh request format');
    }
    
    throw error;
  }
}

/**
 * Revoke OAuth token
 * @param {string} token - Token to revoke (access token)
 * @returns {boolean} True if revocation was successful
 */
export async function revokeToken(token) {
  if (!token) {
    throw new Error('Token is required for revocation');
  }

  console.log(`🔒 Revoking OAuth token`);

  try {
    const response = await fetch('https://api.dropboxapi.com/2/auth/token/revoke', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Token revocation failed: ${response.status} ${response.statusText}`);
    }

    console.log(`✅ Token revoked successfully`);
    return true;

  } catch (error) {
    console.error('Token revocation failed:', error);
    throw new Error(`Token revocation failed: ${error.message}`);
  }
}