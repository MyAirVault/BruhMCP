/**
 * OAuth validation and token management utilities for GitHub
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

  console.log(`🔐 Calling OAuth service for GitHub token exchange`);
  
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
        provider: 'github',
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
    
    console.log(`✅ GitHub OAuth tokens obtained successfully from OAuth service`);
    
    return {
      access_token: tokenData.tokens.access_token,
      refresh_token: tokenData.tokens.refresh_token,
      expires_in: tokenData.tokens.expires_in,
      token_type: tokenData.tokens.token_type,
      scope: tokenData.tokens.scope
    };

  } catch (error) {
    console.error('OAuth service GitHub token exchange failed:', error);
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

  console.log(`🔄 Refreshing GitHub Bearer token using refresh token`);

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
        provider: 'github',
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

    console.log(`✅ GitHub Bearer token refreshed successfully via OAuth service`);

    return {
      access_token: tokenData.tokens.access_token,
      refresh_token: tokenData.tokens.refresh_token || refreshToken,
      expires_in: tokenData.tokens.expires_in || 3600,
      token_type: tokenData.tokens.token_type || 'Bearer',
      scope: tokenData.tokens.scope
    };

  } catch (error) {
    console.error('GitHub Bearer token refresh failed:', error);
    
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

  console.log(`🔍 Validating GitHub Bearer token`);

  try {
    // Use GitHub's API to validate the token
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-MCP-Server'
      }
    });

    if (!response.ok) {
      throw new Error(`Token validation failed: ${response.status} ${response.statusText}`);
    }

    const userInfo = await response.json();

    console.log(`✅ GitHub Bearer token validated successfully`);

    return {
      valid: true,
      userId: userInfo.id,
      username: userInfo.login,
      email: userInfo.email,
      name: userInfo.name,
      avatarUrl: userInfo.avatar_url,
      publicRepos: userInfo.public_repos,
      privateRepos: userInfo.total_private_repos,
      followers: userInfo.followers,
      following: userInfo.following
    };

  } catch (error) {
    console.error('GitHub Bearer token validation failed:', error);
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
    console.log(`⏰ GitHub token expires in ${minutesLeft} minutes (considering expired due to ${bufferMinutes}min buffer)`);
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

  console.log(`👤 Fetching GitHub user info from Bearer token`);

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-MCP-Server'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
    }

    const userInfo = await response.json();

    console.log(`✅ Retrieved GitHub user info for: ${userInfo.login}`);

    return {
      id: userInfo.id,
      username: userInfo.login,
      email: userInfo.email,
      name: userInfo.name,
      avatarUrl: userInfo.avatar_url,
      bio: userInfo.bio,
      location: userInfo.location,
      blog: userInfo.blog,
      company: userInfo.company,
      publicRepos: userInfo.public_repos,
      privateRepos: userInfo.total_private_repos,
      followers: userInfo.followers,
      following: userInfo.following,
      createdAt: userInfo.created_at,
      updatedAt: userInfo.updated_at
    };

  } catch (error) {
    console.error('Failed to get GitHub user info:', error);
    throw new Error(`User info retrieval failed: ${error.message}`);
  }
}

/**
 * Direct GitHub OAuth token refresh (bypass OAuth service)
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

  console.log(`🔄 Direct GitHub OAuth token refresh (bypassing OAuth service)`);

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'GitHub-MCP-Server'
      },
      body: JSON.stringify({
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

    console.log(`✅ Direct GitHub OAuth token refresh successful (expires in ${tokens.expires_in} seconds)`);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || refreshToken,
      expires_in: tokens.expires_in || 3600,
      token_type: tokens.token_type || 'Bearer',
      scope: tokens.scope
    };

  } catch (error) {
    console.error('Direct GitHub OAuth token refresh failed:', error);
    
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
 * Revoke GitHub OAuth token
 * @param {string} token - Token to revoke (access token)
 * @param {string} clientId - OAuth Client ID
 * @param {string} clientSecret - OAuth Client Secret
 * @returns {boolean} True if revocation was successful
 */
export async function revokeToken(token, clientId, clientSecret) {
  if (!token) {
    throw new Error('Token is required for revocation');
  }

  if (!clientId || !clientSecret) {
    throw new Error('Client ID and Client Secret are required for token revocation');
  }

  console.log(`🔒 Revoking GitHub OAuth token`);

  try {
    const response = await fetch(`https://api.github.com/applications/${clientId}/token`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-MCP-Server'
      },
      body: JSON.stringify({
        access_token: token
      })
    });

    if (!response.ok) {
      throw new Error(`Token revocation failed: ${response.status} ${response.statusText}`);
    }

    console.log(`✅ GitHub token revoked successfully`);
    return true;

  } catch (error) {
    console.error('GitHub token revocation failed:', error);
    throw new Error(`Token revocation failed: ${error.message}`);
  }
}