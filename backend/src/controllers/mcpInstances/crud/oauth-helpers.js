/**
 * OAuth Helper Functions for MCP Instance Creation
 * Handles OAuth flow integration with centralized OAuth service
 */

import { pool } from '../../../db/config.js';
import oauthServiceManager from '../../../services/oauth-service-manager.js';

/**
 * Handle OAuth flow for a created instance
 * @param {Object} params - OAuth flow parameters
 * @param {string} params.instanceId - Created instance ID
 * @param {string} params.provider - OAuth provider (google, microsoft, etc.)
 * @param {string} params.clientId - OAuth client ID
 * @param {string} params.clientSecret - OAuth client secret
 * @param {string} params.serviceName - MCP service name
 * @returns {Object} OAuth flow result
 */
export async function handleOAuthFlow(params) {
  const { instanceId, provider, clientId, clientSecret, serviceName } = params;

  try {
    console.log(`🔐 Starting OAuth flow for instance ${instanceId} with provider ${provider}`);

    // Ensure OAuth service is running
    const serviceStarted = await oauthServiceManager.ensureServiceRunning();
    if (!serviceStarted) {
      throw new Error('Failed to start OAuth service');
    }

    // Get OAuth scopes based on service
    const scopes = getOAuthScopes(serviceName);

    // Call OAuth service to start OAuth flow
    const oauthServiceUrl = oauthServiceManager.getServiceUrl();
    
    const startOAuthResponse = await fetch(`${oauthServiceUrl}/start-oauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider,
        client_id: clientId,
        client_secret: clientSecret,
        instance_id: instanceId,
        scopes
      })
    });

    if (!startOAuthResponse.ok) {
      const errorData = await startOAuthResponse.json();
      throw new Error(`OAuth service error: ${errorData.error || 'Unknown error'}`);
    }

    const oauthData = await startOAuthResponse.json();
    
    console.log(`✅ OAuth flow initiated successfully for instance ${instanceId}`);
    
    // Return authorization URL to frontend for user consent
    return {
      success: true,
      authorization_url: oauthData.authorization_url,
      instance_id: instanceId,
      provider,
      requires_user_consent: true,
      message: 'OAuth flow initiated - user consent required'
    };

  } catch (error) {
    console.error(`❌ OAuth flow failed for instance ${instanceId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get OAuth provider name based on service name
 * @param {string} serviceName - MCP service name
 * @returns {string} OAuth provider name
 */
export function getOAuthProvider(serviceName) {
  const providerMap = {
    'gmail': 'google',
    'googledrive': 'google',
    'googlecalendar': 'google',
    'googlesheets': 'google',
    'googledocs': 'google',
    'outlook': 'microsoft',
    'onedrive': 'microsoft',
    'microsoftteams': 'microsoft'
  };

  return providerMap[serviceName] || 'unknown';
}

/**
 * Get OAuth scopes based on service name
 * @param {string} serviceName - MCP service name
 * @returns {Array} OAuth scopes
 */
export function getOAuthScopes(serviceName) {
  const scopeMap = {
    'gmail': [
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    'googledrive': [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    'googlecalendar': [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    'outlook': [
      'https://graph.microsoft.com/mail.readwrite',
      'https://graph.microsoft.com/user.read'
    ],
    'onedrive': [
      'https://graph.microsoft.com/files.readwrite',
      'https://graph.microsoft.com/user.read'
    ],
    'microsoftteams': [
      'https://graph.microsoft.com/team.readbasic.all',
      'https://graph.microsoft.com/user.read'
    ]
  };

  return scopeMap[serviceName] || [];
}

/**
 * Cache OAuth tokens for a service instance
 * @param {string} instanceId - Instance ID
 * @param {Object} tokens - OAuth tokens
 * @param {string} serviceName - MCP service name
 */
export async function cacheOAuthTokens(instanceId, tokens, serviceName) {
  if (!tokens) {
    console.log(`⚠️ No tokens to cache for instance ${instanceId}`);
    return;
  }

  try {
    console.log(`💾 Caching OAuth tokens for instance ${instanceId}`);

    // Get service port from database to determine which service to cache tokens for
    const servicePort = await getServicePort(serviceName);
    
    // Call the specific service to cache tokens
    const serviceUrl = `http://localhost:${servicePort}`;
    
    const cacheResponse = await fetch(`${serviceUrl}/cache-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instance_id: instanceId,
        tokens
      })
    });

    if (!cacheResponse.ok) {
      throw new Error(`Failed to cache tokens in service: ${cacheResponse.status}`);
    }

    console.log(`✅ OAuth tokens cached successfully for instance ${instanceId}`);

  } catch (error) {
    console.error(`❌ Failed to cache OAuth tokens for instance ${instanceId}:`, error);
    throw error;
  }
}

/**
 * Delete MCP instance (cleanup on OAuth failure)
 * @param {string} instanceId - Instance ID to delete
 */
export async function deleteMCPInstance(instanceId) {
  try {
    console.log(`🗑️ Deleting instance ${instanceId} due to OAuth failure`);

    const deleteQuery = `
      DELETE FROM mcp_service_table 
      WHERE instance_id = $1
    `;

    const result = await pool.query(deleteQuery, [instanceId]);

    if (result.rowCount === 0) {
      console.warn(`⚠️ Instance ${instanceId} not found for deletion`);
    } else {
      console.log(`✅ Instance ${instanceId} deleted successfully`);
    }

  } catch (error) {
    console.error(`❌ Failed to delete instance ${instanceId}:`, error);
    throw error;
  }
}

/**
 * Get service port from database based on service name
 * @param {string} serviceName - MCP service name
 * @returns {Promise<number>} Service port
 */
export async function getServicePort(serviceName) {
  try {
    const query = `
      SELECT port 
      FROM mcp_table 
      WHERE mcp_service_name = $1 AND is_active = true
    `;
    
    const result = await pool.query(query, [serviceName]);
    
    if (result.rows.length === 0) {
      console.error(`Service ${serviceName} not found in database`);
      return 49000; // Default port
    }
    
    return result.rows[0].port;
  } catch (error) {
    console.error(`Error getting port for service ${serviceName}:`, error);
    return 49000; // Default port
  }
}

/**
 * Validate OAuth credentials before starting flow
 * @param {string} provider - OAuth provider
 * @param {string} clientId - OAuth client ID
 * @param {string} clientSecret - OAuth client secret
 * @returns {Object} Validation result
 */
export async function validateOAuthCredentials(provider, clientId, clientSecret) {
  try {
    // Ensure OAuth service is running
    const serviceStarted = await oauthServiceManager.ensureServiceRunning();
    if (!serviceStarted) {
      throw new Error('Failed to start OAuth service');
    }

    const oauthServiceUrl = oauthServiceManager.getServiceUrl();
    
    const validateResponse = await fetch(`${oauthServiceUrl}/validate-credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        provider,
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    if (!validateResponse.ok) {
      const errorData = await validateResponse.json();
      return {
        valid: false,
        error: errorData.error || 'Validation failed'
      };
    }

    const validationData = await validateResponse.json();
    return {
      valid: validationData.valid,
      error: validationData.error || null
    };

  } catch (error) {
    console.error('OAuth credential validation error:', error);
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
    // Check if OAuth service is running or can be started
    const serviceAvailable = await oauthServiceManager.ensureServiceRunning();
    if (!serviceAvailable) {
      return false;
    }

    const oauthServiceUrl = oauthServiceManager.getServiceUrl();
    
    const healthResponse = await fetch(`${oauthServiceUrl}/health`, {
      method: 'GET',
      timeout: 5000
    });

    return healthResponse.ok;

  } catch (error) {
    console.error('OAuth service health check failed:', error);
    return false;
  }
}

