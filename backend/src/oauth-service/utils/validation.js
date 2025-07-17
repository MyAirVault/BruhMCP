/**
 * OAuth Validation Utilities
 * Common validation functions for OAuth credentials and parameters
 */

import crypto from 'crypto';

/**
 * Validate OAuth credentials format for a specific provider
 * @param {string} provider - OAuth provider name
 * @param {string} clientId - OAuth client ID
 * @param {string} clientSecret - OAuth client secret
 * @returns {Object} Validation result
 */
export async function validateCredentialFormat(provider, clientId, clientSecret) {
  const validation = {
    valid: true,
    errors: []
  };

  // Basic validation for all providers
  if (!provider || typeof provider !== 'string') {
    validation.valid = false;
    validation.errors.push('Provider is required and must be a string');
  }

  if (!clientId || typeof clientId !== 'string') {
    validation.valid = false;
    validation.errors.push('Client ID is required and must be a string');
  }

  if (!clientSecret || typeof clientSecret !== 'string') {
    validation.valid = false;
    validation.errors.push('Client Secret is required and must be a string');
  }

  // Provider-specific validation
  switch (provider.toLowerCase()) {
    case 'google':
      return validateGoogleCredentials(clientId, clientSecret);
    
    case 'microsoft':
      return validateMicrosoftCredentials(clientId, clientSecret);
    
    case 'notion':
      return validateNotionCredentials(clientId, clientSecret);
    
    case 'slack':
      return validateSlackCredentials(clientId, clientSecret);
    
    case 'discord':
      return validateDiscordCredentials(clientId, clientSecret);
    
    case 'reddit':
      return validateRedditCredentials(clientId, clientSecret);
    
    case 'github':
      return validateGitHubCredentials(clientId, clientSecret);
    
    case 'dropbox':
      return validateDropboxCredentials(clientId, clientSecret);
    
    default:
      validation.valid = false;
      validation.errors.push(`Unsupported OAuth provider: ${provider}`);
  }

  return {
    valid: validation.valid,
    error: validation.errors.join(', '),
    field: validation.valid ? null : 'provider'
  };
}

/**
 * Validate Google OAuth credentials format
 * @param {string} clientId - Google OAuth Client ID
 * @param {string} clientSecret - Google OAuth Client Secret
 * @returns {Object} Validation result
 */
function validateGoogleCredentials(clientId, clientSecret) {
  const validation = {
    valid: true,
    errors: []
  };

  // Validate Google Client ID format
  if (clientId) {
    if (!clientId.endsWith('.apps.googleusercontent.com')) {
      validation.valid = false;
      validation.errors.push('Google Client ID must end with .apps.googleusercontent.com');
    }
    
    if (clientId.length < 20 || clientId.length > 100) {
      validation.valid = false;
      validation.errors.push('Google Client ID length appears invalid');
    }
  }

  // Validate Google Client Secret format
  if (clientSecret) {
    if (clientSecret.length < 20 || clientSecret.length > 50) {
      validation.valid = false;
      validation.errors.push('Google Client Secret length appears invalid');
    }
  }

  return {
    valid: validation.valid,
    error: validation.errors.join(', '),
    field: validation.valid ? null : 'credentials'
  };
}

/**
 * Validate Microsoft OAuth credentials format
 * @param {string} clientId - Microsoft OAuth Client ID
 * @param {string} clientSecret - Microsoft OAuth Client Secret
 * @returns {Object} Validation result
 */
function validateMicrosoftCredentials(clientId, clientSecret) {
  const validation = {
    valid: true,
    errors: []
  };

  // Validate Microsoft Client ID format (UUID)
  if (clientId) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(clientId)) {
      validation.valid = false;
      validation.errors.push('Microsoft Client ID must be a valid UUID');
    }
  }

  // Validate Microsoft Client Secret format
  if (clientSecret) {
    if (clientSecret.length < 10 || clientSecret.length > 200) {
      validation.valid = false;
      validation.errors.push('Microsoft Client Secret length appears invalid');
    }
  }

  return {
    valid: validation.valid,
    error: validation.errors.join(', '),
    field: validation.valid ? null : 'credentials'
  };
}

