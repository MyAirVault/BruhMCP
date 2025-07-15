/**
 * OAuth validation and token management utilities for Gmail
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
        provider: 'google',
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
        provider: 'google',
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
      expires_in: tokenData.tokens.expires_in || 3600,
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
    // Use Google's tokeninfo endpoint to validate the token
    const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${bearerToken}`);

    if (!response.ok) {
      throw new Error(`Token validation failed: ${response.status} ${response.statusText}`);
    }

    const tokenInfo = await response.json();

    // Check if token has required scopes for Gmail
    const requiredScopes = [
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    const tokenScopes = tokenInfo.scope ? tokenInfo.scope.split(' ') : [];
    const hasRequiredScopes = requiredScopes.some(scope => tokenScopes.includes(scope));

    if (!hasRequiredScopes) {
      throw new Error(`Token missing required Gmail scopes. Required: ${requiredScopes.join(', ')}`);
    }

    console.log(`✅ Bearer token validated successfully`);

    return {
      valid: true,
      audience: tokenInfo.audience,
      scope: tokenInfo.scope,
      expiresIn: parseInt(tokenInfo.expires_in),
      userId: tokenInfo.user_id,
      email: tokenInfo.email
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
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${bearerToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
    }

    const userInfo = await response.json();

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

  } catch (error) {
    console.error('Failed to get user info:', error);
    throw new Error(`User info retrieval failed: ${error.message}`);
  }
}

/**
 * Revoke OAuth token
 * @param {string} token - Token to revoke (access or refresh token)
 * @returns {boolean} True if revocation was successful
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

  } catch (error) {
    console.error('Token revocation failed:', error);
    throw new Error(`Token revocation failed: ${error.message}`);
  }
}