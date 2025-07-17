/**
 * OAuth Integration Utilities for GitHub Service
 * Handles integration with centralized OAuth service for token management
 */

import oauthServiceManager from '../../../services/oauth-service-manager.js';

/**
 * Refresh tokens using OAuth service with retry logic
 * @param {Object} params - Refresh parameters
 * @param {string} params.refreshToken - Refresh token
 * @param {string} params.clientId - OAuth client ID
 * @param {string} params.clientSecret - OAuth client secret
 * @returns {Object} New token response
 */
export async function refreshWithOAuthService(params) {
  const { refreshToken, clientId, clientSecret } = params;

  console.log(`🔄 Refreshing GitHub tokens via OAuth service with circuit breaker`);

  // Ensure OAuth service is running and available
  const serviceAvailable = await oauthServiceManager.ensureServiceRunning();
  if (!serviceAvailable) {
    throw new Error('OAuth service is not available');
  }

  try {
    // Use circuit breaker for OAuth service request
    const response = await oauthServiceManager.makeOAuthServiceRequest('/exchange-refresh-token', {
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

    const tokenData = await response.json();
    
    if (!tokenData.tokens || !tokenData.tokens.access_token) {
      throw new Error('Invalid token response from OAuth service');
    }

    console.log(`✅ GitHub tokens refreshed successfully via OAuth service with circuit breaker`);

    return {
      access_token: tokenData.tokens.access_token,
      refresh_token: tokenData.tokens.refresh_token || refreshToken,
      expires_in: tokenData.tokens.expires_in || 3600,
      token_type: tokenData.tokens.token_type || 'Bearer',
      scope: tokenData.tokens.scope,
      expires_at: tokenData.tokens.expires_at
    };

  } catch (error) {
    // Circuit breaker handles retries and failures
    console.error('OAuth service GitHub token refresh failed:', error);
    
    // Check for circuit breaker specific errors
    if (error.circuitBreakerState) {
      throw new Error(`OAuth service unavailable (circuit breaker ${error.circuitBreakerState}): ${error.message}`);
    }
    
    // Re-throw other errors for upstream handling
    throw error;
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

  console.log(`🔐 Exchanging GitHub credentials via OAuth service`);

  try {
    const oauthServiceUrl = process.env.OAUTH_SERVICE_URL || 'http://localhost:3001';
    
    const response = await fetch(`${oauthServiceUrl}/exchange-credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: 'github',
        client_id: clientId,
        client_secret: clientSecret,
        scopes: scopes || [
          'repo',
          'user:email',
          'read:user',
          'write:repo_hook',
          'read:org'
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

    console.log(`✅ GitHub tokens exchanged successfully via OAuth service`);

    return {
      access_token: tokenData.tokens.access_token,
      refresh_token: tokenData.tokens.refresh_token,
      expires_in: tokenData.tokens.expires_in || 3600,
      token_type: tokenData.tokens.token_type || 'Bearer',
      scope: tokenData.tokens.scope,
      expires_at: tokenData.tokens.expires_at
    };

  } catch (error) {
    console.error('OAuth service GitHub token exchange failed:', error);
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

  console.log(`🔍 Validating GitHub OAuth credentials via OAuth service`);

  try {
    const oauthServiceUrl = process.env.OAUTH_SERVICE_URL || 'http://localhost:3001';
    
    const response = await fetch(`${oauthServiceUrl}/validate-credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider: 'github',
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

    console.log(`✅ GitHub OAuth credentials validated via OAuth service`);

    return {
      valid: validationData.valid,
      error: validationData.error || null
    };

  } catch (error) {
    console.error('OAuth service GitHub credential validation failed:', error);
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
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${oauthServiceUrl}/health`, {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    if (response.ok) {
      const healthData = await response.json();
      console.log(`✅ OAuth service is healthy: ${healthData.status}`);
      return true;
    }
    
    return false;

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