/**
 * Generate secure state parameter for OAuth flow
 * @param {string} instanceId - Instance ID to embed in state
 * @returns {string} Base64 encoded state parameter
 */
export function generateSecureState(instanceId) {
  // Validate instance ID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(instanceId)) {
    throw new Error('Invalid instance ID format for state generation');
  }

  const timestamp = Date.now().toString();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  
  // Format: instance_id:timestamp:random
  const stateData = `${instanceId}:${timestamp}:${randomBytes}`;
  
  // Encode to base64
  const state = Buffer.from(stateData, 'utf-8').toString('base64');
  
  console.log(`🔐 Generated secure state for instance: ${instanceId}`);
  
  return state;
}

/**
 * Validate and parse state parameter
 * @param {string} state - Base64 encoded state parameter
 * @returns {Object} Parsed state data
 */
export function validateAndParseState(state) {
  if (!state || typeof state !== 'string') {
    throw new Error('State parameter is required and must be a string');
  }

  try {
    // Decode from base64
    const decoded = Buffer.from(state, 'base64').toString('utf-8');
    const [instanceId, timestamp, random] = decoded.split(':');

    // Validate format
    if (!instanceId || !timestamp || !random) {
      throw new Error('Invalid state format');
    }

    // Validate instance ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(instanceId)) {
      throw new Error('Invalid instance ID in state');
    }

    // Validate timestamp
    const stateTimestamp = parseInt(timestamp);
    if (isNaN(stateTimestamp) || stateTimestamp <= 0) {
      throw new Error('Invalid timestamp in state');
    }

    // Check if state has expired (10 minutes)
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes
    if (now - stateTimestamp > maxAge) {
      throw new Error('OAuth state has expired');
    }

    // Validate random component
    if (random.length !== 32) { // 16 bytes = 32 hex chars
      throw new Error('Invalid random component in state');
    }

    console.log(`✅ State validated successfully for instance: ${instanceId}`);

    return {
      instanceId,
      timestamp: stateTimestamp,
      random,
      age: now - stateTimestamp
    };

  } catch (error) {
    console.error('State validation failed:', error);
    throw new Error(`Invalid OAuth state parameter: ${error.message}`);
  }
}

/**
 * Validate OAuth scopes format
 * @param {Array} scopes - Array of OAuth scopes
 * @returns {Object} Validation result
 */
export function validateScopes(scopes) {
  const validation = {
    valid: true,
    errors: []
  };

  if (!Array.isArray(scopes)) {
    validation.valid = false;
    validation.errors.push('Scopes must be an array');
    return {
      valid: validation.valid,
      error: validation.errors.join(', ')
    };
  }

  // Check each scope
  for (const scope of scopes) {
    if (typeof scope !== 'string') {
      validation.valid = false;
      validation.errors.push('All scopes must be strings');
      break;
    }

    if (scope.length === 0) {
      validation.valid = false;
      validation.errors.push('Scopes cannot be empty strings');
      break;
    }

    // Basic URL validation for scope format
    try {
      new URL(scope);
    } catch (urlError) {
      // Some scopes might not be URLs, so this is just a warning
      console.warn(`Scope may not be a valid URL: ${scope}`);
    }
  }

  return {
    valid: validation.valid,
    error: validation.errors.join(', ')
  };
}

/**
 * Validate redirect URI format
 * @param {string} redirectUri - OAuth redirect URI
 * @returns {Object} Validation result
 */
