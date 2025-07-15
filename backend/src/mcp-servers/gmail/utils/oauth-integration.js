/**
 * OAuth Integration Utilities for Gmail Service
 * Handles integration with centralized OAuth service for token management
 */

/**
 * Refresh tokens using OAuth service
 * @param {Object} params - Refresh parameters
 * @param {string} params.refreshToken - Refresh token
 * @param {string} params.clientId - OAuth client ID
 * @param {string} params.clientSecret - OAuth client secret
 * @returns {Object} New token response
 */
export async function refreshWithOAuthService(params) {
  const { refreshToken, clientId, clientSecret } = params;

  console.log(`🔄 Refreshing tokens via OAuth service`);

  try {
    const oauthServiceUrl = process.env.OAUTH_SERVICE_URL || 'http://localhost:3001';
    
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
    
    if (!tokenData.tokens || !tokenData.tokens.access_token) {
      throw new Error('Invalid token response from OAuth service');
    }

    console.log(`✅ Tokens refreshed successfully via OAuth service`);

    return {
      access_token: tokenData.tokens.access_token,
      refresh_token: tokenData.tokens.refresh_token || refreshToken,
      expires_in: tokenData.tokens.expires_in || 3600,
      token_type: tokenData.tokens.token_type || 'Bearer',
      scope: tokenData.tokens.scope,
      expires_at: tokenData.tokens.expires_at
    };

  } catch (error) {
    console.error('OAuth service token refresh failed:', error);
    throw new Error(`OAuth token refresh failed: ${error.message}`);
  }
}

/**
 * Exchange credentials for tokens using OAuth service
 * @param {Object} params - Exchange parameters
 * @param {string} params.clientId - OAuth client ID
 * @param {string} params.clientSecret - OAuth client secret
 * @param {Array} params.scopes - Required OAuth scopes
 * @returns {Object} Token response
 */
export async function exchangeTokens(params) {
  const { clientId, clientSecret, scopes } = params;

  console.log(`🔐 Exchanging credentials via OAuth service`);

  try {
    const oauthServiceUrl = process.env.OAUTH_SERVICE_URL || 'http://localhost:3001';
    
    const response = await fetch(`${oauthServiceUrl}/exchange-credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: 'google',
        client_id: clientId,
        client_secret: clientSecret,
        scopes: scopes || [
          'https://www.googleapis.com/auth/gmail.modify',
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile'
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OAuth service error: ${errorData.error || 'Token exchange failed'}`);
    }

    const tokenData = await response.json();
    
    if (!tokenData.tokens || !tokenData.tokens.access_token) {
      throw new Error('Invalid token response from OAuth service');
    }

    console.log(`✅ Tokens exchanged successfully via OAuth service`);

    return {
      access_token: tokenData.tokens.access_token,
      refresh_token: tokenData.tokens.refresh_token,
      expires_in: tokenData.tokens.expires_in || 3600,
      token_type: tokenData.tokens.token_type || 'Bearer',
      scope: tokenData.tokens.scope,
      expires_at: tokenData.tokens.expires_at
    };

  } catch (error) {
    console.error('OAuth service token exchange failed:', error);
    throw new Error(`OAuth token exchange failed: ${error.message}`);
  }
}

/**
 * Validate OAuth credentials using OAuth service
 * @param {Object} params - Validation parameters
 * @param {string} params.clientId - OAuth client ID
 * @param {string} params.clientSecret - OAuth client secret
 * @returns {Object} Validation result
 */
export async function validateOAuthCredentials(params) {
  const { clientId, clientSecret } = params;

  console.log(`🔍 Validating OAuth credentials via OAuth service`);

  try {
    const oauthServiceUrl = process.env.OAUTH_SERVICE_URL || 'http://localhost:3001';
    
    const response = await fetch(`${oauthServiceUrl}/validate-credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: 'google',
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        valid: false,
        error: errorData.error || 'Validation failed'
      };
    }

    const validationData = await response.json();

    console.log(`✅ OAuth credentials validated via OAuth service`);

    return {
      valid: validationData.valid,
      error: validationData.error || null
    };

  } catch (error) {
    console.error('OAuth service credential validation failed:', error);
    return {
      valid: false,
      error: error.message
    };
  }
}

/**
 * Check if OAuth service is available
 * @returns {boolean} True if OAuth service is available
 */
export async function isOAuthServiceAvailable() {
  try {
    const oauthServiceUrl = process.env.OAUTH_SERVICE_URL || 'http://localhost:3001';
    
    const response = await fetch(`${oauthServiceUrl}/health`, {
      method: 'GET',
      timeout: 5000
    });

    return response.ok;

  } catch (error) {
    console.error('OAuth service health check failed:', error);
    return false;
  }
}

/**
 * Get OAuth service providers
 * @returns {Object} Available providers
 */
export async function getOAuthProviders() {
  try {
    const oauthServiceUrl = process.env.OAUTH_SERVICE_URL || 'http://localhost:3001';
    
    const response = await fetch(`${oauthServiceUrl}/providers`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error('Failed to get OAuth providers');
    }

    const providersData = await response.json();
    return providersData;

  } catch (error) {
    console.error('Failed to get OAuth providers:', error);
    return {
      providers: []
    };
  }
}