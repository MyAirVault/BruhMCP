/**
 * Centralized OAuth Service for MCP Services
 * Handles OAuth flows for services requiring Client ID + Client Secret authentication
 * Stateless service - does not store tokens, only handles OAuth flows
 */

import express from 'express';
import cors from 'cors';
import { oauthManager } from './core/oauth-manager.js';
import { tokenExchange } from './core/token-exchange.js';
import { validateCredentialFormat } from './utils/validation.js';
import { ErrorResponses } from '../utils/errorResponse.js';
import { pool } from '../db/config.js';
import { updateOAuthStatus } from '../db/queries/mcpInstances/index.js';
import { checkInstanceLimit } from '../utils/planLimits.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Validate OAuth credentials format
 * POST /validate-credentials
 */
app.post('/validate-credentials', async (req, res) => {
  try {
    const { provider, client_id, client_secret } = req.body;

    if (!provider || !client_id || !client_secret) {
      return ErrorResponses.invalidInput(res, 'Missing required parameters', {
        required: ['provider', 'client_id', 'client_secret']
      });
    }

    const validation = await validateCredentialFormat(provider, client_id, client_secret);
    
    if (!validation.valid) {
      return ErrorResponses.invalidInput(res, validation.error, {
        provider,
        field: validation.field
      });
    }

    res.json({
      valid: true,
      provider,
      message: 'Credentials format is valid'
    });

  } catch (error) {
    console.error('OAuth credential validation error:', error);
    return ErrorResponses.internal(res, 'Failed to validate credentials', {
      error: error.message
    });
  }
});

/**
 * Start OAuth flow - generate authorization URL
 * POST /start-oauth
 */
app.post('/start-oauth', async (req, res) => {
  try {
    const { provider, client_id, client_secret, instance_id, scopes } = req.body;

    if (!provider || !client_id || !client_secret || !instance_id) {
      return ErrorResponses.invalidInput(res, 'Missing required parameters', {
        required: ['provider', 'client_id', 'client_secret', 'instance_id']
      });
    }

    // Validate UUID format for instance_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(instance_id)) {
      return ErrorResponses.invalidInput(res, 'Invalid instance ID format', {
        instanceId: instance_id,
        expectedFormat: 'UUID v4'
      });
    }

    const authUrl = await oauthManager.generateAuthorizationUrl({
      provider,
      client_id,
      client_secret,
      instance_id,
      scopes: scopes || []
    });

    res.json({
      authorization_url: authUrl,
      provider,
      instance_id,
      message: 'OAuth flow initiated'
    });

  } catch (error) {
    console.error('OAuth flow initiation error:', error);
    return ErrorResponses.internal(res, 'Failed to initiate OAuth flow', {
      error: error.message
    });
  }
});

/**
 * Handle OAuth callback
 * GET /oauth/callback/:provider
 */