export function validateRedirectUri(redirectUri) {
  const validation = {
    valid: true,
    errors: []
  };

  if (!redirectUri || typeof redirectUri !== 'string') {
    validation.valid = false;
    validation.errors.push('Redirect URI is required and must be a string');
    return {
      valid: validation.valid,
      error: validation.errors.join(', ')
    };
  }

  // Validate URL format
  try {
    const url = new URL(redirectUri);
    
    // Check for HTTPS in production
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
      validation.valid = false;
      validation.errors.push('Redirect URI must use HTTPS in production');
    }

    // Check for localhost in development
    if (process.env.NODE_ENV === 'development' && url.hostname === 'localhost') {
      // Allow localhost in development
    }

  } catch (urlError) {
    validation.valid = false;
    validation.errors.push('Redirect URI must be a valid URL');
  }

  return {
    valid: validation.valid,
    error: validation.errors.join(', ')
  };
}

/**
 * Sanitize OAuth parameters to prevent injection attacks
 * @param {Object} params - OAuth parameters
 * @returns {Object} Sanitized parameters
 */
export function sanitizeOAuthParams(params) {
  const sanitized = {};

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      // Remove potential XSS characters
      sanitized[key] = value
        .replace(/[<>\"']/g, '') // Remove HTML/JS injection chars
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/data:/gi, '') // Remove data: protocol
        .trim();
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validate Notion OAuth credentials format
 * @param {string} clientId - Notion OAuth Client ID
 * @param {string} clientSecret - Notion OAuth Client Secret
 * @returns {Object} Validation result
 */
function validateNotionCredentials(clientId, clientSecret) {
  const validation = {
    valid: true,
    errors: []
  };

  // Validate Notion Client ID format (UUID)
  if (clientId) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(clientId)) {
      validation.valid = false;
      validation.errors.push('Notion Client ID must be a valid UUID');
    }
  }

  // Validate Notion Client Secret format
  if (clientSecret) {
    if (clientSecret.length < 30 || clientSecret.length > 100) {
      validation.valid = false;
      validation.errors.push('Notion Client Secret length appears invalid');
    }
  }

  return {
    valid: validation.valid,
    error: validation.errors.join(', '),
    field: validation.valid ? null : 'credentials'
  };
}

/**
 * Validate Slack OAuth credentials format
 * @param {string} clientId - Slack OAuth Client ID
 * @param {string} clientSecret - Slack OAuth Client Secret
 * @returns {Object} Validation result
 */
function validateSlackCredentials(clientId, clientSecret) {
  const validation = {
    valid: true,
    errors: []
  };

  // Validate Slack Client ID format (number.number)
  if (clientId) {
    const slackIdRegex = /^\d+\.\d+$/;
    if (!slackIdRegex.test(clientId)) {
      validation.valid = false;
      validation.errors.push('Slack Client ID must be in format "number.number"');
    }
  }

  // Validate Slack Client Secret format
  if (clientSecret) {
    if (clientSecret.length < 30 || clientSecret.length > 40) {
      validation.valid = false;
      validation.errors.push('Slack Client Secret length appears invalid');
    }
  }

  return {
    valid: validation.valid,
    error: validation.errors.join(', '),
    field: validation.valid ? null : 'credentials'
  };
}

/**
 * Validate Discord OAuth credentials format
 * @param {string} clientId - Discord OAuth Client ID
 * @param {string} clientSecret - Discord OAuth Client Secret
 * @returns {Object} Validation result
 */
function validateDiscordCredentials(clientId, clientSecret) {
  const validation = {
    valid: true,
    errors: []
  };

  // Validate Discord Client ID format (18-19 digit snowflake)
  if (clientId) {
    const discordIdRegex = /^\d{18,19}$/;
    if (!discordIdRegex.test(clientId)) {
      validation.valid = false;
      validation.errors.push('Discord Client ID must be 18-19 digits');
    }
  }

  // Validate Discord Client Secret format
  if (clientSecret) {
    if (clientSecret.length < 30 || clientSecret.length > 40) {
      validation.valid = false;
      validation.errors.push('Discord Client Secret length appears invalid');
    }
  }

  return {
    valid: validation.valid,
    error: validation.errors.join(', '),
    field: validation.valid ? null : 'credentials'
  };
}

