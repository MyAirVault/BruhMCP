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