app.get('/oauth/callback/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { code, state, error } = req.query;

    if (error) {
      console.error(`OAuth callback error from ${provider}:`, error);
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>OAuth Error</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_ERROR',
                error: '${String(error).replace(/'/g, "\\'")}',
                provider: '${provider}'
              }, '${process.env.FRONTEND_URL || 'http://localhost:3000'}');
            }
            window.close();
          </script>
          <p>Authorization failed. This window will close automatically.</p>
        </body>
        </html>
      `);
    }

    if (!code || !state) {
      console.error(`Missing OAuth callback parameters from ${provider}`);
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>OAuth Error</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_ERROR',
                error: 'Missing OAuth parameters',
                provider: '${provider}'
              }, '${process.env.FRONTEND_URL || 'http://localhost:3000'}');
            }
            window.close();
          </script>
          <p>Authorization failed. This window will close automatically.</p>
        </body>
        </html>
      `);
    }

    const tokens = await oauthManager.handleCallback({
      provider,
      code,
      state
    });

    console.log(`✅ OAuth callback processed successfully for ${provider}`);

    // Cache tokens in the appropriate service
    const { instance_id } = tokens;
    
    // Determine service name from instance in database
    const serviceName = await getServiceNameFromInstance(instance_id);
    console.log(`📡 Caching tokens for instance ${instance_id} in service: ${serviceName}`);
    
    // Cache tokens in the service
    await cacheTokensInService(instance_id, tokens, serviceName);

    // CRITICAL: Re-validate plan limits before completing OAuth
    // This prevents users from bypassing plan limits through OAuth timing attacks
    const userId = await getUserIdFromInstance(instance_id);
    if (!userId) {
      throw new Error('Instance not found or access denied');
    }

    const limitCheck = await checkInstanceLimit(userId);
    
    if (!limitCheck.canCreate && limitCheck.reason === 'ACTIVE_LIMIT_REACHED') {
      // Plan limit exceeded - deactivate instance and show error
      console.log(`❌ OAuth completion blocked: Plan limit exceeded for user ${userId} (${limitCheck.details.plan} plan)`);
      
      // Deactivate the instance
      await updateOAuthStatus(instance_id, {
        status: 'failed' // Mark OAuth as failed since plan limit was exceeded
      });
      
      // Update instance status to inactive
      const deactivateQuery = `
        UPDATE mcp_service_table 
        SET status = 'inactive', updated_at = NOW() 
        WHERE instance_id = $1
      `;
      await pool.query(deactivateQuery, [instance_id]);
      
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Plan Limit Reached</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_ERROR',
                error: 'Plan limit reached. You already have ${limitCheck.details.activeInstances} active instance${limitCheck.details.activeInstances > 1 ? 's' : ''} (limit: ${limitCheck.details.maxInstances}). Instance has been deactivated.',
                provider: '${provider}',
                planLimitReached: true
              }, '${process.env.FRONTEND_URL || 'http://localhost:3000'}');
            }
            window.close();
          </script>
          <p>Plan limit reached. Instance has been deactivated. This window will close automatically.</p>
        </body>
        </html>
      `);
    } else if (!limitCheck.canCreate) {
      // Other limit check failures (no plan, expired plan, etc.)
      console.log(`❌ OAuth completion blocked: ${limitCheck.reason} for user ${userId}`);
      
      await updateOAuthStatus(instance_id, {
        status: 'failed'
      });
      
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>OAuth Error</title>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_ERROR',
                error: '${limitCheck.message}',
                provider: '${provider}'
              }, '${process.env.FRONTEND_URL || 'http://localhost:3000'}');
            }
            window.close();
          </script>
          <p>OAuth failed: ${limitCheck.message}. This window will close automatically.</p>
        </body>
        </html>
      `);
    }

    // Update OAuth status in database - only if plan limits allow it
    await updateOAuthStatus(instance_id, {
      status: 'completed',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt: tokens.expires_at ? new Date(tokens.expires_at) : null,
      scope: tokens.scope
    });

    console.log(`✅ OAuth completed successfully for instance ${instance_id} with plan limit validation`);

    // Instead of redirecting, send HTML that communicates with parent window
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>OAuth Success</title>
      </head>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'OAUTH_SUCCESS',
              instanceId: '${instance_id}',
              provider: '${provider}'
            }, '${process.env.FRONTEND_URL || 'http://localhost:3000'}');
          }
          window.close();
        </script>
        <p>Authorization successful! This window will close automatically.</p>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>OAuth Error</title>
      </head>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'OAUTH_ERROR',
              error: '${String(error.message || error).replace(/'/g, "\\'")}',
              provider: '${req.params.provider || 'unknown'}'
            }, '${process.env.FRONTEND_URL || 'http://localhost:3000'}');
          }
          window.close();
        </script>
        <p>Authorization failed. This window will close automatically.</p>
      </body>
      </html>
    `);
  }
});

/**
 * Exchange refresh token for new access token
 * POST /exchange-refresh-token
 */
app.post('/exchange-refresh-token', async (req, res) => {
  try {
    const { provider, refresh_token, client_id, client_secret } = req.body;

    if (!provider || !refresh_token || !client_id || !client_secret) {
      return ErrorResponses.invalidInput(res, 'Missing required parameters', {
        required: ['provider', 'refresh_token', 'client_id', 'client_secret']
      });
    }

    const tokens = await tokenExchange.exchangeRefreshToken({
      provider,
      refresh_token,
      client_id,
      client_secret
    });

    res.json({
      success: true,
      tokens,
      provider,
      message: 'Refresh token exchanged successfully'
    });

  } catch (error) {
    console.error('Refresh token exchange error:', error);
    return ErrorResponses.internal(res, 'Failed to exchange refresh token', {
      error: error.message
    });
  }
});

/**
 * Exchange credentials for new tokens (fallback)
 * POST /exchange-credentials
 */
app.post('/exchange-credentials', async (req, res) => {
  try {
    const { provider, client_id, client_secret, scopes } = req.body;

    if (!provider || !client_id || !client_secret) {
      return ErrorResponses.invalidInput(res, 'Missing required parameters', {
        required: ['provider', 'client_id', 'client_secret']
      });
    }

    const tokens = await tokenExchange.exchangeCredentials({
      provider,
      client_id,
      client_secret,
      scopes: scopes || []
    });

    res.json({
      success: true,
      tokens,
      provider,
      message: 'Credentials exchanged successfully'
    });

  } catch (error) {
    console.error('Credential exchange error:', error);
    return ErrorResponses.internal(res, 'Failed to exchange credentials', {
      error: error.message
    });
  }
});

/**
 * Health check endpoint
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'oauth-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * OAuth provider capabilities
 * GET /providers
 */
app.get('/providers', (req, res) => {
  res.json({
    providers: [
      {
        name: 'google',
        display_name: 'Google',
        supported_services: ['gmail', 'googledrive', 'googlecalendar'],
        auth_url: 'https://accounts.google.com/o/oauth2/auth',
        token_url: 'https://oauth2.googleapis.com/token'
      },
      {
        name: 'microsoft',
        display_name: 'Microsoft',
        supported_services: ['outlook', 'onedrive', 'microsoftteams'],
        auth_url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        token_url: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
      },
      {
        name: 'notion',
        display_name: 'Notion',
        supported_services: ['notion'],
        auth_url: 'https://api.notion.com/v1/oauth/authorize',
        token_url: 'https://api.notion.com/v1/oauth/token'
      },
      {
        name: 'slack',
        display_name: 'Slack',
        supported_services: ['slack'],
        auth_url: 'https://slack.com/oauth/v2/authorize',
        token_url: 'https://slack.com/api/oauth.v2.access'
      },
      {
        name: 'discord',
        display_name: 'Discord',
        supported_services: ['discord'],
        auth_url: 'https://discord.com/api/oauth2/authorize',
        token_url: 'https://discord.com/api/oauth2/token'
      },
      {
        name: 'reddit',
        display_name: 'Reddit',
        supported_services: ['reddit'],
        auth_url: 'https://www.reddit.com/api/v1/authorize',
        token_url: 'https://www.reddit.com/api/v1/access_token'
      },
      {
        name: 'github',
        display_name: 'GitHub',
        supported_services: ['github'],
        auth_url: 'https://github.com/login/oauth/authorize',
        token_url: 'https://github.com/login/oauth/access_token'
      },
      {
        name: 'dropbox',
        display_name: 'Dropbox',
        supported_services: ['dropbox'],
        auth_url: 'https://www.dropbox.com/oauth2/authorize',
        token_url: 'https://api.dropboxapi.com/oauth2/token'
      }
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('OAuth service error:', error);
  return ErrorResponses.internal(res, 'OAuth service error', {
    error: error.message
  });
});

// 404 handler
app.use((req, res) => {
  return ErrorResponses.notFound(res, 'OAuth endpoint not found', {
    method: req.method,
    path: req.path
  });
});

/**
 * Cache tokens in the appropriate service
 * @param {string} instanceId - Instance ID
 * @param {Object} tokens - OAuth tokens
 * @param {string} serviceName - Service name
 */
async function cacheTokensInService(instanceId, tokens, serviceName) {
  try {
    // Get service port from database
    const servicePort = await getServicePort(serviceName);
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
      throw new Error(`Failed to cache tokens in ${serviceName} service`);
    }

    console.log(`✅ Tokens cached in ${serviceName} service for instance ${instanceId}`);
  } catch (error) {
    console.error(`❌ Failed to cache tokens in ${serviceName} service:`, error);
    throw error;
  }
}

/**
 * Get user ID from instance ID
 * @param {string} instanceId - Instance ID
 * @returns {Promise<string|null>} User ID or null if not found
 */
async function getUserIdFromInstance(instanceId) {
  try {
    const query = `
      SELECT user_id 
      FROM mcp_service_table
      WHERE instance_id = $1
    `;
    
    const result = await pool.query(query, [instanceId]);
    
    if (result.rows.length === 0) {
      console.error(`Instance ${instanceId} not found in database`);
      return null;
    }
    
    return result.rows[0].user_id;
  } catch (error) {
    console.error(`Error getting user ID for instance ${instanceId}:`, error);
    return null;
  }
}

/**
 * Get service name from instance ID
 * @param {string} instanceId - Instance ID
 * @returns {Promise<string>} Service name
 */
async function getServiceNameFromInstance(instanceId) {
  try {
    const query = `
      SELECT s.mcp_service_name 
      FROM mcp_service_table mst
      JOIN mcp_table s ON mst.mcp_service_id = s.mcp_service_id
      WHERE mst.instance_id = $1
    `;
    
    const result = await pool.query(query, [instanceId]);
    
    if (result.rows.length === 0) {
      console.error(`Instance ${instanceId} not found in database`);
      throw new Error(`Instance ${instanceId} not found`);
    }
    
    return result.rows[0].mcp_service_name;
  } catch (error) {
    console.error(`Error getting service name for instance ${instanceId}:`, error);
    throw error;
  }
}

/**
 * Get service port from database based on service name
 * @param {string} serviceName - Service name
 * @returns {Promise<number>} Service port
 */
async function getServicePort(serviceName) {
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

export default app;