/**
 * Validate Reddit OAuth credentials format
 * @param {string} clientId - Reddit OAuth Client ID
 * @param {string} clientSecret - Reddit OAuth Client Secret
 * @returns {Object} Validation result
 */
function validateRedditCredentials(clientId, clientSecret) {
  const validation = {
    valid: true,
    errors: []
  };

  // Validate Reddit Client ID format (14-22 alphanumeric with hyphens/underscores)
  if (clientId) {
    const redditIdRegex = /^[a-zA-Z0-9_-]{14,22}$/;
    if (!redditIdRegex.test(clientId)) {
      validation.valid = false;
      validation.errors.push('Reddit Client ID must be 14-22 alphanumeric characters with hyphens/underscores');
    }
  }

  // Validate Reddit Client Secret format
  if (clientSecret) {
    if (clientSecret.length < 20 || clientSecret.length > 40) {
      validation.valid = false;
      validation.errors.push('Reddit Client Secret length appears invalid');
    }
  }

  return {
    valid: validation.valid,
    error: validation.errors.join(', '),
    field: validation.valid ? null : 'credentials'
  };
}

/**
 * Validate GitHub OAuth credentials format
 * @param {string} clientId - GitHub OAuth Client ID
 * @param {string} clientSecret - GitHub OAuth Client Secret
 * @returns {Object} Validation result
 */
function validateGitHubCredentials(clientId, clientSecret) {
  const validation = {
    valid: true,
    errors: []
  };

  // Validate GitHub Client ID format (20 alphanumeric characters)
  if (clientId) {
    const githubIdRegex = /^[a-zA-Z0-9]{20}$/;
    if (!githubIdRegex.test(clientId)) {
      validation.valid = false;
      validation.errors.push('GitHub Client ID must be exactly 20 alphanumeric characters');
    }
  }

  // Validate GitHub Client Secret format (exactly 40 characters)
  if (clientSecret) {
    if (clientSecret.length !== 40) {
      validation.valid = false;
      validation.errors.push('GitHub Client Secret must be exactly 40 characters');
    }
  }

  return {
    valid: validation.valid,
    error: validation.errors.join(', '),
    field: validation.valid ? null : 'credentials'
  };
}

/**
 * Validate Dropbox OAuth credentials format
 * @param {string} clientId - Dropbox OAuth Client ID
 * @param {string} clientSecret - Dropbox OAuth Client Secret
 * @returns {Object} Validation result
 */
function validateDropboxCredentials(clientId, clientSecret) {
  const validation = {
    valid: true,
    errors: []
  };

  // Validate Dropbox Client ID format (10-20 alphanumeric characters)
  if (clientId) {
    const dropboxIdRegex = /^[a-zA-Z0-9]{10,20}$/;
    if (!dropboxIdRegex.test(clientId)) {
      validation.valid = false;
      validation.errors.push('Dropbox Client ID must be 10-20 alphanumeric characters');
    }
  }

  // Validate Dropbox Client Secret format
  if (clientSecret) {
    if (clientSecret.length < 15 || clientSecret.length > 20) {
      validation.valid = false;
      validation.errors.push('Dropbox Client Secret length appears invalid');
    }
  }

  return {
    valid: validation.valid,
    error: validation.errors.join(', '),
    field: validation.valid ? null : 'credentials'
  };
}

/**
 * Generate secure random string for OAuth operations
 * @param {number} length - Length of random string
 * @returns {string} Random string
 */
export function generateSecureRandom(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash sensitive data for logging
 * @param {string} data - Data to hash
 * @returns {string} Hashed data
 */
export function hashForLogging(data) {
  if (!data || typeof data !== 'string') {
    return 'null';
  }

  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex').substring(0, 8) + '...';
}