/**
 * OAuth validation and token management utilities for Slack
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

  console.log(`🔐 Calling OAuth service for Slack token exchange`);
  
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
        provider: 'slack',
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
    
    console.log(`✅ Slack OAuth tokens obtained successfully from OAuth service`);
    
    return {
      access_token: tokenData.tokens.access_token,
      refresh_token: tokenData.tokens.refresh_token,
      expires_in: tokenData.tokens.expires_in,
      token_type: tokenData.tokens.token_type,
      scope: tokenData.tokens.scope,
      team_id: tokenData.tokens.team_id,
      team_name: tokenData.tokens.team_name,
      user_id: tokenData.tokens.user_id
    };

  } catch (error) {
    console.error('OAuth service Slack token exchange failed:', error);
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

  console.log(`🔄 Refreshing Slack Bearer token using refresh token`);

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
        provider: 'slack',
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

    console.log(`✅ Slack Bearer token refreshed successfully via OAuth service`);

    return {
      access_token: tokenData.tokens.access_token,
      refresh_token: tokenData.tokens.refresh_token || refreshToken,
      expires_in: tokenData.tokens.expires_in || 43200,
      token_type: tokenData.tokens.token_type || 'Bearer',
      scope: tokenData.tokens.scope,
      team_id: tokenData.tokens.team_id,
      team_name: tokenData.tokens.team_name,
      user_id: tokenData.tokens.user_id
    };

  } catch (error) {
    console.error('Slack Bearer token refresh failed:', error);
    
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

  console.log(`🔍 Validating Slack Bearer token`);

  try {
    // Use Slack's auth.test endpoint to validate the token
    const response = await fetch('https://slack.com/api/auth.test', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Token validation failed: ${response.status} ${response.statusText}`);
    }

    const authData = await response.json();

    if (!authData.ok) {
      throw new Error(`Token validation failed: ${authData.error || 'Unknown error'}`);
    }

    console.log(`✅ Slack Bearer token validated successfully for team: ${authData.team}`);

    return {
      valid: true,
      team_id: authData.team_id,
      team: authData.team,
      user_id: authData.user_id,
      user: authData.user,
      bot_id: authData.bot_id,
      url: authData.url
    };

  } catch (error) {
    console.error('Slack Bearer token validation failed:', error);
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
export function isTokenExpired(tokenData, bufferMinutes = 10) {
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
 * Extract user information from Bearer token
 * @param {string} bearerToken - Bearer token
 * @returns {Object} User information
 */
export async function getUserInfoFromToken(bearerToken) {
  if (!bearerToken) {
    throw new Error('Bearer token is required');
  }

  console.log(`👤 Fetching user info from Slack Bearer token`);

  try {
    // First get basic auth info
    const authResponse = await fetch('https://slack.com/api/auth.test', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!authResponse.ok) {
      throw new Error(`Failed to get auth info: ${authResponse.status} ${authResponse.statusText}`);
    }

    const authData = await authResponse.json();
    
    if (!authData.ok) {
      throw new Error(`Failed to get auth info: ${authData.error}`);
    }

    // Get detailed user info
    const userResponse = await fetch(`https://slack.com/api/users.info?user=${authData.user_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`
      }
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to get user info: ${userResponse.status} ${userResponse.statusText}`);
    }

    const userData = await userResponse.json();

    if (!userData.ok) {
      throw new Error(`Failed to get user info: ${userData.error}`);
    }

    console.log(`✅ Retrieved Slack user info for: ${userData.user.name}`);

    return {
      id: authData.user_id,
      name: userData.user.name,
      real_name: userData.user.real_name,
      email: userData.user.profile.email,
      display_name: userData.user.profile.display_name,
      image: userData.user.profile.image_192,
      team_id: authData.team_id,
      team: authData.team,
      is_admin: userData.user.is_admin,
      is_owner: userData.user.is_owner,
      is_primary_owner: userData.user.is_primary_owner,
      timezone: userData.user.tz,
      timezone_label: userData.user.tz_label
    };

  } catch (error) {
    console.error('Failed to get Slack user info:', error);
    throw new Error(`User info retrieval failed: ${error.message}`);
  }
}

/**
 * Direct Slack OAuth token refresh (bypass OAuth service)
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
      error.code = errorCode;
      error.status = response.status;
      throw error;
    }

    const tokens = await response.json();
    
    if (!tokens.ok) {
      throw new Error(`Direct token refresh failed: ${tokens.error}`);
    }

    // Validate response contains required fields
    if (!tokens.access_token) {
      throw new Error('Invalid token response: missing access_token');
    }

    console.log(`✅ Direct Slack OAuth token refresh successful`);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || refreshToken,
      expires_in: tokens.expires_in || 43200,
      token_type: tokens.token_type || 'Bearer',
      scope: tokens.scope,
      team_id: tokens.team.id,
      team_name: tokens.team.name,
      user_id: tokens.user_id
    };

  } catch (error) {
    console.error('Direct Slack OAuth token refresh failed:', error);
    
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
 * Revoke Slack OAuth token
 * @param {string} token - Token to revoke (access token)
 * @returns {boolean} True if revocation was successful
 */
export async function revokeToken(token) {
  if (!token) {
    throw new Error('Token is required for revocation');
  }

  console.log(`🔒 Revoking Slack OAuth token`);

  try {
    const response = await fetch('https://slack.com/api/auth.revoke', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Token revocation failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Token revocation failed: ${data.error}`);
    }

    console.log(`✅ Slack token revoked successfully`);
    return true;

  } catch (error) {
    console.error('Slack token revocation failed:', error);
    throw new Error(`Token revocation failed: ${error.message}`);
  }
}

/**
 * Get Slack team information
 * @param {string} bearerToken - Bearer token
 * @returns {Object} Team information
 */
export async function getTeamInfo(bearerToken) {
  if (!bearerToken) {
    throw new Error('Bearer token is required');
  }

  console.log(`🏢 Fetching Slack team info`);

  try {
    const response = await fetch('https://slack.com/api/team.info', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get team info: ${response.status} ${response.statusText}`);
    }

    const teamData = await response.json();

    if (!teamData.ok) {
      throw new Error(`Failed to get team info: ${teamData.error}`);
    }

    console.log(`✅ Retrieved Slack team info for: ${teamData.team.name}`);

    return {
      id: teamData.team.id,
      name: teamData.team.name,
      domain: teamData.team.domain,
      icon: teamData.team.icon,
      enterprise_id: teamData.team.enterprise_id,
      enterprise_name: teamData.team.enterprise_name
    };

  } catch (error) {
    console.error('Failed to get Slack team info:', error);
    throw new Error(`Team info retrieval failed: ${error.message}`);
  }
}