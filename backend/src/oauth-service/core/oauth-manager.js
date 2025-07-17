/**
 * OAuth Manager - Handles OAuth flow orchestration
 * Stateless service that manages OAuth flows across different providers
 */

import { googleOAuth } from '../providers/google.js';
import { microsoftOAuth } from '../providers/microsoft.js';
import { notionOAuth } from '../providers/notion.js';
import { slackOAuth } from '../providers/slack.js';
import { discordOAuth } from '../providers/discord.js';
import { redditOAuth } from '../providers/reddit.js';
import { githubOAuth } from '../providers/github.js';
import { dropboxOAuth } from '../providers/dropbox.js';
import { generateSecureState, validateAndParseState } from '../utils/validation.js';

/**
 * OAuth Manager class for handling OAuth flows
 */
class OAuthManager {
  constructor() {
    this.providers = {
      google: googleOAuth,
      microsoft: microsoftOAuth,
      notion: notionOAuth,
      slack: slackOAuth,
      discord: discordOAuth,
      reddit: redditOAuth,
      github: githubOAuth,
      dropbox: dropboxOAuth
    };
    // Temporary storage for OAuth credentials during flow
    // In production, this should be replaced with Redis or similar
    this.tempCredentials = new Map();
    
    // Set up cleanup interval to prevent memory leaks
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredCredentials();
    }, 5 * 60 * 1000); // Clean up every 5 minutes
  }

  /**
   * Generate OAuth authorization URL
   * @param {Object} params - OAuth parameters
   * @param {string} params.provider - OAuth provider name
   * @param {string} params.client_id - OAuth client ID
   * @param {string} params.client_secret - OAuth client secret
   * @param {string} params.instance_id - Instance ID to include in state
   * @param {Array} params.scopes - Required OAuth scopes
   * @returns {string} Authorization URL
   */
  async generateAuthorizationUrl(params) {
    const { provider, client_id, client_secret, instance_id, scopes } = params;

    const oauthProvider = this.providers[provider];
    if (!oauthProvider) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    // Validate credentials format
    const validation = await oauthProvider.validateCredentials(client_id, client_secret);
    if (!validation.valid) {
      throw new Error(`Invalid credentials: ${validation.error}`);
    }

    // Generate secure state parameter with instance_id
    const state = generateSecureState(instance_id);

    // Store credentials temporarily for the callback
    this.tempCredentials.set(state, {
      provider,
      client_id,
      client_secret,
      instance_id,
      scopes,
      timestamp: Date.now(),
      expires_at: Date.now() + (10 * 60 * 1000) // 10 minutes
    });

    // Generate authorization URL
    const authUrl = await oauthProvider.generateAuthorizationUrl({
      client_id,
      scopes,
      state,
      redirect_uri: this.getRedirectUri(provider)
    });

    console.log(`🔐 Generated OAuth authorization URL for ${provider} (instance: ${instance_id})`);
    
    return authUrl;
  }

  /**
   * Handle OAuth callback
   * @param {Object} params - Callback parameters
   * @param {string} params.provider - OAuth provider name
   * @param {string} params.code - Authorization code
   * @param {string} params.state - State parameter
   * @returns {Object} Token response
   */
  async handleCallback(params) {
    const { provider, code, state } = params;

    const oauthProvider = this.providers[provider];
    if (!oauthProvider) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    // Validate and extract instance_id from state
    const { instanceId } = this.validateState(state);

    // Retrieve stored credentials for this state
    const storedCredentials = this.tempCredentials.get(state);
    if (!storedCredentials) {
      throw new Error('OAuth credentials not found for this state - session may have expired');
    }

    // Check if credentials have expired
    if (Date.now() > storedCredentials.expires_at) {
      this.tempCredentials.delete(state);
      throw new Error('OAuth session has expired - please restart the authorization process');
    }

    // Extract credentials
    const { client_id, client_secret } = storedCredentials;

    // Exchange authorization code for tokens
    const tokens = await oauthProvider.exchangeAuthorizationCode({
      code,
      client_id,
      client_secret,
      redirect_uri: this.getRedirectUri(provider)
    });

    // Validate token scopes
    const scopeValidation = await oauthProvider.validateTokenScopes(tokens);
    if (!scopeValidation.valid) {
      throw new Error(`Invalid token scopes: ${scopeValidation.error}`);
    }

    // Clean up temporary credentials
    this.tempCredentials.delete(state);

    console.log(`✅ OAuth callback processed for ${provider} (instance: ${instanceId})`);

    return {
      ...tokens,
      instance_id: instanceId,
      provider
    };
  }

  /**
   * Get redirect URI for provider
   * @param {string} provider - OAuth provider name
   * @returns {string} Redirect URI
   */
  getRedirectUri(provider) {
    const baseUrl = process.env.OAUTH_BASE_URL || 'http://localhost:3001';
    return `${baseUrl}/oauth/callback/${provider}`;
  }

  /**
   * Validate state parameter and extract instance_id
   * @param {string} state - State parameter
   * @returns {Object} Extracted state data
   */
  validateState(state) {
    return validateAndParseState(state);
  }

  /**
   * Clean up expired credentials from temporary storage
   * Should be called periodically to prevent memory leaks
   */
  cleanupExpiredCredentials() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [state, credentials] of this.tempCredentials.entries()) {
      if (now > credentials.expires_at) {
        this.tempCredentials.delete(state);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired OAuth credentials`);
    }
  }

  /**
   * Get credentials for a specific state (for debugging)
   * @param {string} state - State parameter
   * @returns {Object|null} Stored credentials or null if not found
   */
  getCredentialsForState(state) {
    return this.tempCredentials.get(state) || null;
  }

  /**
   * Get supported providers
   * @returns {Array} List of supported providers
   */
  getSupportedProviders() {
    return Object.keys(this.providers);
  }

  /**
   * Check if provider is supported
   * @param {string} provider - Provider name
   * @returns {boolean} Whether provider is supported
   */
  isProviderSupported(provider) {
    return this.providers.hasOwnProperty(provider);
  }

  /**
   * Destroy the OAuth manager and clean up resources
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.tempCredentials.clear();
    console.log('🔒 OAuth manager destroyed and resources cleaned up');
  }
}

export const oauthManager = new OAuthManager();